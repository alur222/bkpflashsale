# BKP Flash Sale

## how to run project

1. **For development with hot reload:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
   ```

## API Endpoints

- `GET /api/sale/status` - Get current sale status
- `POST /api/sale/purchase` - Purchase an item (requires `{ userId: string }`)
- `GET /api/sale/purchase/:userId` - Check user's purchase status

## Design choices and trade offs
- I designed the API to be rate-limited using a redis token bucket where 

Why pg and redis?

- PostgreSQL handles correctness with  transactions, ensuring no overselling during concurrent purchases. Redis handles performance with fast rate limiting checks that scale across multiple backend instances. This separation allows PostgreSQL to focus on data integrity while Redis provides sub-millisecond rate limit decisions.

### Rate Limiting

The system uses Redis-backed token bucket rate limiting:

- **Global per-IP**: 20 requests capacity, refills at 10/sec
- **Per-user purchases**: 5 requests capacity, refills at 2/sec

Rate limits are shared across multiple backend instances. When exceeded, returns `429 RATE_LIMITED` with `retryAfter` seconds.

## Testing

### Unit Tests can be run via docker script:
Run the test suite:
```bash
docker exec bkp-backend npm test
```

### Stress Testing can also be rUn via node js
- this will fire 500 concurrent requests with userIds that are random
- this will report the number successful requests and error counts.

Test rate limiting and concurrent purchases:
```bash
node scripts/stress.js
```

## high level digram

<img width="809" height="669" alt="image" src="https://github.com/user-attachments/assets/8e7dea15-c131-49ec-8222-d20f28738d4b" />

