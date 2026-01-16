CREATE TABLE slot_timings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  start_time TIME NOT NULL,          -- e.g. 09:00
  end_time TIME NOT NULL,            -- e.g. 10:00

  capacity INTEGER NOT NULL DEFAULT 1,
  is_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

