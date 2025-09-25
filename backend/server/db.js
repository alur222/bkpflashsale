const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function getSaleData() {
  const query = 'SELECT item_id, stock_left, starts_at, ends_at FROM inventory WHERE item_id = 1';
  const result = await pool.query(query);
  return result.rows[0] || null;
}

async function getInventoryForUpdate(client, itemId) {
  const query = 'SELECT stock_left, starts_at, ends_at FROM inventory WHERE item_id = $1 FOR UPDATE';
  const result = await client.query(query, [itemId]);
  return result.rows[0] || null;
}

async function getUserPurchase(client, userId, itemId) {
  const query = 'SELECT id, created_at FROM purchases WHERE user_id = $1 AND item_id = $2';
  const result = await client.query(query, [userId, itemId]);
  return result.rows[0] || null;
}

async function createPurchase(client, userId, itemId) {
  const query = 'INSERT INTO purchases (user_id, item_id) VALUES ($1, $2) RETURNING id, created_at';
  const result = await client.query(query, [userId, itemId]);
  return result.rows[0];
}

async function decreaseStock(client, itemId) {
  const query = 'UPDATE inventory SET stock_left = stock_left - 1 WHERE item_id = $1';
  await client.query(query, [itemId]);
}

module.exports = {
  pool,
  getSaleData,
  getInventoryForUpdate,
  getUserPurchase,
  createPurchase,
  decreaseStock,
};