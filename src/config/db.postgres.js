const { Sequelize } = require('sequelize');
const logger        = require('../utils/logger');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully");
  } catch (err) {
    console.error("PostgreSQL connection failed:", err.message);
    throw err;
  }
};

const callSP = async (query, params = []) => {
  try {
    const [result] = await sequelize.query(query, {
      replacements: params,
    });
    return result;
  } catch (err) {
    throw err;
  }
};

module.exports = { sequelize, connectPostgres, callSP };