-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  clearance_level integer default 1, -- Zero trust clearance level
  
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies (Zero Trust: By default, everything is denied)

-- Allow public read access (if they have a token)
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

-- Allow users to update their own profile
create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Set up a trigger to automatically create a profile for a new user
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
