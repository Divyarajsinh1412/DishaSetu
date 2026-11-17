import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import connectDB, { getDbStatus } from './config/db.js';

dotenv.config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

// Mount API routes
app.use('/api', apiRoutes);

// Root route
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

// 404 handler
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
    const server = app.listen(port, async () => {
      const activePort = server.address().port;
      console.log(`========================================================`);
      console.log(` DishaSetu Server running on http://localhost:${activePort}`);
      console.log(` Institution : Presidency University Bengaluru        `);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================================`);
      await connectDB();
      resolve({ server, port: activePort });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Server] Port ${port} in use, attempting port ${port + 1}...`);
        resolve(startServer(port + 1));
      } else {
        reject(err);
      }
    });
  });
};

// Auto start if run directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startServer().catch(console.error);
}

export default app;
