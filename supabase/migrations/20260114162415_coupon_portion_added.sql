ALTER TABLE bookings
ADD COLUMN coupon_code TEXT,
ADD COLUMN discount_amount NUMERIC(10,2) DEFAULT 0,
ADD COLUMN final_amount NUMERIC(10,2) NOT NULL;

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  code TEXT UNIQUE NOT NULL,               -- e.g. NEWUSER50
  discount_amount NUMERIC(10,2) NOT NULL,  -- flat discount in INR

  is_active BOOLEAN DEFAULT TRUE,

  -- optional future-proofing
  max_uses INTEGER,                        -- NULL = unlimited
  used_count INTEGER DEFAULT 0,

  valid_from DATE,
  valid_until DATE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);

INSERT INTO coupons (code, discount_amount)
VALUES
  ('WELCOME100', 100),
  ('NEWUSER50', 50),
  ('RECOVERY25', 25);
