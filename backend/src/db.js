const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'production',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(80) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
      type VARCHAR(20) NOT NULL CHECK (type IN ('DVD', 'Book', 'Furniture')),
      size NUMERIC(10, 2),
      weight NUMERIC(10, 2),
      height NUMERIC(10, 2),
      width NUMERIC(10, 2),
      length NUMERIC(10, 2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { pool, initDb };
