require('../config/env');
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { DEFAULT_CATEGORIES } = require('../utils/constants');

const migrationsDir = path.join(__dirname, 'migrations');

async function migrate() {
  const client = await pool.connect();
  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id         SERIAL PRIMARY KEY,
        filename   VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const applied = await client.query('SELECT filename FROM _migrations');
    const appliedSet = new Set(applied.rows.map(r => r.filename));

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        logger.info(`Skipping migration: ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      logger.info(`Running migration: ${file}`);
      await client.query(sql);
      await client.query('INSERT INTO _migrations (filename) VALUES ($1)', [file]);
      logger.info(`Applied: ${file}`);
    }

    // Seed default categories
    logger.info('Seeding default categories...');
    for (const cat of DEFAULT_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (name, type, icon, is_default)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT DO NOTHING`,
        [cat.name, cat.type, cat.icon]
      );
    }

    logger.info('All migrations applied successfully');
  } catch (err) {
    logger.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
