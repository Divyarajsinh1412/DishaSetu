import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const TARGET_DB_NAME = process.env.DB_NAME || 'dishasetu_db';

/**
 * Safely masks credentials in MongoDB URI for logs and diagnostics
 */
export const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

let isConnected = false;
let isShuttingDown = false;
let connectionPromise = null;

// Attach persistent connection event listeners once
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log(`[MongoDB Atlas] Connected successfully to host: ${mongoose.connection.host}, database: ${mongoose.connection.name || TARGET_DB_NAME}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Atlas] Connection error: ${err.message}`);
  if (err.message && (err.message.includes('alert number 80') || err.message.includes('SSL') || err.message.includes('tlsv1'))) {
    console.error('[MongoDB Atlas Tip] SSL Alert 80 detected. This indicates MongoDB Atlas dropped the TLS handshake because the client IP is not in Atlas Network Access. Add 0.0.0.0/0 (Allow Access from Anywhere) in MongoDB Atlas -> Security -> Network Access.');
  }
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  if (!isShuttingDown) {
    console.warn('[MongoDB Atlas] Disconnected from cluster. Reconnection will be attempted automatically.');
  }
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB Atlas] Reconnected to cluster successfully.');
});

/**
 * Centralized MongoDB Atlas connection initializer
 */
export const connectDB = async () => {
  // Return existing active connection
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  // If already connecting, return the existing in-flight promise
  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!rawUri) {
    console.warn('[MongoDB Atlas] Neither MONGODB_URI nor MONGO_URI is defined. Backend running with read-only verified campus dataset.');
    return null;
  }

  const maskedUri = maskMongoUri(rawUri);
  console.log(`[MongoDB Atlas] Initiating connection to cluster: ${maskedUri}`);

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(rawUri, {
        dbName: TARGET_DB_NAME,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4, // Prefer IPv4 for consistent cloud container DNS resolution
        retryWrites: true,
        maxPoolSize: 10,
        minPoolSize: 1,
        autoIndex: process.env.NODE_ENV !== 'production'
      });

      isConnected = conn.connection.readyState === 1;
      return conn;
    } catch (error) {
      isConnected = false;
      console.error(`[MongoDB Atlas] Initial connection failed: ${error.message}`);
      if (error.message && (error.message.includes('alert number 80') || error.message.includes('whitelist') || error.message.includes('SSL') || error.message.includes('timed out'))) {
        console.error('[MongoDB Atlas Configuration Guide] To resolve Atlas SSL Alert 80 / IP whitelist errors on Render:');
        console.error('1. Log in to cloud.mongodb.com');
        console.error('2. Navigate to: Security -> Network Access');
        console.error('3. Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0)');
        console.error('4. Confirm changes and save.');
      }
      console.warn('[MongoDB Atlas] Read requests will serve verified campus fallback geometry. Write operations will be rejected until MongoDB is connected.');
      return null;
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};

/**
 * Graceful database connection shutdown
 */
export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      isShuttingDown = true;
      await mongoose.connection.close(false);
      console.log('[MongoDB Atlas] Connection closed gracefully.');
    } catch (err) {
      console.error('[MongoDB Atlas] Error during connection shutdown:', err.message);
    }
  }
};

// Process termination signal handlers
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeDB();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeDB();
    process.exit(0);
  });
}

/**
 * Returns safe database connection status without exposing credentials
 */
export const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const stateCode = mongoose.connection.readyState;
  const isConn = stateCode === 1;
  return {
    status: isConn ? 'connected' : 'disconnected',
    state: states[stateCode] || 'unknown',
    connected: isConn,
    database: mongoose.connection.name || TARGET_DB_NAME,
    host: mongoose.connection.host || null
  };
};

export default connectDB;
