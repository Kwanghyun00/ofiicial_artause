-- Ticket campaign operational schema overhaul

-- Extend ticket_campaigns metadata for deterministic operations
alter table if exists public.ticket_campaigns
  add column if not exists status text not null default 'draft',
  add column if not exists allocation jsonb not null default jsonb_build_object('winners', 0, 'waitlist', 0),
  add column if not exists algorithm_version text not null default 'weighted_v1',
  add column if not exists config jsonb not null default '{}',
  add column if not exists snapshot_seed bigint,
  add column if not exists last_draw_at timestamptz;

-- Add CHECK constraint separately (if column was just created)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'ticket_campaigns_status_check'
  ) then
    alter table public.ticket_campaigns
      add constraint ticket_campaigns_status_check
      check (status in ('draft','scheduled','active','closed'));
  end if;
end $$;

create index if not exists ticket_campaigns_status_idx on public.ticket_campaigns (status);

-- Core participant registry (identifiers hashed at ingestion)
create table if not exists public.campaign_participants (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ticket_campaigns(id) on delete cascade,
  external_user_id text not null,
  hashed_contact text not null,
  nickname text,
  consent_marketing boolean not null default false,
  created_at timestamptz not null default now(),
  unique (campaign_id, external_user_id)
);

create index if not exists campaign_participants_lookup_idx
  on public.campaign_participants (campaign_id, hashed_contact);

-- Ad verification evidence (stores ad vendor payload)
create table if not exists public.campaign_ad_watch_verifications (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ticket_campaigns(id) on delete cascade,
  participant_id uuid not null references public.campaign_participants(id) on delete cascade,
  ad_session_id uuid not null,
  watched_ratio numeric(5,2) not null,
  focus_lost boolean not null default false,
  muted boolean not null default false,
  completed_at timestamptz,
  verification_payload jsonb not null,
  created_at timestamptz not null default now(),
  unique (campaign_id, participant_id),
  unique (ad_session_id)
);

create index if not exists campaign_ad_watch_ratio_idx
  on public.campaign_ad_watch_verifications (campaign_id, watched_ratio desc);

-- Blacklist register (permanent or temporary)
create table if not exists public.campaign_blacklist (
  id uuid primary key default uuid_generate_v4(),
  external_user_id text not null,
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists campaign_blacklist_user_idx
  on public.campaign_blacklist (external_user_id);

-- Entry ledger with deterministic weights

-- Handle existing campaign_entries table and type
do $$
begin
  -- Drop status column if it exists (will be recreated with new type)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'campaign_entries'
    and column_name = 'status'
  ) then
    alter table public.campaign_entries drop column status;
  end if;
end $$;

-- Now safe to drop and recreate the type
drop type if exists public.campaign_entry_status cascade;
create type public.campaign_entry_status as enum (
  'pending',
  'eligible',
  'duplicate',
  'blacklisted',
  'winner',
  'waitlist',
  'expired'
);

create table if not exists public.campaign_entries (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ticket_campaigns(id) on delete cascade,
  participant_id uuid not null references public.campaign_participants(id) on delete cascade,
  ad_verification_id uuid references public.campaign_ad_watch_verifications(id) on delete restrict,
  reason text,
  weight numeric(8,4) not null default 1.0,
  novelty_factor numeric(8,4) not null default 1.0,
  referral_factor numeric(8,4) not null default 1.0,
  duplicate_group text,
  random_seed bigint not null,
  fingerprint jsonb,
  extra jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, participant_id)
);

-- Add status column after table exists
alter table public.campaign_entries
  add column if not exists status public.campaign_entry_status not null default 'pending';

create index if not exists campaign_entries_status_idx
  on public.campaign_entries (campaign_id, status);

create index if not exists campaign_entries_seed_idx
  on public.campaign_entries (campaign_id, random_seed);

drop trigger if exists trg_campaign_entries_updated_at on public.campaign_entries;
create trigger trg_campaign_entries_updated_at
  before update on public.campaign_entries
  for each row
  execute function public.trigger_set_timestamps();

-- Draw execution records (winners + waitlist snapshot)
create table if not exists public.campaign_draws (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ticket_campaigns(id) on delete cascade,
  algorithm_version text not null,
  seed bigint not null,
  executed_by uuid,
  run_at timestamptz not null default now(),
  config jsonb not null,
  winners jsonb not null,
  waitlist jsonb not null,
  duration_ms integer not null,
  log_id bigint references public.audit_logs(id)
);

create index if not exists campaign_draws_campaign_idx
  on public.campaign_draws (campaign_id, run_at desc);

-- Winner response tracking for waitlist promotion
create table if not exists public.campaign_winner_responses (
  id uuid primary key default uuid_generate_v4(),
  draw_id uuid not null references public.campaign_draws(id) on delete cascade,
  participant_id uuid not null references public.campaign_participants(id) on delete cascade,
  status text not null check (status in ('pending','accepted','declined','timeout')),
  deadline timestamptz not null,
  responded_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists campaign_winner_deadline_idx
  on public.campaign_winner_responses (status, deadline);

-- Waitlist promotion ledger
create table if not exists public.campaign_waitlist_promotions (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.ticket_campaigns(id) on delete cascade,
  participant_id uuid not null references public.campaign_participants(id) on delete cascade,
  promoted_from integer not null,
  promoted_to integer not null,
  run_at timestamptz not null default now(),
  trigger text not null,
  log_id bigint references public.audit_logs(id)
);

create index if not exists campaign_waitlist_promotions_idx
  on public.campaign_waitlist_promotions (campaign_id, run_at desc);

-- Extend audit logs for richer traceability
alter table if exists public.audit_logs
  add column if not exists actor_type text not null default 'system'
    check (actor_type in ('system','user','admin','service')),
  add column if not exists entity text,
  add column if not exists entity_id uuid,
  add column if not exists correlation_id uuid,
  add column if not exists notes text;

create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity, entity_id);

create index if not exists audit_logs_correlation_idx
  on public.audit_logs (correlation_id);

-- Enable RLS (service role bypasses)
alter table if exists public.campaign_participants enable row level security;
alter table if exists public.campaign_ad_watch_verifications enable row level security;
alter table if exists public.campaign_entries enable row level security;
alter table if exists public.campaign_draws enable row level security;
alter table if exists public.campaign_winner_responses enable row level security;
alter table if exists public.campaign_waitlist_promotions enable row level security;
alter table if exists public.campaign_blacklist enable row level security;

-- No user-facing policies; default deny. Service role (edge functions) bypasses automatically.

