-- ============================================================
-- Momentto — Supabase Schema
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. countdowns table
create table if not exists public.countdowns (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users not null,
  share_id            text unique,
  category            text not null,
  title               text not null,
  date                text not null,
  time                text,
  created_at          timestamptz not null default now(),
  expires_at          timestamptz,
  share_expires_mode  text not null default '5d' -- '5d' | '30d' | 'never'
);

-- 4. saved_countdowns table (countdowns saved from other users' share links)
create table if not exists public.saved_countdowns (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid references auth.users not null,
  share_id  text not null,
  saved_at  timestamptz not null default now(),
  constraint saved_countdowns_user_share_unique unique (user_id, share_id)
);

-- 2. user_preferences table
create table if not exists public.user_preferences (
  user_id    uuid primary key references auth.users,
  accent_hue integer not null default 165,
  updated_at timestamptz not null default now()
);

-- 3. push_subscriptions table
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users unique not null,
  subscription jsonb not null,
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.countdowns        enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_preferences   enable row level security;
alter table public.saved_countdowns   enable row level security;

-- countdowns: owner can do everything
create policy "countdowns_owner_all"
  on public.countdowns
  for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- NOTE: Public share reads are handled server-side with SERVICE_ROLE_KEY.
-- No public RLS policy needed — avoids exposing all shared countdowns via SDK.

-- user_preferences: owner can do everything
create policy "user_preferences_owner_all"
  on public.user_preferences
  for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- push_subscriptions: owner can do everything
create policy "push_subscriptions_owner_all"
  on public.push_subscriptions
  for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- saved_countdowns: owner can do everything
create policy "saved_countdowns_owner_all"
  on public.saved_countdowns
  for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ============================================================
-- Enable Anonymous Sign-In
-- ============================================================
-- Go to: Authentication → Providers → Anonymous → Enable
-- (Cannot be done via SQL)

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists countdowns_user_id_idx  on public.countdowns (user_id);
create index if not exists countdowns_share_id_idx on public.countdowns (share_id) where share_id is not null;
create index if not exists saved_countdowns_user_id_idx  on public.saved_countdowns (user_id);
create index if not exists saved_countdowns_share_id_idx on public.saved_countdowns (share_id);
