const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config({ override: true });

// Import custom modules
const connectDB = require('./config/database');
const WebSocketService = require('./services/webSocket');
const ChangeStreamHandler = require('./utils/changeStream');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Trust Render's proxy (important for headers and rate limiting)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 4000;

// CORS allowlist (comma-separated origins in env), fallback to dev wildcard without credentials
const allowlist = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser clients (like Postman)
    if (allowlist.length === 0) return callback(null, true); // dev mode fallback
    if (allowlist.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: !!process.env.CORS_CREDENTIALS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root API info endpoint
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

// 404 handler for API
app.use('/api/*path', (req, res) => {
  res.status(404).json({
    error: 'API Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
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

    // Initialize WebSocket service attached to the HTTP server
    const websocketService = new WebSocketService({ server, pingIntervalMs: 30000 });
    websocketService.initialize();

    // Make websocket service available to routes
    app.set('websocketService', websocketService);

    // Initialize Change Stream handler
    const changeStreamHandler = new ChangeStreamHandler(db, websocketService, {
      collectionName: 'processed_documents'
    });
    await changeStreamHandler.initialize();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 HTTP server (API + WebSocket) running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
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
