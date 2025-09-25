CREATE TABLE inventory (
  item_id INT PRIMARY KEY,
  stock_left INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  item_id INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO inventory (item_id, stock_left, starts_at, ends_at) VALUES (
  1, 
  100, 
  NOW() - INTERVAL '1 hour',  -- I have to adjust this so we can start purchasing immediately
  NOW() + INTERVAL '25 hours' -- Sale ends in 25 hours (24 hour duration)
);

-- Alternative seed examples (uncomment one as needed):
-- Active sale: starts_at = NOW() - INTERVAL '1 hour', ends_at = NOW() + INTERVAL '23 hours'
-- Ended sale: starts_at = NOW() - INTERVAL '25 hours', ends_at = NOW() - INTERVAL '1 hour'
-- Sold out: stock_left = 0