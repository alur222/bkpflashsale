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

module.exports = {
  pool,
  getSaleData
};