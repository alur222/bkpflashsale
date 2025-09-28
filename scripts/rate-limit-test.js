#!/usr/bin/env node

/**
 * Focused rate limiting test
 * Tests user purchase rate limiting by firing requests rapidly with same userId
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

async function testUserRateLimit() {
  console.log('🧪 Testing user purchase rate limiting (5 capacity, 2/sec refill)...');
  console.log('');

  const userId = 'rate_test_user';
  const results = [];
  
  // Fire 10 requests as fast as possible
  console.log('🚀 Firing 10 rapid requests with same userId...');
  
  for (let i = 0; i < 10; i++) {
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE}/api/sale/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId }), // Use same userId to test rate limiting
      });
      
      const data = await response.json();
      const duration = Date.now() - start;
      
      results.push({
        request: i + 1,
        status: response.status,
        code: data.code || (data.success ? 'SUCCESS' : 'UNKNOWN'),
        retryAfter: data.retryAfter,
        duration
      });
      
      console.log(`Request ${i + 1}: ${response.status} ${data.code || (data.success ? 'SUCCESS' : '')} ${data.retryAfter ? `(retry: ${data.retryAfter}s)` : ''} (${duration}ms)`);
      
    } catch (error) {
      results.push({
        request: i + 1,
        status: 0,
        code: 'ERROR',
        error: error.message
      });
      console.log(`Request ${i + 1}: ERROR ${error.message}`);
    }
  }
  
  console.log('');
  console.log('📊 Summary:');
  const counts = {};
  results.forEach(r => {
    counts[r.code] = (counts[r.code] || 0) + 1;
  });
  
  Object.entries(counts).forEach(([code, count]) => {
    console.log(`  ${code}: ${count}`);
  });
  
  const rateLimited = results.filter(r => r.code === 'RATE_LIMITED').length;
  console.log('');
  console.log(`✅ Rate limiting ${rateLimited > 0 ? 'WORKING' : 'NOT DETECTED'} - ${rateLimited} requests rate limited`);
}

if (require.main === module) {
  testUserRateLimit()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserRateLimit };