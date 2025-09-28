const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function createRateLimiter(keyPrefix, capacity, refillRate, keyGenerator) {
  return async (req, res, next) => {
    try {
      const key = `rate_limit:${keyPrefix}:${keyGenerator(req)}`;
      const now = Date.now();
      
      const multi = redis.multi();
      multi.hmget(key, 'tokens', 'lastRefill');
      // 1 hour expiry
      multi.expire(key, 3600); 
      
      const [[, result]] = await multi.exec();
      const [tokensStr, lastRefillStr] = result || [null, null];
      
      let tokens = tokensStr ? parseFloat(tokensStr) : capacity;
      const lastRefill = lastRefillStr ? parseInt(lastRefillStr) : now;
      
      const timePassed = (now - lastRefill) / 1000; // this is in seconds now after dividing by 1000
      tokens = Math.min(capacity, tokens + timePassed * refillRate);
      
      if (tokens >= 1) {
        tokens -= 1;
        
        await redis.hmset(key, 'tokens', tokens.toFixed(3), 'lastRefill', now);
        next();
      } else {
        const tokensNeeded = 1 - tokens;
        const retryAfter = Math.ceil(tokensNeeded / refillRate);
        
        res.status(429).json({
          code: 'RATE_LIMITED',
          retryAfter
        });
      }
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
}

const globalRateLimit = createRateLimiter(
  'ip',
  20,
  10,
  (req) => req.ip || req.connection.remoteAddress
);

const userPurchaseRateLimit = createRateLimiter(
  'user_purchase',
  5,
  2,
  (req) => req.body.userId || 'anonymous'
);

module.exports = {
  globalRateLimit,
  userPurchaseRateLimit,
  redis
};