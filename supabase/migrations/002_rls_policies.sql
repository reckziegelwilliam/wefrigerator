-- Enable Row Level Security
alter table profile enable row level security;
alter table fridge enable row level security;
alter table fridge_status enable row level security;
alter table fridge_inventory enable row level security;
alter table pickup_window enable row level security;
alter table item_request enable row level security;
alter table route enable row level security;
alter table route_fridge enable row level security;
alter table route_assignment enable row level security;
alter table route_check enable row level security;

-- PROFILE POLICIES
create policy "profiles are viewable by everyone"
on profile for select using (true);

create policy "users can update own profile"
on profile for update using (auth.uid() = user_id);

create policy "users can insert own profile"
on profile for insert with check (auth.uid() = user_id);

-- FRIDGE POLICIES
create policy "active fridges are viewable by everyone"
on fridge for select using (is_active = true);

create policy "admins can insert fridges"
on fridge for insert with check (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

create policy "admins can update fridges"
on fridge for update using (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

-- FRIDGE_STATUS POLICIES
create policy "fridge status is viewable by everyone"
on fridge_status for select using (true);

create policy "authenticated users can insert status"
on fridge_status for insert with check (auth.uid() is not null);

-- FRIDGE_INVENTORY POLICIES
create policy "inventory is viewable by everyone"
on fridge_inventory for select using (true);

create policy "authenticated users can insert inventory"
on fridge_inventory for insert with check (auth.uid() is not null);

create policy "authenticated users can update inventory"
on fridge_inventory for update using (auth.uid() is not null);

-- PICKUP_WINDOW POLICIES
create policy "pickup windows are viewable by everyone"
on pickup_window for select using (true);

create policy "authenticated users can insert pickup windows"
on pickup_window for insert with check (auth.uid() is not null);

create policy "creators or admins can update pickup windows"
on pickup_window for update using (
  created_by = auth.uid()
  or exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

-- ITEM_REQUEST POLICIES
create policy "item requests are viewable by everyone"
on item_request for select using (true);

create policy "authenticated users can insert requests"
on item_request for insert with check (auth.uid() is not null);

create policy "creators or admins can update requests"
on item_request for update using (
  created_by = auth.uid()
  or exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

-- ROUTE POLICIES
create policy "routes are viewable by everyone"
on route for select using (true);

create policy "admins can insert routes"
on route for insert with check (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

create policy "admins can update routes"
on route for update using (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

create policy "admins can delete routes"
on route for delete using (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

-- ROUTE_FRIDGE POLICIES
create policy "route fridges are viewable by everyone"
on route_fridge for select using (true);

create policy "admins can manage route fridges"
on route_fridge for all using (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
) with check (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

-- ROUTE_ASSIGNMENT POLICIES
create policy "route assignments are viewable by everyone"
on route_assignment for select using (true);

create policy "volunteers can insert assignments"
on route_assignment for insert with check (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role in ('volunteer','admin')
  )
);

create policy "volunteers can update own assignments"
on route_assignment for update using (
  volunteer_id = auth.uid()
  or exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role = 'admin'
  )
);

-- ROUTE_CHECK POLICIES
create policy "route checks are viewable by everyone"
on route_check for select using (true);

create policy "volunteers can insert route checks"
on route_check for insert with check (
  exists(
    select 1 from profile p 
    where p.user_id = auth.uid() 
    and p.role in ('volunteer','admin')
  )
);

