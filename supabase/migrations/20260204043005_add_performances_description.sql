-- Add description to performances
alter table public.performances add column if not exists description text;
