const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const {
  pool,
  getSaleData,
  getInventoryForUpdate,
  getUserPurchase,
  createPurchase,
  decreaseStock,
  getUserPurchaseStatus,
} = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// app.use(morgan('combined'));
app.use(express.json());

function computeStatus(now, startsAt, endsAt, stockLeft) {
  const currentTime = new Date(now);
  const startTime = new Date(startsAt);
  const endTime = new Date(endsAt);
  
  if (stockLeft <= 0) {
    return 'sold_out';
  }
  
  if (currentTime < startTime) {
    return 'upcoming';
  }
  
  if (currentTime > endTime) {
    return 'ended';
  }
  
  return 'active';
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/sale/status', async (req, res) => {
  try {
    const saleData = await getSaleData();
    
    if (!saleData) {
      return res.status(404).json({ error: 'Sale data not found.' });
    }
    
    const { stock_left, starts_at, ends_at } = saleData;
    const now = new Date();
    
    const status = computeStatus(now, starts_at, ends_at, stock_left);
    
    res.json({
      status,
      startsAt: starts_at,
      endsAt: ends_at,
      remaining: stock_left
    });
  } catch (error) {
    console.error('Error fetching sale status:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/api/sale/purchase', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const inventory = await getInventoryForUpdate(client, 1);
    if (!inventory) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Item not found' });
    }

    const { stock_left, starts_at, ends_at } = inventory;
    const now = new Date();
    const status = computeStatus(now, starts_at, ends_at, stock_left);

    if (status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(403).json({ code: 'SALE_NOT_ACTIVE' });
    }

    const existingPurchase = await getUserPurchase(client, userId, 1);
    if (existingPurchase) {
      await client.query('ROLLBACK');
      return res.status(409).json({ code: 'ALREADY_PURCHASED' });
    }

    if (stock_left <= 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ code: 'SOLD_OUT' });
    }

    const purchase = await createPurchase(client, userId, 1);
    await decreaseStock(client, 1);

    await client.query('COMMIT');

    res.json({
      success: true,
      purchasedAt: purchase.created_at
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.get('/api/sale/purchase/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const purchase = await getUserPurchaseStatus(userId, 1);
    
    if (purchase) {
      res.json({
        purchased: true,
        at: purchase.created_at
      });
    } else {
      res.json({
        purchased: false
      });
    }
  } catch (error) {
    console.error('Error fetching purchase status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with hot reload!`);
});