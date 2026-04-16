const { Sequelize } = require('sequelize');
const logger        = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host:    process.env.PG_HOST     || 'localhost',
    port:    process.env.PG_PORT     || 5432,
    dialect: 'postgres',

    logging: process.env.NODE_ENV === 'development'
      ? (msg) => logger.info(msg)
      : false,

    pool: {
      max:     10,   // max connections in pool
      min:     2,    // min connections kept alive
      acquire: 30000, // ms to wait before throwing error
      idle:    10000, // ms a connection can be idle before release
    },

    dialectOptions: {
      ssl: process.env.PG_SSL === 'true'
        ? { require: true, rejectUnauthorized: false }
        : false,
    },

    define: {
      underscored:   true,   // use snake_case column names
      freezeTableName: true, // don't pluralise table names
      timestamps:    false,  // your tables manage timestamps manually
    },
  }
);

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    logger.info('PostgreSQL connected successfully');
  } catch (err) {
    logger.error('PostgreSQL connection failed:', err.message);
    throw err; // bubble up to app.js — server will not start
  }
};

module.exports = {sequelize,connectPostgres};
// module.exports.sequelize = sequelize; // export instance for models