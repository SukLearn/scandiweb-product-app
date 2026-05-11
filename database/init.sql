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
