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

insert into testimonials
(type, name, feedback, rating, video_url, thumbnail_url, is_visible)
values
-- ---------- TEXT TESTIMONIALS ----------
(
  'text',
  'Aarav Mehta',
  'The ice bath sessions noticeably improved my recovery after workouts. Clean setup and professional guidance.',
  5,
  null,
  null,
  true
),
(
  'text',
  'Riya Shah',
  'Very calming experience. Steam and cold exposure combination really helped with muscle soreness.',
  4,
  null,
  null,
  true
),
(
  'text',
  'Kunal Patel',
  'Good concept and well-maintained space, but peak hour availability can improve.',
  3,
  null,
  null,
  false
),

-- ---------- VIDEO TESTIMONIALS ----------
(
  'video',
  'Neha Desai',
  null,
  null,
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  null,
  true
),
(
  'video',
  'Rohit Verma',
  null,
  null,
  'https://player.vimeo.com/video/76979871',
  null,
  true
),
(
  'video',
  'Ankit Jain',
  null,
  null,
  'https://www.youtube.com/embed/9bZkp7q19f0',
  null,
  false
);
