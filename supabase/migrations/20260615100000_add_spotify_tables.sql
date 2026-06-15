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

-- Add playlist URL to event_plans
alter table public.event_plans add column if not exists spotify_playlist_url text;
