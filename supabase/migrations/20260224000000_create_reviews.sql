-- Reviews system migration
-- Created: 2026-02-24

-- ============================================================
-- reviews 테이블
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),

  -- 공연 연결
  performance_id uuid not null references public.performances(id) on delete cascade,

  -- 작성자 (Supabase auth 불필요)
  author_name text not null,
  author_email text not null,

  -- 예매 인증 (ticket_entries 연결, 선택)
  reservation_id uuid references public.ticket_entries(id) on delete set null,
  verified_attendance boolean not null default false,

  -- 평점 (1-5)
  rating_overall integer not null check (rating_overall between 1 and 5),
  rating_acting integer check (rating_acting between 1 and 5),
  rating_direction integer check (rating_direction between 1 and 5),
  rating_immersion integer check (rating_immersion between 1 and 5),

  -- 내용
  tags text[] default '{}',
  review_headline text,
  review_text text,
  spoiler_flag boolean not null default false,

  -- 소셜 신호
  helpful_count integer not null default 0,
  report_count integer not null default 0,

  -- 모더레이션
  status text not null default 'published'
    check (status in ('published', 'hidden', 'reported')),

  -- 타임스탬프
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at 트리거 (기존 trigger_set_timestamps 함수 재사용)
drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row
  execute function public.trigger_set_timestamps();

-- 인덱스
create index if not exists idx_reviews_performance_id
  on public.reviews(performance_id);
create index if not exists idx_reviews_status
  on public.reviews(status);
create index if not exists idx_reviews_created_at
  on public.reviews(created_at desc);
create index if not exists idx_reviews_author_email
  on public.reviews(author_email);

-- 도움돼요 원자적 증가 함수
create or replace function public.increment_review_helpful(review_id uuid)
returns void as $$
  update public.reviews
  set helpful_count = helpful_count + 1
  where id = review_id and status = 'published';
$$ language sql security definer;

-- ============================================================
-- review_events 테이블 (분석/추천 데이터용)
-- ============================================================
create table if not exists public.review_events (
  id uuid primary key default gen_random_uuid(),
  user_identifier text not null,
  performance_id uuid references public.performances(id) on delete cascade,
  review_id uuid references public.reviews(id) on delete cascade,
  event_type text not null
    check (event_type in ('view', 'expand', 'helpful', 'report')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_review_events_review_id
  on public.review_events(review_id);
create index if not exists idx_review_events_performance_id
  on public.review_events(performance_id);

-- ============================================================
-- RLS 정책
-- ============================================================
alter table public.reviews enable row level security;
alter table public.review_events enable row level security;

-- 공개 published 후기 읽기
create policy "Published reviews are public"
  on public.reviews for select
  to public
  using (status = 'published');

-- 누구나 후기 작성 가능 (애플리케이션 레벨에서 중복 체크)
create policy "Anyone can submit a review"
  on public.reviews for insert
  to public
  with check (status = 'published');

-- helpful_count 업데이트 허용 (도움돼요 버튼)
create policy "Anyone can update helpful_count"
  on public.reviews for update
  to public
  using (status = 'published')
  with check (status = 'published');

-- 리뷰 이벤트 삽입 허용
create policy "Anyone can insert review events"
  on public.review_events for insert
  to public
  with check (true);
