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

drop trigger if exists trg_performances_updated_at on public.performances;
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

drop trigger if exists trg_promotion_requests_updated_at on public.promotion_requests;
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

drop trigger if exists trg_ticket_campaigns_updated_at on public.ticket_campaigns;
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
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  genre_focus text[],
  region text,
  cover_image_url text,
  logo_url text,
  website text,
  instagram text,
  youtube text,
  follower_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at
  before update on public.organizations
  for each row
  execute function public.trigger_set_timestamps();

alter table if exists public.performances
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete set null,
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  cover_image_url text,
  tags text[],
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
  before update on public.community_posts
  for each row
  execute function public.trigger_set_timestamps();

create table if not exists public.organization_followers (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  follower_email text,
  follower_name text,
  follower_type text not null default 'audience' check (follower_type in ('audience','creator')),
  created_at timestamptz not null default now()
);

create unique index if not exists organization_followers_unique_email
  on public.organization_followers (organization_id, follower_email)
  where follower_email is not null;
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

drop trigger if exists trg_performance_submissions_updated_at on public.performance_submissions;
create trigger trg_performance_submissions_updated_at
  before update on public.performance_submissions
  for each row
  execute function public.trigger_set_timestamps();

alter table if exists public.performances
  add column if not exists tags text[];
-- 공연 초대권 AdGate 스키마

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  kakao_user_id text not null unique,
  role text not null check (role in ('member', 'partner', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.users(id),
  slug text not null unique,
  title text not null,
  summary text,
  intro_html text,
  category text,
  region text,
  hero_image text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.show_performances (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  starts_at timestamptz not null,
  venue text,
  seat_capacity integer,
  created_at timestamptz not null default now()
);

create table if not exists public.event_campaigns (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  seats integer not null,
  apply_start timestamptz not null,
  apply_end timestamptz not null,
  draw_at timestamptz not null,
  status text not null check (status in ('draft','published','closed')) default 'draft',
  adgate_rules jsonb not null,
  weight_rules jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_campaigns(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  ad_verified boolean not null default false,
  intro_seen boolean not null default false,
  weight numeric not null default 1,
  weight_json jsonb,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

create table if not exists public.adgate_verifications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_campaigns(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  dwell_sec integer not null,
  verified boolean not null,
  ttl_exp timestamptz not null,
  utm jsonb,
  created_at timestamptz not null default now()
);

create index on public.adgate_verifications (campaign_id, user_id, ttl_exp);

create table if not exists public.lottery_runs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_campaigns(id) on delete cascade,
  seed_hash text not null,
  winners_json jsonb not null,
  wait_json jsonb not null,
  executed_at timestamptz not null default now(),
  executed_by uuid not null references public.users(id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  campaign_id uuid references public.event_campaigns(id),
  state text not null check (state in ('queued','sending','sent','failed')),
  deliver_at timestamptz not null,
  template text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.users(id),
  action text not null,
  target text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.entries enable row level security;
alter table public.notifications enable row level security;
alter table public.shows enable row level security;
alter table public.event_campaigns enable row level security;
alter table public.lottery_runs enable row level security;

-- RBAC / RLS 정책
-- members
drop policy if exists entries_member_select on public.entries;
create policy entries_member_select on public.entries
  for select using (user_id = auth.uid());

drop policy if exists entries_member_insert on public.entries;
create policy entries_member_insert on public.entries
  for insert with check (user_id = auth.uid());

drop policy if exists notifications_member_select on public.notifications;
create policy notifications_member_select on public.notifications
  for select using (user_id = auth.uid());

-- partners
drop policy if exists shows_partner_select on public.shows;
create policy shows_partner_select on public.shows
  for select using (
    (
      partner_id = auth.uid()
      and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
    )
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

drop policy if exists shows_partner_update on public.shows;
create policy shows_partner_update on public.shows
  for update using (
    partner_id = auth.uid()
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
  ) with check (partner_id = auth.uid());

drop policy if exists campaigns_partner_select on public.event_campaigns;
create policy campaigns_partner_select on public.event_campaigns
  for select using (
    (
      exists (
        select 1 from public.shows s
        where s.id = show_id and s.partner_id = auth.uid()
      )
      and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
    )
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

drop policy if exists campaigns_partner_update on public.event_campaigns;
create policy campaigns_partner_update on public.event_campaigns
  for update using (
    exists (
      select 1 from public.shows s
      where s.id = show_id and s.partner_id = auth.uid()
    )
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
  ) with check (
    exists (
      select 1 from public.shows s
      where s.id = show_id and s.partner_id = auth.uid()
    )
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
  );

-- admins (grant via supabase roles)
grant all on public.users, public.shows, public.show_performances,
  public.event_campaigns, public.entries, public.adgate_verifications,
  public.lottery_runs, public.notifications, public.audit_logs
  to service_role;

-- admin-only lottery run visibility
drop policy if exists lottery_admin_select on public.lottery_runs;
create policy lottery_admin_select on public.lottery_runs
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- waitlist promotion helper
create or replace function public.next_waitlist_promotions(now timestamptz)
returns table (
  campaign_id uuid,
  user_id uuid,
  title text
)
security definer
set search_path = public
language sql
as $$
  select ec.id as campaign_id, e.user_id, s.title
  from event_campaigns ec
  join shows s on s.id = ec.show_id
  join entries e on e.campaign_id = ec.id
  where ec.status = 'published'
    and ec.draw_at < now
    and e.ad_verified = true
    and e.intro_seen = true
    and e.weight > 0
$$;
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

-- 이벤트 승인 워크플로우 및 당첨자 관리 스키마 추가

-- ticket_campaigns 테이블에 승인 워크플로우 필드 추가
alter table public.ticket_campaigns
  add column if not exists status text not null default 'pending_approval'
    check (status in ('pending_approval', 'approved', 'rejected', 'closed')),
  add column if not exists ticket_purchase_url text,
  add column if not exists partner_name text,
  add column if not exists partner_email text,
  add column if not exists partner_phone text,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text;

-- ticket_entries 테이블에 선정 및 관람 체크 필드 추가
alter table public.ticket_entries
  add column if not exists selection_status text not null default 'pending'
    check (selection_status in ('pending', 'selected', 'rejected')),
  add column if not exists attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'no_show')),
  add column if not exists selected_at timestamptz,
  add column if not exists checked_in_at timestamptz;

-- 인덱스 추가 (성능 최적화)
create index if not exists idx_campaigns_status on public.ticket_campaigns(status);
create index if not exists idx_campaigns_approved on public.ticket_campaigns(status, approved_at)
  where status = 'approved';
create index if not exists idx_entries_selection on public.ticket_entries(campaign_id, selection_status);
create index if not exists idx_entries_attendance on public.ticket_entries(campaign_id, attendance_status);

-- 기존 데이터 마이그레이션: 기존 캠페인은 승인된 것으로 처리
update public.ticket_campaigns
set status = 'approved', approved_at = created_at
where status = 'pending_approval';

-- 코멘트 추가
comment on column public.ticket_campaigns.status is '이벤트 승인 상태: pending_approval(승인대기), approved(승인됨), rejected(거부됨), closed(종료됨)';
comment on column public.ticket_campaigns.ticket_purchase_url is '공연 티켓 구매 URL';
comment on column public.ticket_entries.selection_status is '당첨 여부: pending(대기), selected(당첨), rejected(미당첨)';
comment on column public.ticket_entries.attendance_status is '관람 여부: pending(미확인), checked_in(관람완료), no_show(미관람)';
-- ============================================================================
-- Rule Engine 마이그레이션
-- 목적: 노쇼 패널티, 신뢰도 점수, 응모 제한 시스템 구축
-- 생성일: 2025-11-17
-- ============================================================================

-- Ensure uuid-ossp extension exists
create extension if not exists "uuid-ossp";

-- 0. users 테이블에 email 컬럼 추가 (없는 경우)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

COMMENT ON COLUMN users.email IS '사용자 이메일 주소 (선택, 고유)';

-- 1. user_penalties 테이블 생성
-- 사용자의 패널티 기록을 추적 (노쇼, 취소, 규칙 위반 등)
CREATE TABLE IF NOT EXISTS user_penalties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES event_campaigns(id) ON DELETE SET NULL,

  -- 패널티 유형
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('no_show', 'late_cancel', 'rule_violation')),

  -- 패널티 점수
  points INT NOT NULL DEFAULT 10 CHECK (points > 0),

  -- 사유
  reason TEXT,

  -- 만료일 (기본 6개월 후)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 months'),

  -- 생성 정보
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) -- 파트너가 수동으로 부여한 경우

);

-- 인덱스 생성
CREATE INDEX idx_user_penalties_user_id ON user_penalties(user_id);
CREATE INDEX idx_user_penalties_entry_id ON user_penalties(entry_id);
CREATE INDEX idx_user_penalties_expires_at ON user_penalties(expires_at);
CREATE INDEX idx_user_penalties_created_at ON user_penalties(created_at DESC);

-- 패널티 만료일 인덱스 (부분 인덱스 제거 - NOW() 함수는 IMMUTABLE이 아님)
CREATE INDEX idx_user_penalties_active ON user_penalties(user_id, expires_at);

COMMENT ON TABLE user_penalties IS '사용자 패널티 기록 테이블';
COMMENT ON COLUMN user_penalties.penalty_type IS '패널티 유형: no_show(노쇼), late_cancel(3일 이내 취소), rule_violation(규칙 위반)';
COMMENT ON COLUMN user_penalties.points IS '차감할 신뢰도 점수';
COMMENT ON COLUMN user_penalties.expires_at IS '패널티 만료일 (자동 삭제 대상)';


-- ============================================================================
-- 2. campaign_rules 테이블 생성
-- 캠페인별 규칙 정의 (취소 마감, 출석 필수, 양도 금지 등)
CREATE TABLE IF NOT EXISTS campaign_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES event_campaigns(id) ON DELETE CASCADE,

  -- 규칙 유형
  rule_type TEXT NOT NULL CHECK (rule_type IN ('cancel_deadline', 'attendance_required', 'no_transfer', 'custom')),

  -- 규칙 설정 (JSON)
  -- 예: {"days_before": 3, "penalty_points": 10}
  --     {"required": true, "penalty_points": 20}
  config JSONB NOT NULL DEFAULT '{}',

  -- 활성화 여부
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- 생성일
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_campaign_rules_campaign_id ON campaign_rules(campaign_id);
CREATE INDEX idx_campaign_rules_active ON campaign_rules(campaign_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE campaign_rules IS '캠페인별 규칙 정의 테이블';
COMMENT ON COLUMN campaign_rules.rule_type IS '규칙 유형: cancel_deadline(취소 마감), attendance_required(출석 필수), no_transfer(양도 금지)';
COMMENT ON COLUMN campaign_rules.config IS '규칙 상세 설정 (JSON)';


-- ============================================================================
-- 3. users 테이블에 신뢰도 관련 컬럼 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS trust_score INT NOT NULL DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS restriction_reason TEXT,
  ADD COLUMN IF NOT EXISTS restriction_until TIMESTAMPTZ;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score);
CREATE INDEX IF NOT EXISTS idx_users_is_restricted ON users(is_restricted) WHERE is_restricted = TRUE;

COMMENT ON COLUMN users.trust_score IS '사용자 신뢰도 점수 (0-100, 기본 100)';
COMMENT ON COLUMN users.is_restricted IS '응모 제한 여부 (60점 이하 시 자동 TRUE)';
COMMENT ON COLUMN users.restriction_reason IS '제한 사유';
COMMENT ON COLUMN users.restriction_until IS '제한 해제 예정일';


-- ============================================================================
-- 4. entries 테이블에 취소 관련 컬럼 추가
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_entries_is_cancelled ON entries(is_cancelled);
CREATE INDEX IF NOT EXISTS idx_entries_cancelled_at ON entries(cancelled_at DESC) WHERE cancelled_at IS NOT NULL;

COMMENT ON COLUMN entries.is_cancelled IS '응모 취소 여부';
COMMENT ON COLUMN entries.cancelled_at IS '취소 일시';
COMMENT ON COLUMN entries.cancellation_reason IS '취소 사유';


-- ============================================================================
-- 5. RLS (Row Level Security) 정책 설정
-- ============================================================================

-- user_penalties 테이블 RLS 활성화
ALTER TABLE user_penalties ENABLE ROW LEVEL SECURITY;

-- 본인의 패널티만 조회 가능 (member)
DROP POLICY IF EXISTS "Users can view their own penalties" ON user_penalties;
CREATE POLICY "Users can view their own penalties"
  ON user_penalties
  FOR SELECT
  USING (auth.uid() = user_id);

-- 파트너는 자신의 캠페인 관련 패널티 조회 가능
DROP POLICY IF EXISTS "Partners can view penalties for their campaigns" ON user_penalties;
CREATE POLICY "Partners can view penalties for their campaigns"
  ON user_penalties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_campaigns ec
      INNER JOIN users u ON u.email = ec.partner_email
      WHERE ec.id = user_penalties.campaign_id
        AND u.id = auth.uid()
        AND u.role = 'partner'
    )
  );

-- 파트너는 자신의 캠페인에 대해 패널티 부여 가능
DROP POLICY IF EXISTS "Partners can create penalties for their campaigns" ON user_penalties;
CREATE POLICY "Partners can create penalties for their campaigns"
  ON user_penalties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_campaigns ec
      INNER JOIN users u ON u.email = ec.partner_email
      WHERE ec.id = user_penalties.campaign_id
        AND u.id = auth.uid()
        AND u.role = 'partner'
    )
  );

-- 관리자는 모든 패널티 조회/생성/삭제 가능
DROP POLICY IF EXISTS "Admins have full access to penalties" ON user_penalties;
CREATE POLICY "Admins have full access to penalties"
  ON user_penalties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- campaign_rules 테이블 RLS 활성화
ALTER TABLE campaign_rules ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 규칙 조회 가능 (공개)
DROP POLICY IF EXISTS "Anyone can view campaign rules" ON campaign_rules;
CREATE POLICY "Anyone can view campaign rules"
  ON campaign_rules
  FOR SELECT
  USING (TRUE);

-- 파트너는 자신의 캠페인에 대해 규칙 생성/수정 가능
DROP POLICY IF EXISTS "Partners can manage rules for their campaigns" ON campaign_rules;
CREATE POLICY "Partners can manage rules for their campaigns"
  ON campaign_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM event_campaigns ec
      INNER JOIN users u ON u.email = ec.partner_email
      WHERE ec.id = campaign_rules.campaign_id
        AND u.id = auth.uid()
        AND u.role = 'partner'
    )
  );

-- 관리자는 모든 규칙 관리 가능
DROP POLICY IF EXISTS "Admins have full access to campaign rules" ON campaign_rules;
CREATE POLICY "Admins have full access to campaign rules"
  ON campaign_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================================
-- 6. 유틸리티 함수: 사용자 신뢰도 점수 재계산
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_trust_score(target_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_penalty_points INT;
  new_trust_score INT;
BEGIN
  -- 만료되지 않은 패널티의 총 점수 계산
  SELECT COALESCE(SUM(points), 0)
  INTO total_penalty_points
  FROM user_penalties
  WHERE user_id = target_user_id
    AND expires_at > NOW();

  -- 신뢰도 점수 = 100 - 총 패널티 점수
  new_trust_score := GREATEST(0, 100 - total_penalty_points);

  -- users 테이블 업데이트
  UPDATE users
  SET
    trust_score = new_trust_score,
    is_restricted = (new_trust_score < 60),
    restriction_reason = CASE
      WHEN new_trust_score < 60 THEN '신뢰도 점수 부족'
      ELSE NULL
    END
  WHERE id = target_user_id;

  RETURN new_trust_score;
END;
$$;

COMMENT ON FUNCTION recalculate_trust_score IS '사용자의 신뢰도 점수를 재계산하고 제한 여부를 업데이트';


-- ============================================================================
-- 7. 트리거: 패널티 추가 시 자동 점수 재계산
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 패널티가 추가/삭제될 때 자동으로 신뢰도 점수 재계산
  PERFORM recalculate_trust_score(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_penalty_insert ON user_penalties;
CREATE TRIGGER after_penalty_insert
  AFTER INSERT ON user_penalties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_trust_score();

DROP TRIGGER IF EXISTS after_penalty_delete ON user_penalties;
CREATE TRIGGER after_penalty_delete
  AFTER DELETE ON user_penalties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_trust_score();


-- ============================================================================
-- 8. 기본 캠페인 규칙 삽입
-- ============================================================================

-- 기존 모든 캠페인에 기본 규칙 추가
INSERT INTO campaign_rules (campaign_id, rule_type, config)
SELECT
  id,
  'cancel_deadline',
  '{"days_before": 3, "penalty_points": 10}'::jsonb
FROM event_campaigns
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_rules cr
  WHERE cr.campaign_id = event_campaigns.id
    AND cr.rule_type = 'cancel_deadline'
);

INSERT INTO campaign_rules (campaign_id, rule_type, config)
SELECT
  id,
  'attendance_required',
  '{"required": true, "penalty_points": 20}'::jsonb
FROM event_campaigns
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_rules cr
  WHERE cr.campaign_id = event_campaigns.id
    AND cr.rule_type = 'attendance_required'
);


-- ============================================================================
-- 9. 뷰: 활성 패널티 조회
-- ============================================================================

CREATE OR REPLACE VIEW active_penalties AS
SELECT
  p.*,
  u.email AS user_email,
  u.trust_score,
  ec.title AS campaign_title
FROM user_penalties p
INNER JOIN users u ON u.id = p.user_id
LEFT JOIN event_campaigns ec ON ec.id = p.campaign_id
WHERE p.expires_at > NOW()
ORDER BY p.created_at DESC;

COMMENT ON VIEW active_penalties IS '만료되지 않은 활성 패널티 목록';


-- ============================================================================
-- 완료
-- ============================================================================

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE 'Rule Engine 마이그레이션 완료';
  RAISE NOTICE '- user_penalties 테이블 생성';
  RAISE NOTICE '- campaign_rules 테이블 생성';
  RAISE NOTICE '- users 테이블에 trust_score 추가';
  RAISE NOTICE '- entries 테이블에 취소 관련 컬럼 추가';
  RAISE NOTICE '- RLS 정책 설정 완료';
  RAISE NOTICE '- 자동 점수 재계산 트리거 설정 완료';
END $$;
