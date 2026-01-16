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

insert into gallery_events (id, category, title, description, is_visible)
values
(
  '11111111-1111-1111-1111-111111111111',
  'ice_bath',
  'Ice Bath Recovery Sessions',
  'Cold exposure sessions focused on recovery, resilience, and performance.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  'community_events',
  'Chill Thrive Community Meetup',
  'Wellness-driven community gatherings promoting consistency and connection.',
  true
);

insert into gallery_images (event_id, image_url, sort_order)
values
('11111111-1111-1111-1111-111111111111',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 1),
('11111111-1111-1111-1111-111111111111',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 2),
('11111111-1111-1111-1111-111111111111',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 3),
('11111111-1111-1111-1111-111111111111',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 4);

insert into gallery_images (event_id, image_url, sort_order)
values
('22222222-2222-2222-2222-222222222222',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 1),
('22222222-2222-2222-2222-222222222222',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 2),
('22222222-2222-2222-2222-222222222222',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 3),
('22222222-2222-2222-2222-222222222222',
 'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
 4);
