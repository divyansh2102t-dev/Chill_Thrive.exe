ALTER TABLE services
ADD COLUMN yt_url TEXT;

CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
