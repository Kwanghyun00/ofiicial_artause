alter table if exists public.ticket_campaigns
  add column if not exists slug text unique default uuid_generate_v4()::text;

create index if not exists ticket_campaigns_slug_idx on public.ticket_campaigns (slug);

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
