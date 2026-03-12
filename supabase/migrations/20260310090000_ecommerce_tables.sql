-- E-commerce tables

-- Roles: Admin, Sales, Shipper
alter table public.profiles add column if not exists role text default 'sales' check (role in ('admin', 'sales', 'shipper'));

-- Products
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  stock integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers
create table public.customers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.customers(id) not null,
  total_amount numeric not null,
  status text not null default 'pending',
  shipping_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null,
  price numeric not null
);

-- Access Logs (for Training AI or viewing in DB)
create table public.access_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  ip_address text,
  device_fingerprint text,
  endpoint text,
  method text,
  action_time timestamp with time zone default timezone('utc'::text, now()) not null,
  risk_score numeric,
  decision text -- 'allow' or 'block'
);

-- Enable RLS (Assuming API will use service role to bypass it, or we configure policies, 
-- but for now let's allow service_role bypass or set policies based on profiles)
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.access_logs enable row level security;

-- Policies (We can just allow all for authenticated users handled by service role, or set simple policies)
-- Since Module A will be an Express app using Supabase Client (Service Role or Auth), we can just let service role handle it.
-- But it's good practice to have simple policies.
create policy "Enable read access for all users" on public.products for select using (true);
create policy "Allow full access for authenticated users" on public.products for all using (auth.role() = 'authenticated');

create policy "Allow full access for authenticated users" on public.customers for all using (auth.role() = 'authenticated');
create policy "Allow full access for authenticated users" on public.orders for all using (auth.role() = 'authenticated');
create policy "Allow full access for authenticated users" on public.order_items for all using (auth.role() = 'authenticated');
create policy "Allow full access for authenticated users" on public.access_logs for all using (auth.role() = 'authenticated');
