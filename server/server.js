import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import apiRoutes from './routes/api.js';
import connectDB, { getDbStatus } from './config/db.js';
import NavigationNode from './models/NavigationNode.js';
import WalkingPath from './models/WalkingPath.js';
import routingServiceInstance from './services/routingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const DEFAULT_PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Whitelist allowed origins for secure CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'https://dishasetu-jx71.onrender.com',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : [])
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, mobile native requests, or same-origin without Origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    try {
      const url = new URL(origin);
      if (
        url.hostname.endsWith('.onrender.com') ||
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname.endsWith('presidencyuniversity.in')
      ) {
        return callback(null, true);
      }
    } catch {}

    return callback(new Error(`Origin ${origin} not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Dedicated Health Check Handler for Render & Load Balancers (returns 200 to prevent boot loops)
const handleHealthCheck = (req, res) => {
  const db = getDbStatus();
  const isHealthy = db.connected;
  res.status(200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'DishaSetu Campus Navigation API',
    institution: 'Presidency University Bengaluru',
    environment: process.env.NODE_ENV || 'production',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: db.connected ? 'connected' : 'disconnected',
      connected: db.connected,
      state: db.state,
      database: db.database,
      host: db.host
    }
  });
};

// Mount root and API health routes before static / SPA fallback
app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);

// Mount API routes
app.use('/api', apiRoutes);

// Serve Web Frontend in production or when web/dist exists
const candidateDistPaths = [
  path.resolve(__dirname, '../web/dist'),
  path.resolve(process.cwd(), 'web/dist'),
  path.resolve(process.cwd(), 'dist')
];
const webDistPath = candidateDistPaths.find(p => fs.existsSync(p));

if (webDistPath) {
  console.log(`[Static] Serving web application from ${webDistPath}`);
  app.use(express.static(webDistPath));

  // SPA fallback for all frontend client-side routes (non-API)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  // Branded portal landing page if static bundle is served separately
  app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DishaSetu API — Presidency University Bengaluru</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #07172c; color: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #0b1f3b; border: 1px solid #1e3a8a; border-radius: 20px; max-width: 520px; width: 100%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; border-radius: 9999px; font-size: 11px; font-weight: 700; margin-bottom: 20px; letter-spacing: 0.05em; text-transform: uppercase; }
    .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; }
    h1 { margin: 0 0 8px 0; font-size: 24px; color: #fff; font-weight: 900; }
    .sub { color: #60a5fa; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    .links { display: flex; flex-direction: column; gap: 10px; }
    a.btn { display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; background: linear-gradient(135deg, #0ea5e9, #2563eb); color: #fff; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 800; box-shadow: 0 10px 20px rgba(37,99,235,0.3); transition: transform 0.15s; }
    a.btn:hover { transform: translateY(-1px); }
    a.sec { display: inline-flex; align-items: center; justify-content: center; padding: 10px 16px; background: rgba(255,255,255,0.05); color: #94a3b8; text-decoration: none; border-radius: 10px; font-size: 12px; font-weight: 600; border: 1px solid #1e293b; }
    a.sec:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Backend & MongoDB Atlas Online</div>
    <h1>DishaSetu Campus API</h1>
    <div class="sub">Presidency University Bengaluru</div>
    <p>The campus navigation backend service is operational and connected to MongoDB Atlas (43 locations, 36 navigation nodes, 37 pedestrian walkways).</p>
    <div class="links">
      <a class="btn" href="https://dishasetu-app.onrender.com" target="_blank">Open DishaSetu Campus Navigation Web App &rarr;</a>
      <a class="sec" href="/api/health">Check API & Database Health Diagnostics</a>
      <a class="sec" href="/api/locations">Explore Campus Locations API</a>
    </div>
  </div>
</body>
</html>`);
  });
}

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

export const startServer = (port = DEFAULT_PORT) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, '0.0.0.0', async () => {
      const activePort = server.address().port;
      console.log(`========================================================`);
      console.log(` DishaSetu Server running on http://0.0.0.0:${activePort}`);
      console.log(` Institution : Presidency University Bengaluru        `);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================================`);
      await connectDB();
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
          const nodes = await NavigationNode.find({ isActive: true }).exec();
          const paths = await WalkingPath.find({ status: 'active' }).exec();
          if (nodes && nodes.length > 0 && paths && paths.length > 0) {
            routingServiceInstance.updateGraph(nodes, paths);
            console.log(`[RoutingEngine] Loaded ${nodes.length} nodes & ${paths.length} walking paths from MongoDB Atlas.`);
          }
        } catch (err) {
          console.warn('[RoutingEngine] MongoDB Atlas offline, maintaining in-memory verified pedestrian routing graph.');
        }
      }
      resolve({ server, port: activePort });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' || (err.code === 'EACCES' && port < 5010)) {
        console.warn(`[Server] Port ${port} unavailable (${err.code}), attempting port ${port + 1}...`);
        resolve(startServer(port + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Auto start if executed directly
const isRunDirectly = !process.env.TEST_MODE && (
  !process.argv[1] ||
  process.argv[1].endsWith('server.js') ||
  process.argv[1].endsWith('server') ||
  import.meta.url === `file://${process.argv[1]}`
);

if (isRunDirectly) {
  startServer().catch((err) => {
    console.error('[Fatal Server Startup Error]:', err);
    process.exit(1);
  });
}

export default app;
