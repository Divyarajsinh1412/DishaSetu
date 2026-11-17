import http from 'http';
import mongoose from 'mongoose';
import app, { startServer } from '../server.js';
import { getDbStatus, closeDB } from '../config/db.js';

const TEST_PORT = 5199;

async function runTest() {
  console.log('--- DishaSetu MongoDB Atlas Connection Test ---');
  
  let serverInstance = null;
  try {
    const started = await startServer(TEST_PORT);
    serverInstance = started.server;
    const activePort = started.port;

    // Check DB Status object
    const dbStatus = getDbStatus();
    console.log('[Test] Internal DB Status:', JSON.stringify(dbStatus));

    // Ping MongoDB Atlas directly via Mongoose
    if (mongoose.connection.readyState === 1) {
      const pingResult = await mongoose.connection.db.admin().ping();
      console.log('[Test] MongoDB Atlas Ping Result:', JSON.stringify(pingResult));
    } else {
      console.error('[Test] Mongoose is not in connected state. ReadyState:', mongoose.connection.readyState);
    }

    // Probe the public HTTP /api/health endpoint
    const healthResponse = await new Promise((resolve, reject) => {
      http.get(`http://127.0.0.1:${activePort}/api/health`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }).on('error', reject);
    });

    console.log('[Test] HTTP GET /api/health Status Code:', healthResponse.status);
    console.log('[Test] HTTP GET /api/health Response Body:', JSON.stringify(healthResponse.data, null, 2));

    // Verification asserts
    if (healthResponse.status === 200 && healthResponse.data?.database?.connected === true) {
      console.log('\n[SUCCESS] MongoDB Atlas cluster connected and verified!');
      console.log(`[SUCCESS] Database Name: ${healthResponse.data.database.database}`);
      console.log(`[SUCCESS] Cluster Host: ${healthResponse.data.database.host}`);
    } else {
      console.error('\n[FAILURE] Health check did not report a connected database.');
    }

  } catch (err) {
    console.error('[Test] Unhandled error during connection test:', err.message);
  } finally {
    if (serverInstance) {
      await new Promise(resolve => serverInstance.close(resolve));
      console.log('[Test] HTTP server closed.');
    }
    await closeDB();
    console.log('[Test] MongoDB connection closed.');
    process.exit(0);
  }
}

runTest();
