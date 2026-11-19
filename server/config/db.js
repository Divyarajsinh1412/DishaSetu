import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Fail fast when disconnected from MongoDB instead of buffering for 10000ms
mongoose.set('bufferCommands', false);

const TARGET_DB_NAME = process.env.DB_NAME || 'dishasetu_db';

/**
 * Helper to mask credentials in MongoDB URI for safe logging
 */
export const maskMongoUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
};

let isConnected = false;
let isShuttingDown = false;

// Attach persistent connection event listeners once
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log(`[MongoDB Atlas] Connected successfully to host: ${mongoose.connection.host}, database: ${mongoose.connection.name || TARGET_DB_NAME}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`[MongoDB Atlas] Connection error: ${err.message}`);
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
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!rawUri) {
    console.warn('[MongoDB Atlas] MONGO_URI / MONGODB_URI environment variable not defined. Operating with resilient in-memory fallback.');
    return null;
  }

  try {
    const conn = await mongoose.connect(rawUri, {
      dbName: TARGET_DB_NAME,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      autoIndex: true
    });

    isConnected = conn.connection.readyState === 1;
    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas] Initial connection failed: ${error.message}`);
    console.warn('[MongoDB Atlas] Server will continue running using in-memory campus fallback data.');
    return null;
  }
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

// Handle process termination signals for graceful shutdown
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
  return {
    state: states[stateCode] || 'unknown',
    connected: stateCode === 1,
    database: mongoose.connection.name || TARGET_DB_NAME,
    host: mongoose.connection.host || null
  };
};

export default connectDB;
