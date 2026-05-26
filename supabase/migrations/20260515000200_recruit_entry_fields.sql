-- Migration: 체험단 모집 플랫폼 전환 — ticket_entries 지원서 필드 추가
-- 기존 answers(jsonb) 컬럼은 유지. 신규 필드는 타입 쿼리 가능한 전용 컬럼으로 분리.

ALTER TABLE public.ticket_entries
  -- SNS 자격 정보 (자체 신고 기반, 파트너가 수동 검증)
  ADD COLUMN IF NOT EXISTS sns_instagram_handle       text,
  ADD COLUMN IF NOT EXISTS sns_instagram_followers    integer,
  ADD COLUMN IF NOT EXISTS sns_blog_url               text,
  ADD COLUMN IF NOT EXISTS sns_blog_monthly_visitors  integer,
  ADD COLUMN IF NOT EXISTS sns_youtube_url            text,
  ADD COLUMN IF NOT EXISTS sns_youtube_subscribers    integer,
  ADD COLUMN IF NOT EXISTS sns_tiktok_handle          text,
  ADD COLUMN IF NOT EXISTS sns_tiktok_followers       integer,

  -- 지원 동기 및 과거 활동
  ADD COLUMN IF NOT EXISTS motivation_text            text,
  ADD COLUMN IF NOT EXISTS past_experience_text       text,
  ADD COLUMN IF NOT EXISTS review_sample_url          text,

  -- 활동 계획
  -- 예: '{photo_review,video_review,blog_post,short_form}'
  ADD COLUMN IF NOT EXISTS content_type_preference    text[],
  ADD COLUMN IF NOT EXISTS available_experience_dates text[],

  -- 파트너 검토 메모 (내부용)
  ADD COLUMN IF NOT EXISTS partner_review_notes       text,
  ADD COLUMN IF NOT EXISTS sns_verified_at            timestamptz,
  ADD COLUMN IF NOT EXISTS sns_verified_by            text,

  -- 체험 후 리뷰 제출 상태 추적
  ADD COLUMN IF NOT EXISTS review_submitted           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_submitted_at        timestamptz;

-- 팔로워 수 기준 정렬/필터용 인덱스
CREATE INDEX IF NOT EXISTS idx_ticket_entries_sns_instagram_followers
  ON public.ticket_entries(sns_instagram_followers DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_ticket_entries_review_submitted
  ON public.ticket_entries(review_submitted);
