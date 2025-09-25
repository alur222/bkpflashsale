const request = require('supertest');
const { pool } = require('../server/db');

process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // turns out this was the issue. I had to set a different port for tests

const app = require('../server/index');

beforeAll(async () => {
  await pool.query('DELETE FROM purchases WHERE item_id = 1');
  await pool.query('UPDATE inventory SET stock_left = 10 WHERE item_id = 1');
});

afterAll(async () => {
  await pool.query('DELETE FROM purchases WHERE item_id = 1');
  await pool.end();
});

describe('Purchase API -', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM purchases WHERE item_id = 1');
    await pool.query(`
      UPDATE inventory 
      SET stock_left = 10,
          starts_at = NOW() - INTERVAL '1 hour',
          ends_at = NOW() + INTERVAL '1 hour'
      WHERE item_id = 1
    `);
  });

  describe('POST /api/sale/purchase', () => {
    test('should successfully purchase when sale is active', async () => {
      const response = await request(app)
        .post('/api/sale/purchase')
        .send({ userId: 'user1' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        purchasedAt: expect.any(String)
      });
    });

    test('should return 409 ALREADY_PURCHASED for duplicate purchase', async () => {
      await request(app)
        .post('/api/sale/purchase')
        .send({ userId: 'user1' });

      const response = await request(app)
        .post('/api/sale/purchase')
        .send({ userId: 'user1' });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('ALREADY_PURCHASED');
    });

    test('should return 409 SOLD_OUT when stock is depleted', async () => {
      await pool.query(`
        UPDATE inventory 
        SET stock_left = 2, 
            starts_at = NOW() - INTERVAL '1 hour', 
            ends_at = NOW() + INTERVAL '1 hour' 
        WHERE item_id = 1
      `);

      await request(app).post('/api/sale/purchase').send({ userId: 'user1' }); // 1 stock left
      await request(app).post('/api/sale/purchase').send({ userId: 'user2' }); // 0 stock left

      const response = await request(app)
        .post('/api/sale/purchase')
        .send({ userId: 'user3' });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('SOLD_OUT');
    });

    test('should handle 50 parallel requests with only one success per user', async () => {
      const userId = 'parallel-user';
      
      const promises = Array(50).fill().map(() =>
        request(app)
          .post('/api/sale/purchase')
          .send({ userId })
      );

      const responses = await Promise.all(promises);
      
      const successful = responses.filter(r => r.status === 200);
      const alreadyPurchased = responses.filter(r => r.status === 409 && r.body.code === 'ALREADY_PURCHASED');

      expect(successful).toHaveLength(1);
      expect(alreadyPurchased).toHaveLength(49);
    });

    test('should return 403 SALE_NOT_ACTIVE when sale has ended', async () => {
      await pool.query(
        'UPDATE inventory SET ends_at = NOW() - INTERVAL \'1 hour\' WHERE item_id = 1'
      );

      const response = await request(app)
        .post('/api/sale/purchase')
        .send({ userId: 'user1' });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('SALE_NOT_ACTIVE');
    });

    test('should return 400 when userId is missing', async () => {
      const response = await request(app)
        .post('/api/sale/purchase')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId is required');
    });
  });

  describe('GET /api/sale/purchase/:userId', () => {
    test('should return purchased: false for user who has not purchased', async () => {
      const response = await request(app)
        .get('/api/sale/purchase/user1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ purchased: false });
    });

    test('should return purchased: true with timestamp for user who has purchased', async () => {
      await request(app)
        .post('/api/sale/purchase')
        .send({ userId: 'user1' });

      const response = await request(app)
        .get('/api/sale/purchase/user1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        purchased: true,
        at: expect.any(String)
      });
    });
  });
});