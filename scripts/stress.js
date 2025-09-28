const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 500;

async function purchaseItem(userId) {
  try {
    const response = await fetch(`${API_BASE}/api/sale/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    const data = await response.json();
    return {
      status: response.status,
      code: data.code || 'SUCCESS',
      userId
    };
  } catch (error) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      error: error.message,
      userId
    };
  }
}

function generateRandomUserId() {
  return `user_${Math.floor(Math.random() * 100)}`;
}

async function runStressTest() {
  console.log(`🚀 Starting stress test with ${CONCURRENT_REQUESTS} concurrent requests...`);
  console.log(`📡 Target: ${API_BASE}/api/sale/purchase`);
  console.log('');
  
  const startTime = Date.now();
  
  const requests = Array.from({ length: CONCURRENT_REQUESTS }, () => {
    const userId = generateRandomUserId();
    return purchaseItem(userId);
  });
  
  const results = await Promise.all(requests);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  const counts = {};
  results.forEach(result => {
    const key = result.code;
    counts[key] = (counts[key] || 0) + 1;
  });
  
  console.log('📊 Results Summary:');
  console.log('==================');
  Object.entries(counts).forEach(([code, count]) => {
    const percentage = ((count / CONCURRENT_REQUESTS) * 100).toFixed(1);
    console.log(`${code.padEnd(20)}: ${count.toString().padStart(3)} (${percentage}%)`);
  });
  console.log('');
  console.log(`⏱️  Total time: ${duration}ms`);
  console.log(`⚡ Requests/sec: ${(CONCURRENT_REQUESTS / (duration / 1000)).toFixed(1)}`);
  console.log('');
  
  const uniqueCodes = [...new Set(results.map(r => r.code))];
  console.log('🔍 Example responses:');
  uniqueCodes.forEach(code => {
    const example = results.find(r => r.code === code);
    console.log(`  ${code}: HTTP ${example.status} for userId "${example.userId}"`);
  });
  
  return counts;
}

if (require.main === module) {
  runStressTest()
    .then(() => {
      console.log('\n✅ Stress test completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Stress test failed:', error);
      process.exit(1);
    });
}

module.exports = { runStressTest };