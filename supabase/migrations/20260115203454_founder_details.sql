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

insert into founder_content (
  founder_name,
  photo_url,
  story_journey,
  story_vision,
  story_why,
  mission,
  values,
  quote,
  is_active
)
values (
  'Amit Sharma',
  'https://images.pexels.com/photos/34936058/pexels-photo-34936058.jpeg',
  'My journey into recovery and wellness began after experiencing repeated burnout and physical fatigue. Traditional fitness routines ignored recovery, which pushed me to explore science-backed methods like cold exposure and breathwork.',
  'I envision Chill Thrive as a space where recovery is treated as seriously as training. A place where people can reset physically and mentally through structured, evidence-based recovery practices.',
  'Chill Thrive exists to bridge the gap between high-performance lifestyles and sustainable well-being. Recovery should not be a luxury, but a consistent practice accessible to everyone.',
  'To build a community-first recovery ecosystem that prioritizes long-term health, resilience, and performance.',
  'Integrity, consistency, scientific thinking, and community-driven growth.',
  'Recovery is not rest. It is deliberate, structured, and transformative.',
  true
);
