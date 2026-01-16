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


insert into awareness_content (
  title,
  cold_therapy_intro,
  ice_bath_science,
  heat_vs_cold,
  who_should_avoid,
  myths_and_facts,
  medical_disclaimer,
  is_active
)
values (
  'Cold Therapy & Recovery Awareness',

  'Cold therapy involves controlled exposure to cold temperatures to stimulate physiological responses that aid recovery, reduce inflammation, and improve mental resilience. Ice baths are one of the most effective and researched forms of cold therapy used by athletes and wellness practitioners worldwide.',

  'Ice baths trigger vasoconstriction, slowing blood flow to muscles and reducing inflammation. Once the body rewarms, vasodilation occurs, flushing metabolic waste and delivering oxygen-rich blood. Research also shows cold exposure activates the nervous system, improving stress tolerance and recovery efficiency.',

  'Heat therapy promotes muscle relaxation and increased blood flow, making it effective for stiffness and chronic tension. Cold therapy, on the other hand, is better suited for acute inflammation, post-workout recovery, and reducing soreness. Both therapies serve different purposes and should be applied based on recovery needs.',

  'Individuals with cardiovascular conditions, uncontrolled hypertension, Raynaud’s disease, respiratory disorders, or those who are pregnant should avoid ice baths unless cleared by a medical professional. Cold therapy should always be practiced under supervision for first-time users.',

  'Myth: Ice baths permanently damage muscles. Fact: Controlled cold exposure aids recovery when done correctly. Myth: Longer ice baths are better. Fact: Short, structured sessions are more effective and safer. Myth: Cold therapy replaces rest. Fact: Recovery is a combination of rest, nutrition, and active recovery techniques.',

  'This content is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before beginning cold therapy or ice bath practices.',

  true
);
