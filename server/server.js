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
const webDistPath = path.resolve(__dirname, '../web/dist');

if (fs.existsSync(webDistPath)) {
  console.log(`[Static] Serving web application from ${webDistPath}`);
  app.use(express.static(webDistPath));

  // SPA fallback for all frontend client-side routes (non-API)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  // Fallback API root route if web/dist is not present
  app.get('/', (req, res) => {
    res.json({
      name: 'DishaSetu API',
      tagline: 'Your Campus. Your Direction. Your Way.',
      institution: 'Presidency University, Bengaluru, Karnataka, India',
      endpoints: {
        health: '/api/health',
        campus: '/api/campus',
        features: '/api/features',
        locations: '/api/locations',
        routes: '/api/routes',
        buildings: '/api/buildings',
        departments: '/api/departments',
        approvals: '/api/approvals',
        syncStream: '/api/sync/stream',
        emergency: '/api/emergency/directory'
      },
      database: getDbStatus()
    });
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
