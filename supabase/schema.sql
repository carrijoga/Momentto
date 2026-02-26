-- ============================================================
-- MyTrip — Supabase Schema
-- Run this in the Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. countdowns table
create table if not exists public.countdowns (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  share_id    text unique,
  category    text not null,
  title       text not null,
  date        text not null,
  time        text,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz
);

-- 2. push_subscriptions table
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

-- countdowns: owner can do everything
create policy "countdowns_owner_all"
  on public.countdowns
  for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- NOTE: Public share reads are handled server-side with SERVICE_ROLE_KEY.
-- No public RLS policy needed — avoids exposing all shared countdowns via SDK.

-- push_subscriptions: owner can do everything
create policy "push_subscriptions_owner_all"
  on public.push_subscriptions
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
