-- External data sources tracking
create table if not exists external_source (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  attribution text,
  license text,
  attribution_url text,
  meta jsonb,
  created_at timestamptz default now()
);

-- External places from APIs (OSM, ArcGIS, Freedge, etc.)
create table if not exists external_place (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references external_source(id),
  source_place_id text,
  name text,
  address text,
  lat double precision,
  lng double precision,
  raw jsonb,
  last_seen_at timestamptz,
  created_at timestamptz default now(),
  ignored boolean default false,
  unique (source_id, source_place_id)
);

-- Link fridges to their external source
alter table fridge add column if not exists external_place_id uuid references external_place(id);

-- Indexes for performance
create index if not exists idx_external_place_geopt on external_place (lat, lng);
create index if not exists idx_external_place_source on external_place (source_id);
create index if not exists idx_external_place_ignored on external_place (ignored) where ignored = false;

-- Seed initial data sources
insert into external_source (name, attribution, license, attribution_url)
values
  ('osm_overpass', '© OpenStreetMap contributors', 'ODbL', 'https://wiki.openstreetmap.org/wiki/Overpass_API'),
  ('lac_charitable_food', 'LA County DPH / 211 LA', null, 'https://lacounty.gov/'),
  ('freedge', 'Freedge', null, 'https://freedge.org/locations/')
on conflict (name) do nothing;

