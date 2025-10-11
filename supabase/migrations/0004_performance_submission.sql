create table if not exists public.performance_submissions (
  id uuid primary key default uuid_generate_v4(),
  status text not null default 'pending' check (status in ('pending','in_review','approved','rejected','published')),
  submission_type text not null default 'listing' check (submission_type in ('listing','full_service')),
  organization_name text not null,
  organization_slug text,
  organization_website text,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  performance_title text not null,
  performance_slug text,
  performance_category text,
  performance_region text,
  performance_tags text[],
  period_start date,
  period_end date,
  venue text,
  synopsis text,
  assets_url text,
  additional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_performance_submissions_updated_at
  before update on public.performance_submissions
  for each row
  execute function public.trigger_set_timestamps();

alter table if exists public.performances
  add column if not exists tags text[];
