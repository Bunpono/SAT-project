-- Supabase schema for the Syntactic Analysis Tool admin dashboard.
-- Run this in the Supabase SQL Editor for projects that use Supabase Auth.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  sentence text not null,
  result jsonb not null,
  sentence_type text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.error_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sentence text not null,
  description text not null,
  result jsonb,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved')),
  created_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;
alter table public.analysis_history enable row level security;
alter table public.error_reports enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all"
on public.profiles
for select
to authenticated
using (public.is_admin());

drop policy if exists "analysis_history_select_own" on public.analysis_history;
create policy "analysis_history_select_own"
on public.analysis_history
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "analysis_history_insert_own" on public.analysis_history;
create policy "analysis_history_insert_own"
on public.analysis_history
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "analysis_history_insert_guest" on public.analysis_history;
create policy "analysis_history_insert_guest"
on public.analysis_history
for insert
to anon
with check (user_id is null);

drop policy if exists "analysis_history_admin_select_all" on public.analysis_history;
create policy "analysis_history_admin_select_all"
on public.analysis_history
for select
to authenticated
using (public.is_admin());

drop policy if exists "error_reports_select_own" on public.error_reports;
create policy "error_reports_select_own"
on public.error_reports
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "error_reports_insert_own" on public.error_reports;
create policy "error_reports_insert_own"
on public.error_reports
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "error_reports_admin_select_all" on public.error_reports;
create policy "error_reports_admin_select_all"
on public.error_reports
for select
to authenticated
using (public.is_admin());

drop policy if exists "error_reports_admin_update_status" on public.error_reports;
create policy "error_reports_admin_update_status"
on public.error_reports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_analysis_history_user_id_created_at
  on public.analysis_history(user_id, created_at desc);
create index if not exists idx_error_reports_user_id_created_at
  on public.error_reports(user_id, created_at desc);
create index if not exists idx_error_reports_status
  on public.error_reports(status);

