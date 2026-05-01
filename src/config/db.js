const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected PostgreSQL pool error', err);
});

// Helper: run a query
const query = (text, params) => pool.query(text, params);

// Helper: get a client for transactions
const getClient = () => pool.connect();

// Test connection on startup
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    logger.info('PostgreSQL connected successfully');
  } finally {
    client.release();
  }
};

module.exports = { query, getClient, testConnection, pool };