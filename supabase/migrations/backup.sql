-- Functions used
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

create or replace function get_service_slots(
  query_date date,
  query_service_id uuid
) 
returns table (
  slot_id uuid,
  start_time time,
  end_time time,
  capacity int,
  booked_count bigint,
  remaining_capacity bigint,
  source text
) 
language plpgsql
as $$
begin
  return query
  with 
  -- 1. Effective Defaults (Standard or Modified)
  effective_defaults as (
    select 
      st.id as original_id,
      coalesce(se.start_time, st.start_time) as final_start,
      coalesce(se.end_time, st.end_time) as final_end,
      coalesce(se.capacity, st.capacity) as final_cap,
      coalesce(se.is_blocked, false) as is_blocked,
      'default' as origin_type,
      se.id as exception_id,
      0 as manual_booked_count -- Not used for defaults
    from slot_timings st
    left join schedule_exceptions se 
      on (st.id = se.slot_id OR st.start_time = se.start_time)
      and se.exception_date = query_date
    where st.service_id = query_service_id
      and st.is_enabled = true
  ),
  
  -- 2. Added Slots (Pure Exceptions from Schedule Exception Table)
  added_slots as (
    select 
      se.id as original_id,
      se.start_time as final_start,
      se.end_time as final_end,
      se.capacity as final_cap,
      false as is_blocked,
      'added' as origin_type,
      null::uuid as exception_id,
      coalesce(se.slots_booked, 0) as manual_booked_count -- USES slots_booked parameter
    from schedule_exceptions se
    where se.service_id = query_service_id
      and se.exception_date = query_date
      and se.is_added = true
      and se.is_blocked = false
      and se.id not in (select exception_id from effective_defaults where exception_id is not null)
  ),

  -- 3. Combine both types
  all_active_slots as (
    select * from effective_defaults where is_blocked = false
    union all
    select * from added_slots
  ),

  -- 4. Count Bookings from Bookings Table (Only relevant for Standard slots)
  standard_booking_counts as (
    select 
      b.slot_id, 
      count(*) as cnt
    from bookings b
    where b.booking_date = query_date 
      and b.status != 'cancelled'
      and b.slot_id is not null
    group by b.slot_id
  )

  -- 5. Final Calculation
  select 
    aas.original_id as slot_id,
    aas.final_start as start_time,
    aas.final_end as end_time,
    aas.final_cap as capacity,
    
    -- LOGIC: If default, count bookings table. If added, use slots_booked column.
    (case 
      when aas.origin_type = 'default' then coalesce(sbc.cnt, 0)
      else aas.manual_booked_count 
    end)::bigint as booked_count,

    -- LOGIC: Capacity minus the respective count source
    (case 
      when aas.origin_type = 'default' then (aas.final_cap - coalesce(sbc.cnt, 0))
      else (aas.final_cap - aas.manual_booked_count)
    end)::bigint as remaining_capacity,
    
    aas.origin_type as source
  from all_active_slots aas
  left join standard_booking_counts sbc on aas.original_id = sbc.slot_id
  order by aas.final_start asc;
end;
$$;

-- Tables Present
create table public.awareness (
  id uuid not null default gen_random_uuid (),
  section_key text not null,
  title text not null,
  description text null,
  benefits text[] null default '{}'::text[],
  media_url text null,
  is_active boolean not null default true,
  updated_at timestamp with time zone null default now(),
  constraint awareness_pkey primary key (id),
  constraint awareness_section_key_key unique (section_key)
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
  cold_therapy_title text null,
  cold_therapy_description text null,
  cold_therapy_benefits text[] null,
  cold_therapy_media_url text null,
  ice_bath_title text null,
  ice_bath_description text null,
  ice_bath_benefits text[] null,
  ice_bath_media_url text null,
  heat_vs_cold_title text null,
  heat_vs_cold_description text null,
  heat_vs_cold_benefits text[] null,
  heat_vs_cold_media_url text null,
  who_should_avoid_title text null,
  who_should_avoid_description text null,
  who_should_avoid_benefits text[] null,
  who_should_avoid_media_url text null,
  myths_and_facts_title text null,
  myths_and_facts_description text null,
  myths_and_facts_benefits text[] null,
  myths_and_facts_media_url text null,
  medical_disclaimer_title text null,
  medical_disclaimer_description text null,
  medical_disclaimer_benefits text[] null,
  medical_disclaimer_media_url text null,
  constraint awareness_content_pkey primary key (id)
) TABLESPACE pg_default;

create table public.blocked_dates (
  id uuid not null default gen_random_uuid (),
  blocked_date date not null,
  reason text null,
  created_at timestamp without time zone null default now(),
  constraint blocked_dates_pkey primary key (id),
  constraint blocked_dates_blocked_date_key unique (blocked_date)
) TABLESPACE pg_default;

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
  slot_id uuid null,
  duration_minutes integer not null,
  coupon_code text null,
  discount_amount numeric(10, 2) null default 0,
  final_amount numeric(10, 2) not null,
  status text null default 'pending'::text,
  amount numeric(10, 2) not null default 0,
  slot_start_time time without time zone null,
  slot_end_time time without time zone null,
  constraint bookings_pkey primary key (id),
  constraint bookings_service_id_fkey foreign KEY (service_id) references services (id) on delete set null,
  constraint bookings_slot_fk foreign KEY (slot_id) references slot_timings (id) on delete set null,
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

create table public.coupons (
  id uuid not null default gen_random_uuid (),
  code text not null,
  discount_amount numeric(10, 2) not null,
  is_active boolean null default true,
  max_uses integer null,
  used_count integer null default 0,
  valid_from timestamp without time zone null,
  valid_until timestamp without time zone null,
  created_at timestamp without time zone null default now(),
  description text null,
  discount_type text not null default 'fixed'::text,
  is_auto_apply boolean null default false,
  applicable_services uuid[] null,
  constraint coupons_pkey primary key (id),
  constraint coupons_code_key unique (code),
  constraint coupons_discount_type_check check (
    (
      discount_type = any (array['percent'::text, 'fixed'::text])
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_coupons_code on public.coupons using btree (code) TABLESPACE pg_default;

create index IF not exists idx_coupons_active on public.coupons using btree (is_active) TABLESPACE pg_default;


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
          'behind_the_scenes'::text,
          'general'::text
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

create table public.inquiries (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  full_name text not null,
  phone_number text not null,
  message text not null,
  constraint inquiries_pkey primary key (id)
) TABLESPACE pg_default;

create table public.payments (
  id uuid not null default gen_random_uuid (),
  booking_id uuid null,
  razorpay_order_id text null,
  razorpay_payment_id text not null,
  razorpay_signature text null,
  amount numeric(10, 2) not null,
  currency text null default 'INR'::text,
  status text null default 'captured'::text,
  created_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_booking_id_fkey foreign KEY (booking_id) references bookings (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.schedule_exceptions (
  id uuid not null default gen_random_uuid (),
  exception_date date not null,
  slot_id uuid null,
  service_id uuid null,
  is_blocked boolean null default false,
  is_added boolean null default false,
  created_at timestamp without time zone null default now(),
  start_time time without time zone null,
  end_time time without time zone null,
  capacity integer null,
  slots_booked integer null default 0,
  constraint schedule_exceptions_pkey primary key (id),
  constraint schedule_exceptions_service_id_fkey foreign KEY (service_id) references services (id) on delete CASCADE,
  constraint schedule_exceptions_slot_id_fkey foreign KEY (slot_id) references slot_timings (id) on delete CASCADE,
  constraint check_exception_data check (
    (
      (is_blocked = true)
      or (
        (start_time is not null)
        and (end_time is not null)
        and (capacity is not null)
      )
    )
  )
) TABLESPACE pg_default;

create table public.services (
  id uuid not null default gen_random_uuid (),
  slug text not null,
  title text not null,
  type text not null,
  media_url text not null,
  media_type text not null,
  description text not null,
  duration_minutes integer[] not null,
  benefits text[] not null,
  original_price numeric(10, 2) null,
  currency text null default 'INR'::text,
  badge text null,
  included_services text[] null,
  is_active boolean null default true,
  created_at timestamp without time zone null default now(),
  yt_url text null,
  sort_order integer null default 0,
  capacity integer not null default 1,
  prices numeric[] null default '{}'::numeric[],
  constraint services_pkey primary key (id),
  constraint services_slug_key unique (slug),
  constraint services_badge_check check (
    (
      badge = any (array['POPULAR'::text, 'BEST_VALUE'::text])
    )
  ),
  constraint services_media_type_check check (
    (
      media_type = any (array['image'::text, 'video'::text])
    )
  ),
  constraint services_type_check check (
    (type = any (array['single'::text, 'combo'::text]))
  )
) TABLESPACE pg_default;

create table public.slot_timings (
  id uuid not null default gen_random_uuid (),
  start_time time without time zone not null,
  end_time time without time zone not null,
  capacity integer not null default 1,
  is_enabled boolean null default true,
  created_at timestamp without time zone null default now(),
  service_id uuid not null,
  constraint slot_timings_pkey primary key (id),
  constraint slot_timings_service_id_fkey foreign KEY (service_id) references services (id) on delete CASCADE
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
  source_url text null,
  constraint testimonials_pkey primary key (id),
  constraint testimonials_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  ),
  constraint testimonials_type_check check ((type = any (array['text'::text, 'video'::text])))
) TABLESPACE pg_default;


-- Enable Realtime for bookings
alter publication supabase_realtime add table bookings;

-- Enable Realtime for services
alter publication supabase_realtime add table services;