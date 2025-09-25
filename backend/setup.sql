-- Create inventory table
CREATE TABLE inventory (
  item_id INT PRIMARY KEY,
  stock_left INT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL
);

-- Seed with configurable data
-- Modify the dates and stock as needed
INSERT INTO inventory (item_id, stock_left, starts_at, ends_at) VALUES (
  1, 
  100, 
  NOW() + INTERVAL '1 hour',  -- Sale starts in 1 hour
  NOW() + INTERVAL '25 hours' -- Sale ends in 25 hours (24 hour duration)
);

-- Alternative seed examples (uncomment one as needed):
-- Active sale: starts_at = NOW() - INTERVAL '1 hour', ends_at = NOW() + INTERVAL '23 hours'
-- Ended sale: starts_at = NOW() - INTERVAL '25 hours', ends_at = NOW() - INTERVAL '1 hour'
-- Sold out: stock_left = 0