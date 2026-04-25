const mongoose = require('mongoose');
const logger   = require('../utils/logger');

// const connectMongo = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000,  // fail fast if Mongo unreachable
//       socketTimeoutMS:          45000,
//       maxPoolSize:              10,
//       minPoolSize:              2,
//     });
//     logger.info('MongoDB connected successfully');
//   } catch (err) {
//     logger.error('MongoDB connection failed:', err.message);
//     throw err; // bubble up to app.js — server will not start
//   }
// };


let db;

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  return new Promise((resolve, reject) => {
    mongoose.connection.once('open', () => {
      db = mongoose.connection.db;
      console.log('✅ MongoDB connected');
      resolve();
    });

    mongoose.connection.on('error', (err) => {
      reject(err);
    });
  });
};

const getDb = () => {
  if (!db) {
    throw new Error('MongoDB not initialized');
  }
  return db;
};
// ── Connection event listeners ────────────────────────
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected — attempting reconnect...');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err.message);
});

module.exports = { connectMongo, getDb };
