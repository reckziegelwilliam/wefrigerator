-- Seed data for wefrigerator application
-- Run this after setting up your initial admin user

-- Insert sample fridges (San Francisco Bay Area locations)
insert into fridge (id, name, description, address, lat, lng, is_active, accessibility) values
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Mission District Community Fridge',
    'Located outside the community center, accessible 24/7',
    '2850 Mission St, San Francisco, CA 94110',
    37.7516,
    -122.4186,
    true,
    '{"24_7": true, "wheelchair": true}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Tenderloin Mutual Aid Pantry',
    'Inside the building lobby, open during business hours',
    '145 Taylor St, San Francisco, CA 94102',
    37.7836,
    -122.4108,
    true,
    '{"24_7": false, "wheelchair": true}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Sunset District Neighborhood Fridge',
    'Corner location with covered access',
    '2601 Ocean Ave, San Francisco, CA 94132',
    37.7246,
    -122.4915,
    true,
    '{"24_7": true, "wheelchair": true}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'Bayview Community Pantry',
    'Community garden location',
    '1550 Evans Ave, San Francisco, CA 94124',
    37.7396,
    -122.3877,
    true,
    '{"24_7": false, "wheelchair": false}'::jsonb
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'Richmond District Food Share',
    'Next to the library',
    '351 9th Ave, San Francisco, CA 94118',
    37.7829,
    -122.4661,
    true,
    '{"24_7": true, "wheelchair": true}'::jsonb
  );

-- Insert sample fridge status (recent updates)
insert into fridge_status (fridge_id, status, note, created_at) values
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'stocked',
    'Just restocked with fresh produce and canned goods!',
    now() - interval '2 hours'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'needs',
    'Running low on water and hygiene items',
    now() - interval '5 hours'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'open',
    'Fridge is accessible and has some items',
    now() - interval '1 day'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'stocked',
    'Great donations today - lots of fresh vegetables',
    now() - interval '3 hours'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'needs',
    'Low on everything, especially baby items',
    now() - interval '8 hours'
  );

-- Insert sample inventory
insert into fridge_inventory (fridge_id, produce, canned, grains, dairy, baby, hygiene, water, updated_at) values
  ('550e8400-e29b-41d4-a716-446655440001', true, true, true, true, false, true, true, now() - interval '2 hours'),
  ('550e8400-e29b-41d4-a716-446655440002', true, false, true, false, false, false, false, now() - interval '5 hours'),
  ('550e8400-e29b-41d4-a716-446655440003', true, true, false, false, false, true, true, now() - interval '1 day'),
  ('550e8400-e29b-41d4-a716-446655440004', true, true, true, false, true, true, true, now() - interval '3 hours'),
  ('550e8400-e29b-41d4-a716-446655440005', false, false, false, false, false, false, false, now() - interval '8 hours');

-- Insert sample item requests
insert into item_request (fridge_id, category, detail, status, created_at) values
  ('550e8400-e29b-41d4-a716-446655440002', 'water', 'Bottled water urgently needed', 'open', now() - interval '4 hours'),
  ('550e8400-e29b-41d4-a716-446655440002', 'hygiene', 'Soap, toothpaste, and deodorant', 'open', now() - interval '4 hours'),
  ('550e8400-e29b-41d4-a716-446655440005', 'baby', 'Size 4 diapers', 'open', now() - interval '6 hours'),
  ('550e8400-e29b-41d4-a716-446655440005', 'baby', 'Baby formula (any brand)', 'open', now() - interval '6 hours'),
  ('550e8400-e29b-41d4-a716-446655440001', 'dairy', 'Milk alternatives needed', 'fulfilled', now() - interval '1 day');

-- Insert sample pickup windows
insert into pickup_window (fridge_id, starts_at, ends_at, type, capacity) values
  ('550e8400-e29b-41d4-a716-446655440001', now() + interval '1 day' + interval '10 hours', now() + interval '1 day' + interval '12 hours', 'dropoff', 10),
  ('550e8400-e29b-41d4-a716-446655440002', now() + interval '2 days' + interval '14 hours', now() + interval '2 days' + interval '16 hours', 'pickup', 20),
  ('550e8400-e29b-41d4-a716-446655440004', now() + interval '1 day' + interval '9 hours', now() + interval '1 day' + interval '11 hours', 'dropoff', 15);

-- Insert sample routes
insert into route (id, name, description) values
  ('650e8400-e29b-41d4-a716-446655440001', 'Downtown Route', 'Mission and Tenderloin fridges'),
  ('650e8400-e29b-41d4-a716-446655440002', 'West Side Route', 'Sunset and Richmond fridges');

-- Link fridges to routes
insert into route_fridge (route_id, fridge_id, sort_order) values
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 2),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 1),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 2);

-- Note: To set up your admin user, after creating your account run:
-- update profile set role = 'admin' where user_id = 'your-user-id';

