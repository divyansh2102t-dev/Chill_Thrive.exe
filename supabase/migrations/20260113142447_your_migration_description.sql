CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  service_id UUID NOT NULL REFERENCES services(id),
  service_title TEXT NOT NULL,

  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,

  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,

  payment_method TEXT CHECK (payment_method IN ('QR', 'CASH')) NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);
