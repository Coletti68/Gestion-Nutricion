const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '-03:00',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

module.exports = db;
