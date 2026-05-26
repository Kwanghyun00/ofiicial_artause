-- Migration: 체험단 모집 플랫폼 전환 — ticket_campaigns 필드 추가
-- 기존 컬럼과 충돌하지 않도록 IF NOT EXISTS 패턴 사용

ALTER TABLE public.ticket_campaigns
  ADD COLUMN IF NOT EXISTS experience_type text DEFAULT 'live_performance'
    CHECK (experience_type IN ('live_performance','rehearsal','preview','workshop','exhibition')),

  ADD COLUMN IF NOT EXISTS recruit_count integer NOT NULL DEFAULT 0,

  -- 체험 후 콘텐츠 제출 필요 플랫폼 목록 (예: '{instagram,blog_naver}')
  ADD COLUMN IF NOT EXISTS required_review_platforms text[] NOT NULL DEFAULT '{instagram}',

  -- 지원자 최소 팔로워 기준 (플랫폼별 jsonb: {"instagram": 500, "youtube": 1000})
  ADD COLUMN IF NOT EXISTS min_follower_criteria jsonb DEFAULT '{}'::jsonb,

  -- 관람 후 리뷰 제출 기한 (관람일 기준 N일 이내)
  ADD COLUMN IF NOT EXISTS review_deadline_days integer NOT NULL DEFAULT 7,

  -- 체험단 모집 진행 단계
  ADD COLUMN IF NOT EXISTS recruit_phase text NOT NULL DEFAULT 'recruiting'
    CHECK (recruit_phase IN ('recruiting','selected','experiencing','review_collection','completed')),

  -- 파트너가 입력하는 선정 기준 안내 텍스트
  ADD COLUMN IF NOT EXISTS selection_criteria_text text,

  -- 체험단 전용 날짜/시간/좌석 수 배열
  -- 예: [{"date":"2026-06-10","time":"19:30","slots":10}]
  ADD COLUMN IF NOT EXISTS experience_dates jsonb DEFAULT '[]'::jsonb;

-- 체험단 관련 컬럼 인덱스
CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_recruit_phase
  ON public.ticket_campaigns(recruit_phase);

CREATE INDEX IF NOT EXISTS idx_ticket_campaigns_experience_type
  ON public.ticket_campaigns(experience_type);
