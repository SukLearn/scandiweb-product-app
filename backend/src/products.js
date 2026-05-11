const { Router } = require('express');
const { pool } = require('./db');

const router = Router();
const TYPES = new Set(['DVD', 'Book', 'Furniture']);

function isPresent(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function toPositiveNumber(value) {
  if (!isPresent(value)) return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : NaN;
}

function validateProduct(body) {
  const sku = isPresent(body.sku) ? String(body.sku).trim() : '';
  const name = isPresent(body.name) ? String(body.name).trim() : '';
  const type = isPresent(body.type) ? String(body.type).trim() : '';
  const price = toPositiveNumber(body.price);

  if (!sku || !name || !isPresent(body.price) || !type) {
    return { message: 'Please, submit required data' };
  }

  if (!TYPES.has(type) || Number.isNaN(price)) {
    return { message: 'Please, provide the data of indicated type' };
  }

  const product = {
    sku,
    name,
    type,
    price,
    size: null,
    weight: null,
    height: null,
    width: null,
    length: null,
  };

  if (type === 'DVD') {
    if (!isPresent(body.size)) return { message: 'Please, submit required data' };
    product.size = toPositiveNumber(body.size);
    if (Number.isNaN(product.size)) return { message: 'Please, provide the data of indicated type' };
  }

  if (type === 'Book') {
    if (!isPresent(body.weight)) return { message: 'Please, submit required data' };
    product.weight = toPositiveNumber(body.weight);
    if (Number.isNaN(product.weight)) return { message: 'Please, provide the data of indicated type' };
  }

  if (type === 'Furniture') {
    const missingDimension = !isPresent(body.height) || !isPresent(body.width) || !isPresent(body.length);
    if (missingDimension) return { message: 'Please, submit required data' };

    product.height = toPositiveNumber(body.height);
    product.width = toPositiveNumber(body.width);
    product.length = toPositiveNumber(body.length);

    if ([product.height, product.width, product.length].some(Number.isNaN)) {
      return { message: 'Please, provide the data of indicated type' };
    }
  }

  return { product };
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, sku, name, price, type, size, weight, height, width, length
      FROM products
      ORDER BY id ASC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const validation = validateProduct(req.body);
    if (validation.message) {
      return res.status(400).json({ message: validation.message });
    }

    const { product } = validation;
    const { rows } = await pool.query(
      `
        INSERT INTO products (sku, name, price, type, size, weight, height, width, length)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, sku, name, price, type, size, weight, height, width, length
      `,
      [
        product.sku,
        product.name,
        product.price,
        product.type,
        product.size,
        product.weight,
        product.height,
        product.width,
        product.length,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'SKU already exists' });
    }

    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const skus = Array.isArray(req.body.skus) ? req.body.skus : [];
    const cleanSkus = skus.map((sku) => String(sku).trim()).filter(Boolean);

    if (cleanSkus.length === 0) {
      return res.json({ deleted: 0 });
    }

    const { rowCount } = await pool.query('DELETE FROM products WHERE sku = ANY($1::text[])', [cleanSkus]);
    res.json({ deleted: rowCount });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
