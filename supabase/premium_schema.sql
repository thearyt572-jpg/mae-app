-- ============================================================================
-- ម៉ែ — by FlowErs
-- Step 6: Premium Split Schema & Tamper-Proof Protection
-- Run this in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Add `is_premium` column to users table (defaults to false)
alter table public.users
  add column if not exists is_premium boolean not null default false;

-- 2. Stop `is_premium` from being modified by client-side apps.
-- A person can read her own value, but any client update to `is_premium`
-- is silently discarded, preserving the previous value (or false on insert).
-- Only you (via the Supabase Table Editor or service_role) can change it.

create or replace function public.protect_user_is_premium()
returns trigger as $$
begin
  -- If the operation comes from an authenticated user session (client app):
  if (current_setting('request.jwt.claim.role', true) = 'authenticated') then
    if (TG_OP = 'INSERT') then
      new.is_premium := false;
    elsif (TG_OP = 'UPDATE') then
      new.is_premium := old.is_premium;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Attach the trigger to public.users for both INSERT and UPDATE
drop trigger if exists tr_protect_user_is_premium on public.users;
create trigger tr_protect_user_is_premium
  before insert or update on public.users
  for each row
  execute function public.protect_user_is_premium();

-- 3. Row-Level Security (RLS) policies on users table:
-- Ensure RLS is enabled:
alter table public.users enable row level security;

-- A user can read her own row (including is_premium):
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

-- A user can insert their own profile:
drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users
  for insert
  with check (auth.uid() = id);

-- A user can update their own profile:
drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4. Convenient helper: to grant premium to a tester by email directly in SQL Editor:
-- update public.users set is_premium = true where email = 'tester@example.com';

