-- Job Application Tracker — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to run more than once (CREATE TABLE IF NOT EXISTS / DROP POLICY IF EXISTS).
-- No data is seeded: every user starts with an empty tracker.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company text not null,
  role_title text not null,
  location text,
  work_type text,
  salary_text text,
  source text,
  listing_url text,
  date_applied date,
  status text not null default 'Saved'
    check (status in ('Saved', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn')),
  contact_name text,
  next_step text,
  next_step_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at current on every edit.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Row Level Security: each user can only touch their own rows.
alter table public.applications enable row level security;

drop policy if exists "Users can view their own applications" on public.applications;
create policy "Users can view their own applications"
  on public.applications for select
  using (user_id = auth.uid());

drop policy if exists "Users can add their own applications" on public.applications;
create policy "Users can add their own applications"
  on public.applications for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own applications" on public.applications;
create policy "Users can update their own applications"
  on public.applications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can delete their own applications" on public.applications;
create policy "Users can delete their own applications"
  on public.applications for delete
  using (user_id = auth.uid());

-- Helpful index for the dashboard list (per user, newest first).
create index if not exists applications_user_created_idx
  on public.applications (user_id, created_at desc);
