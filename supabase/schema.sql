-- Review Engine — Phase 1 schema
-- Paste this whole file into the Supabase SQL editor and run it.
-- It is safe to re-run: tables use IF NOT EXISTS and policies are dropped before being recreated.

create extension if not exists pgcrypto;

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.businesses (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name               text not null,
  logo_url           text,
  category           text,
  google_review_url  text,
  whatsapp_number    text,
  created_at         timestamptz default now()
);

create table if not exists public.scans (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references public.businesses(id) on delete cascade,
  rating       int not null check (rating between 1 and 5),
  comment_raw  text,
  draft_text   text,
  created_at   timestamptz default now()
);

create table if not exists public.contacts (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid references public.businesses(id) on delete cascade,
  phone        text not null,
  name         text,
  created_at   timestamptz default now()
);

create table if not exists public.admin_users (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('admin', 'client')),
  business_id  uuid references public.businesses(id) on delete set null
);

create index if not exists scans_business_id_created_at_idx on public.scans (business_id, created_at desc);
create index if not exists contacts_business_id_idx on public.contacts (business_id);
create index if not exists admin_users_business_id_idx on public.admin_users (business_id);

-- =========================================================================
-- Helper functions
-- SECURITY DEFINER so policies on other tables can look up the caller's
-- role/business without being blocked by admin_users' own RLS.
-- =========================================================================

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.admin_users where user_id = auth.uid();
$$;

create or replace function public.current_user_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.admin_users where user_id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
revoke all on function public.current_user_business_id() from public;
grant execute on function public.current_user_role() to anon, authenticated;
grant execute on function public.current_user_business_id() to anon, authenticated;

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.businesses  enable row level security;
alter table public.scans       enable row level security;
alter table public.contacts    enable row level security;
alter table public.admin_users enable row level security;

-- ---------- businesses ----------
-- Public read: the scan page loads business info without login.
drop policy if exists "businesses_public_select" on public.businesses;
create policy "businesses_public_select"
  on public.businesses for select
  to anon, authenticated
  using (true);

-- Update: admin can update any row, client only their own business.
drop policy if exists "businesses_update_admin_or_owner" on public.businesses;
create policy "businesses_update_admin_or_owner"
  on public.businesses for update
  to authenticated
  using (
    public.current_user_role() = 'admin'
    or (public.current_user_role() = 'client' and id = public.current_user_business_id())
  )
  with check (
    public.current_user_role() = 'admin'
    or (public.current_user_role() = 'client' and id = public.current_user_business_id())
  );

-- ---------- scans ----------
-- Public insert: anyone can submit a scan, no login needed.
drop policy if exists "scans_public_insert" on public.scans;
create policy "scans_public_insert"
  on public.scans for insert
  to anon, authenticated
  with check (business_id is not null);

-- Select: admin sees all, client sees only their business.
drop policy if exists "scans_select_admin_or_owner" on public.scans;
create policy "scans_select_admin_or_owner"
  on public.scans for select
  to authenticated
  using (
    public.current_user_role() = 'admin'
    or (public.current_user_role() = 'client' and business_id = public.current_user_business_id())
  );

-- ---------- contacts ----------
-- Select: same restriction as scans.
drop policy if exists "contacts_select_admin_or_owner" on public.contacts;
create policy "contacts_select_admin_or_owner"
  on public.contacts for select
  to authenticated
  using (
    public.current_user_role() = 'admin'
    or (public.current_user_role() = 'client' and business_id = public.current_user_business_id())
  );

-- Insert: logged-in admin (any business) or client (own business only). Not public.
drop policy if exists "contacts_insert_admin_or_owner" on public.contacts;
create policy "contacts_insert_admin_or_owner"
  on public.contacts for insert
  to authenticated
  with check (
    public.current_user_role() = 'admin'
    or (public.current_user_role() = 'client' and business_id = public.current_user_business_id())
  );

-- ---------- admin_users ----------
-- Users can only read their own row.
drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());
