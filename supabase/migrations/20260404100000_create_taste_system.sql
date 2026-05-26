-- ============================================================
-- 취향 분석 시스템 — Phase 1·2·3 기반 테이블
-- ============================================================

-- ── Phase 1: 사용자 명시적 취향 (퀴즈 결과 저장) ──────────────

create table if not exists public.user_preferences (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users(id) on delete cascade,
  persona         text        check (persona in ('romantic', 'explorer', 'beginner', 'connoisseur')),
  taste_tags      text[]      not null default '{}',
  companion_type  text        check (companion_type in ('solo', 'couple', 'friend', 'family')),
  onboarding_done boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- ── Phase 2: 암묵적 행동 신호 (클릭·체류·응모·북마크) ──────────

create table if not exists public.user_taste_signals (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  campaign_id uuid        references public.ticket_campaigns(id) on delete set null,
  signal_type text        not null
    check (signal_type in ('view', 'dwell', 'click', 'entry', 'bookmark', 'review')),
  weight      numeric     not null default 1.0,
  taste_tags  text[]      not null default '{}',
  created_at  timestamptz not null default now()
);

create index if not exists user_taste_signals_user_idx     on public.user_taste_signals (user_id);
create index if not exists user_taste_signals_campaign_idx on public.user_taste_signals (campaign_id);
create index if not exists user_taste_signals_created_idx  on public.user_taste_signals (created_at desc);

alter table public.user_taste_signals enable row level security;

create policy "user_taste_signals_insert_own"
  on public.user_taste_signals for insert
  with check (auth.uid() = user_id);

create policy "user_taste_signals_select_own"
  on public.user_taste_signals for select
  using (auth.uid() = user_id);

-- ── updated_at 트리거 (함수가 없을 때만 생성) ──────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql security definer as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- ── Phase 3 준비: 공연별 취향 벡터 (관리자/자동 태깅) ──────────

create table if not exists public.campaign_taste_tags (
  campaign_id uuid        primary key references public.ticket_campaigns(id) on delete cascade,
  taste_tags  text[]      not null default '{}',
  auto_tagged boolean     not null default true,
  updated_at  timestamptz not null default now()
);

alter table public.campaign_taste_tags enable row level security;

create policy "campaign_taste_tags_select_all"
  on public.campaign_taste_tags for select
  using (true);

create policy "campaign_taste_tags_admin_write"
  on public.campaign_taste_tags for all
  using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );
