const WebSocket = require('ws');

class WebSocketService {
  constructor({ port, server, pingIntervalMs = 30000 }) {
    // Either bind to a standalone port or attach to an existing HTTP/S server
    this.port = port || null;
    this.server = server || null; // http.Server for upgrade integration
    this.pingIntervalMs = pingIntervalMs;

    this.clients = new Set();
    this.wss = null;
    this.heartbeatTimer = null;
  }

  initialize() {
    // Prefer attaching to existing HTTP/S server when provided (production-friendly)
    if (this.server) {
      this.wss = new WebSocket.Server({ server: this.server });
    } else {
      this.wss = new WebSocket.Server({ port: this.port });
    }
    console.log(
      `🔌 WebSocket server running ${this.server ? 'via HTTP server' : `on port ${this.port}`}`
    );

    const heartbeat = () => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          try {
            ws.terminate();
          } catch {}
          return;
        }
        ws.isAlive = false;
        try {
          ws.ping();
        } catch {}
      });
    };

    this.wss.on('connection', (ws) => {
      // Mark alive and set pong listener for heartbeat
      ws.isAlive = true;
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Track client
      this.clients.add(ws);
      console.log('👤 New client connected');

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log('👤 Client disconnected');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.sendJSON(ws, {
        type: 'connection',
        message: 'Connected to real-time updates',
        timestamp: new Date().toISOString()
      });
    });

    // Start heartbeat to detect broken connections
    this.heartbeatTimer = setInterval(heartbeat, this.pingIntervalMs); // server-side ping/pong [5][1]

    // Clean interval on server close
    this.wss.on('close', () => {
      if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    });

    return this.wss;
  }

  // Safe JSON sender
  sendJSON(ws, payload) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to send JSON over WebSocket:', e);
    }
  }

  // Broadcast to all clients; optionally exclude a specific sender
  broadcast(message, { exclude } = {}) {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);

    this.clients.forEach((client) => {
      if (exclude && client === exclude) return;
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageString);
        } catch (e) {
          console.error('Broadcast send error:', e);
        }
      }
    });
  } // broadcasting pattern per ws docs/examples [5][12]

  // Count connected clients
  getConnectedClientsCount() {
    return this.clients.size;
  }

  // Graceful shutdown
  async close() {
    if (!this.wss) return;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);

    // Close all client connections
    for (const ws of this.clients) {
      try {
        ws.close(1001, 'Server shutting down');
      } catch {}
    }
    this.clients.clear();

    // Close server
    await new Promise((resolve) => this.wss.close(resolve));
  }
}

module.exports = WebSocketService;
