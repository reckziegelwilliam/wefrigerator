-- USERS / PROFILES
create table profile (
  user_id uuid primary key references auth.users on delete cascade,
  display_name text,
  phone text,
  role text check (role in ('visitor','contributor','volunteer','admin')) default 'contributor',
  created_at timestamptz default now()
);

-- FRIDGES
create table fridge (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  lat double precision not null,
  lng double precision not null,
  is_active boolean default true,
  accessibility jsonb, -- e.g., {"24_7": true, "wheelchair": true}
  created_by uuid references profile(user_id) on delete set null,
  created_at timestamptz default now()
);

-- STATUS LOG (append-only)
create table fridge_status (
  id uuid primary key default gen_random_uuid(),
  fridge_id uuid references fridge(id) on delete cascade,
  status text check (status in ('open','stocked','needs','closed')) not null,
  note text,
  photo_path text, -- storage path
  created_by uuid references profile(user_id) on delete set null,
  created_at timestamptz default now()
);

-- Create index for faster queries on latest status
create index fridge_status_fridge_created_idx on fridge_status(fridge_id, created_at desc);

-- LIGHTWEIGHT INVENTORY (latest snapshot)
create table fridge_inventory (
  fridge_id uuid primary key references fridge(id) on delete cascade,
  produce boolean default false,
  canned boolean default false,
  grains boolean default false,
  dairy boolean default false,
  baby boolean default false,
  hygiene boolean default false,
  water boolean default false,
  last_updated_by uuid references profile(user_id) on delete set null,
  updated_at timestamptz default now()
);

-- PICKUP WINDOWS (posting predictable windows helps)
create table pickup_window (
  id uuid primary key default gen_random_uuid(),
  fridge_id uuid references fridge(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  type text check (type in ('pickup','dropoff')) default 'pickup',
  capacity int,
  created_by uuid references profile(user_id),
  created_at timestamptz default now()
);

-- ITEM REQUESTS (simple ask)
create table item_request (
  id uuid primary key default gen_random_uuid(),
  fridge_id uuid references fridge(id) on delete cascade,
  category text, -- "water","hygiene","baby",...
  detail text,   -- free text like "size 4 diapers"
  status text check (status in ('open','fulfilled','withdrawn')) default 'open',
  created_by uuid references profile(user_id),
  created_at timestamptz default now(),
  fulfilled_at timestamptz
);

-- ROUTES (volunteers)
create table route (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_by uuid references profile(user_id),
  created_at timestamptz default now()
);

-- ROUTE -> FRIDGES (ordering)
create table route_fridge (
  route_id uuid references route(id) on delete cascade,
  fridge_id uuid references fridge(id) on delete cascade,
  sort_order int default 0,
  primary key (route_id, fridge_id)
);

-- VOLUNTEER CLAIMS
create table route_assignment (
  id uuid primary key default gen_random_uuid(),
  route_id uuid references route(id) on delete cascade,
  date date not null,
  volunteer_id uuid references profile(user_id),
  status text check (status in ('claimed','completed','missed')) default 'claimed',
  created_at timestamptz default now(),
  unique (route_id, date) -- one claim per date
);

-- CHECKS DURING ROUTE VISIT
create table route_check (
  id uuid primary key default gen_random_uuid(),
  route_assignment_id uuid references route_assignment(id) on delete cascade,
  fridge_id uuid references fridge(id) on delete cascade,
  arrived_at timestamptz default now(),
  condition text, -- "clean","needs_cleaning","overflowing"
  note text
);

