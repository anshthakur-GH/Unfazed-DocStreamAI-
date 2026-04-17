const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ override: true });

// Import custom modules
const connectDB = require('./config/database');
const WebSocketService = require('./services/webSocket');
const ChangeStreamHandler = require('./utils/changeStream');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Trust Render's proxy
app.set('trust proxy', 1);

const PORT = process.env.PORT || 4000;

// CORS allowlist (comma-separated origins in env), fallback to dev wildcard without credentials
const allowlist = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser clients
    if (allowlist.length === 0) return callback(null, true); // dev mode fallback
    if (allowlist.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: !!process.env.CORS_CREDENTIALS, // only enable when origins are restricted
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // safer CORS configuration [7][13]

app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Serve static files from the React app
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Root API info endpoint (moved to /api)
app.get('/api', (req, res) => {
  res.json({
    message: 'Real-time MongoDB API Server',
    version: '1.0.0',
    endpoints: {
        health: '/api/health',
        data: '/api/data',
        recent: '/api/data/recent',
        department: '/api/data/department/:name',
        statsData: '/api/stats/data',
        statsConnections: '/api/stats/connections'
    },
    websocket: `${req.protocol === 'https' ? 'wss' : 'ws'}://${req.headers.host}`
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/:splat*', (req, res) => {
  // If the request starts with /api, it shouldn't be handled by the catchall if it reached here (means 404)
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'API Endpoint not found',
      path: req.originalUrl
    });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global error handler (after routes)
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function initializeServer() {
  try {
    // Connect to MongoDB
    const db = await connectDB();

    // Initialize WebSocket service attached to the HTTP server (single port)
    const websocketService = new WebSocketService({ server, pingIntervalMs: 30000 });
    websocketService.initialize();

    // Make websocket service available to routes
    app.set('websocketService', websocketService);

    // Initialize Change Stream handler (with resume support from updated util)
    const changeStreamHandler = new ChangeStreamHandler(db, websocketService, {
      collectionName: 'processed_documents'
    });
    await changeStreamHandler.initialize();

    // Start HTTP server (serves both API and WebSocket upgrades)
    server.listen(PORT, () => {
      console.log(`🚀 HTTP server (API + WebSocket) running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket available at ws://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`👋 ${signal} received, shutting down gracefully`);
      try {
        await changeStreamHandler.close();
      } catch {}
      try {
        await websocketService.close();
      } catch {}
      server.close(() => process.exit(0));
      // Force exit after timeout
      setTimeout(() => process.exit(0), 5000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    process.exit(1);
  }
}

// Start the server
initializeServer();
