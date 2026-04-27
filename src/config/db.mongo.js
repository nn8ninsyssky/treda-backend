const mongoose = require('mongoose');
const logger   = require('../utils/logger');
let db;

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  //  Immediately assign db
 // db = mongoose.connection.db;
db = mongoose.connection.client.db("treda_mongo");
  console.log('MongoDB connected');
  console.log("Connected DB:", db.databaseName);
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
mongoose.connection.on('connected', () => {
  console.log('Mongo connected event');
});
mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err.message);
});

module.exports = { connectMongo, getDb };
