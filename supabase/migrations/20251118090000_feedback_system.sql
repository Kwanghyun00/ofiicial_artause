-- Feedback System
create extension if not exists "pgcrypto";
-- 사용자 피드백 및 문의사항 수집 시스템

-- 피드백 테이블 생성
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),

  -- 피드백 유형
  type text not null check (type in ('bug', 'feature', 'improvement', 'question', 'other')),

  -- 작성자 정보 (선택적)
  author_name text,
  author_email text,
  author_role text check (author_role in ('audience', 'partner', 'admin', 'anonymous')),

  -- 피드백 내용
  title text not null,
  description text not null,

  -- 페이지 정보 (어느 페이지에서 피드백을 남겼는지)
  page_url text,
  user_agent text,

  -- 첨부 파일 (스크린샷 등)
  attachments jsonb default '[]'::jsonb,

  -- 상태 관리
  status text not null default 'new' check (status in ('new', 'in_review', 'planned', 'completed', 'rejected')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),

  -- 관리자 메모
  admin_notes text,
  reviewed_by text,
  reviewed_at timestamptz,

  -- 타임스탬프
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 업데이트 트리거 설정
drop trigger if exists trg_feedback_updated_at on public.feedback;
create trigger trg_feedback_updated_at
  before update on public.feedback
  for each row
  execute function public.trigger_set_timestamps();

-- 인덱스 생성 (조회 성능 향상)
create index if not exists idx_feedback_status on public.feedback(status);
create index if not exists idx_feedback_type on public.feedback(type);
create index if not exists idx_feedback_created_at on public.feedback(created_at desc);
create index if not exists idx_feedback_author_email on public.feedback(author_email);

-- RLS (Row Level Security) 정책
alter table public.feedback enable row level security;

-- 모든 사용자가 피드백 제출 가능
create policy "Anyone can submit feedback"
  on public.feedback
  for insert
  to public
  with check (true);

-- 작성자는 자신의 피드백 조회 가능 (이메일 기준)
create policy "Users can view their own feedback"
  on public.feedback
  for select
  to public
  using (
    author_email = current_setting('request.jwt.claims', true)::json->>'email'
    or author_email is null
  );

-- 관리자는 모든 피드백 조회 및 수정 가능
create policy "Admins can view all feedback"
  on public.feedback
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.email = (current_setting('request.jwt.claims', true)::json->>'email')
      and users.role = 'admin'
    )
  );

create policy "Admins can update feedback"
  on public.feedback
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.email = (current_setting('request.jwt.claims', true)::json->>'email')
      and users.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.email = (current_setting('request.jwt.claims', true)::json->>'email')
      and users.role = 'admin'
    )
  );

-- 댓글 추가 (향후 확장 가능)
comment on table public.feedback is '사용자 피드백 및 문의사항';
comment on column public.feedback.type is '피드백 유형: bug, feature, improvement, question, other';
comment on column public.feedback.status is '처리 상태: new, in_review, planned, completed, rejected';
comment on column public.feedback.priority is '우선순위: low, medium, high, urgent';

