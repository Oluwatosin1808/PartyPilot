create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  budget numeric not null check (budget > 0),
  guest_count integer not null check (guest_count > 0),
  location text not null,
  duration text not null,
  vibe_level text not null check (vibe_level in ('chill', 'balanced', 'turn_up', 'chaos_mode')),
  event_date date not null,
  music_genres text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.event_plans (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  ai_response jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_plans enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "events_select_own" on public.events
  for select using (auth.uid() = user_id);

create policy "events_insert_own" on public.events
  for insert with check (auth.uid() = user_id);

create policy "events_update_own" on public.events
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "events_delete_own" on public.events
  for delete using (auth.uid() = user_id);

create policy "plans_select_own_events" on public.event_plans
  for select using (
    exists (
      select 1 from public.events
      where events.id = event_plans.event_id
      and events.user_id = auth.uid()
    )
  );

create policy "plans_insert_own_events" on public.event_plans
  for insert with check (
    exists (
      select 1 from public.events
      where events.id = event_plans.event_id
      and events.user_id = auth.uid()
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.spotify_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.spotify_tokens enable row level security;

create policy "spotify_tokens_select_own" on public.spotify_tokens
  for select using (auth.uid() = user_id);

create policy "spotify_tokens_insert_own" on public.spotify_tokens
  for insert with check (auth.uid() = user_id);

create policy "spotify_tokens_update_own" on public.spotify_tokens
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "spotify_tokens_delete_own" on public.spotify_tokens
  for delete using (auth.uid() = user_id);

alter table public.event_plans add column if not exists spotify_playlist_url text;
