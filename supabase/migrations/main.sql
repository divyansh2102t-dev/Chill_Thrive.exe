CREATE TABLE admin_lock (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  admin_email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- enforce single row
INSERT INTO admin_lock (id, admin_email)
VALUES (TRUE, 'admin@yourdomain.com');


CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,

  type TEXT CHECK (type IN ('single', 'combo')) NOT NULL,

  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) NOT NULL,

  description TEXT NOT NULL,

  duration_minutes INTEGER[] NOT NULL,

  benefits TEXT[] NOT NULL,

  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),

  currency TEXT DEFAULT 'INR',

  badge TEXT CHECK (badge IN ('POPULAR', 'BEST_VALUE')),

  included_services TEXT[],

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE services
ADD COLUMN yt_url TEXT;


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

ALTER TABLE bookings
ADD COLUMN duration_minutes INTEGER NOT NULL;

ALTER TABLE bookings
ADD COLUMN slot_id UUID NOT NULL,
ADD COLUMN duration_minutes INTEGER NOT NULL;

ALTER TABLE bookings
DROP COLUMN booking_time;

ALTER TABLE bookings
ADD CONSTRAINT bookings_slot_fk
FOREIGN KEY (slot_id)
REFERENCES slot_timings(id)
ON DELETE RESTRICT;

CREATE TABLE slot_timings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  capacity INTEGER NOT NULL CHECK (capacity > 0),
  is_enabled BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

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

create table testimonials (
  id uuid primary key default gen_random_uuid(),

  type text not null check (type in ('text', 'video')),

  name text not null,

  feedback text,

  rating int check (rating between 1 and 5),

  video_url text,
  thumbnail_url text,

  is_visible boolean not null default true,

  created_at timestamp with time zone default now()
);

create table gallery_events (
  id uuid primary key default gen_random_uuid(),

  category text not null
    check (category in (
      'ice_bath',
      'community_events',
      'workshops',
      'behind_the_scenes'
    )),

  title text not null,
  description text,

  is_visible boolean not null default true,

  created_at timestamp with time zone default now()
);

create table gallery_images (
  id uuid primary key default gen_random_uuid(),

  event_id uuid not null
    references gallery_events(id)
    on delete cascade,

  image_url text not null,

  sort_order int default 0,

  created_at timestamp with time zone default now()
);

create table founder_content (
  id uuid primary key default gen_random_uuid(),

  founder_name text not null,

  photo_url text not null,

  story_journey text not null,
  story_vision text not null,
  story_why text not null,

  mission text not null,
  values text not null,

  quote text not null,

  is_active boolean not null default true,

  updated_at timestamp with time zone default now()
);

create table awareness_content (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  cold_therapy_intro text not null,
  ice_bath_science text not null,
  heat_vs_cold text not null,
  who_should_avoid text not null,
  myths_and_facts text not null,

  medical_disclaimer text not null,

  is_active boolean not null default true,

  updated_at timestamp with time zone default now()
);
