create table public.bookings (
  id uuid not null default gen_random_uuid (),
  service_id uuid not null,
  service_title text not null,
  booking_date date not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  payment_method text not null,
  created_at timestamp without time zone null default now(),
  slot_id uuid not null,
  duration_minutes integer not null,
  coupon_code text null,
  discount_amount numeric(10, 2) null default 0,
  final_amount numeric(10, 2) not null,
  status text null default 'pending'::text,
  amount numeric(10, 2) not null default 0,
  constraint bookings_pkey primary key (id),
  constraint bookings_service_id_fkey foreign KEY (service_id) references services (id),
  constraint bookings_slot_fk foreign KEY (slot_id) references slot_timings (id) on delete RESTRICT,
  constraint bookings_payment_method_check check (
    (
      payment_method = any (array['QR'::text, 'CASH'::text])
    )
  ),
  constraint bookings_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'confirmed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;


create table public.founder_content (
  id uuid not null default gen_random_uuid (),
  founder_name text not null,
  photo_url text not null,
  story_journey text not null,
  story_vision text not null,
  story_why text not null,
  mission text not null,
  values
    text not null,
    quote text not null,
    is_active boolean not null default true,
    updated_at timestamp with time zone null default now(),
    constraint founder_content_pkey primary key (id)
) TABLESPACE pg_default;

create table public.gallery_events (
  id uuid not null default gen_random_uuid (),
  category text not null,
  title text not null,
  description text null,
  is_visible boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint gallery_events_pkey primary key (id),
  constraint gallery_events_category_check check (
    (
      category = any (
        array[
          'ice_bath'::text,
          'community_events'::text,
          'workshops'::text,
          'behind_the_scenes'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create table public.gallery_events (
  id uuid not null default gen_random_uuid (),
  category text not null,
  title text not null,
  description text null,
  is_visible boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint gallery_events_pkey primary key (id),
  constraint gallery_events_category_check check (
    (
      category = any (
        array[
          'ice_bath'::text,
          'community_events'::text,
          'workshops'::text,
          'behind_the_scenes'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create table public.gallery_images (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null,
  image_url text not null,
  sort_order integer null default 0,
  created_at timestamp with time zone null default now(),
  constraint gallery_images_pkey primary key (id),
  constraint gallery_images_event_id_fkey foreign KEY (event_id) references gallery_events (id) on delete CASCADE
) TABLESPACE pg_default;


create table public.testimonials (
  id uuid not null default gen_random_uuid (),
  type text not null,
  name text not null,
  feedback text null,
  rating integer null,
  video_url text null,
  thumbnail_url text null,
  is_visible boolean not null default true,
  created_at timestamp with time zone null default now(),
  constraint testimonials_pkey primary key (id),
  constraint testimonials_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  ),
  constraint testimonials_type_check check ((type = any (array['text'::text, 'video'::text])))
) TABLESPACE pg_default;

create table public.awareness_content (
  id uuid not null default gen_random_uuid (),
  title text not null,
  cold_therapy_intro text not null,
  ice_bath_science text not null,
  heat_vs_cold text not null,
  who_should_avoid text not null,
  myths_and_facts text not null,
  medical_disclaimer text not null,
  is_active boolean not null default true,
  updated_at timestamp with time zone null default now(),
  constraint awareness_content_pkey primary key (id)
) TABLESPACE pg_default;


CREATE OR REPLACE FUNCTION get_available_slots(target_date DATE)
RETURNS TABLE (
    id UUID,
    start_time TIME,
    end_time TIME,
    total_capacity INTEGER,
    booked_count BIGINT,
    remaining_capacity INTEGER
) AS $$
BEGIN
    -- Check if the date is blocked globally
    IF EXISTS (SELECT 1 FROM blocked_dates WHERE blocked_date = target_date) THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        st.id,
        st.start_time,
        st.end_time,
        st.capacity AS total_capacity,
        COUNT(b.id) AS booked_count,
        (st.capacity - COUNT(b.id))::INTEGER AS remaining_capacity
    FROM 
        slot_timings st
    LEFT JOIN 
        bookings b ON st.id = b.slot_id 
        AND b.booking_date = target_date 
        AND b.status != 'cancelled'
    WHERE 
        st.is_enabled = TRUE
    GROUP BY 
        st.id, st.start_time, st.end_time, st.capacity
    ORDER BY 
        st.start_time ASC;
END;
$$ LANGUAGE plpgsql;