const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { getSaleData } = require('./db');
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} with hot reload!`);
});