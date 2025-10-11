create extension if not exists "uuid-ossp";

create or replace function public.trigger_set_timestamps()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    new.created_at = coalesce(new.created_at, now());
  end if;

  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.performances (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  title text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','ongoing','completed')),
  category text,
  region text,
  organization text,
  period_start date,
  period_end date,
  venue text,
  synopsis text,
  tasks text[],
  poster_url text,
  hero_headline text,
  hero_subtitle text,
  ticket_link text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_performances_updated_at
  before update on public.performances
  for each row
  execute function public.trigger_set_timestamps();

create table if not exists public.promotion_requests (
  id uuid primary key default uuid_generate_v4(),
  status text not null default 'new' check (status in ('new','in_review','approved','rejected','completed')),
  organization_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text not null,
  performance_title text not null,
  performance_category text,
  performance_region text,
  performance_dates text,
  performance_venue text,
  performance_synopsis text,
  marketing_goals text,
  marketing_channels text[],
  assets_url text,
  additional_notes text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_promotion_requests_updated_at
  before update on public.promotion_requests
  for each row
  execute function public.trigger_set_timestamps();

create table if not exists public.ticket_campaigns (
  id uuid primary key default uuid_generate_v4(),
  performance_id uuid not null references public.performances(id) on delete cascade,
  title text not null,
  description text,
  reward text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  form_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_ticket_campaigns_updated_at
  before update on public.ticket_campaigns
  for each row
  execute function public.trigger_set_timestamps();

create table if not exists public.ticket_entries (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ticket_campaigns(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  answers jsonb,
  consent_marketing boolean not null default false,
  submitted_at timestamptz not null default now()
);
