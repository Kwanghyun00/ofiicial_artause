-- Migration: 체험단 모집 플랫폼 전환 — experience_reports 테이블 신규 생성
-- 체험단이 관람 후 제출하는 SNS 콘텐츠 링크 + 구조화된 평점을 저장

CREATE TABLE IF NOT EXISTS public.experience_reports (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 연결 키
  entry_id             uuid        NOT NULL REFERENCES public.ticket_entries(id) ON DELETE CASCADE,
  campaign_id          uuid        NOT NULL REFERENCES public.ticket_campaigns(id) ON DELETE CASCADE,
  performance_id       uuid        REFERENCES public.performances(id) ON DELETE SET NULL,

  -- 제출자 정보 (entry에서 복사, PII 최소화)
  submitter_email      text        NOT NULL,
  submitter_name       text        NOT NULL,

  -- 플랫폼별 콘텐츠 URL 배열 (자체 신고 참여 수치 포함)
  -- 예: [{"platform":"instagram","url":"https://...","self_reported_likes":120,"self_reported_comments":8}]
  submitted_content    jsonb       NOT NULL DEFAULT '[]'::jsonb,

  -- 5차원 평점 (장르 무관 공통 지표)
  rating_overall       integer     CHECK (rating_overall BETWEEN 1 AND 5),
  rating_performance   integer     CHECK (rating_performance BETWEEN 1 AND 5),  -- 연기/연주력
  rating_production    integer     CHECK (rating_production BETWEEN 1 AND 5),   -- 연출/무대
  rating_value         integer     CHECK (rating_value BETWEEN 1 AND 5),        -- 가성비/만족도
  rating_accessibility integer     CHECK (rating_accessibility BETWEEN 1 AND 5), -- 비전문가 접근성

  -- 자유 텍스트 리뷰
  review_text          text,
  hashtags_used        text[],
  genre_tags           text[],

  -- 관람 인증
  attended             boolean     NOT NULL DEFAULT false,
  attendance_photo_url text,

  -- 검증 상태 (파트너/관리자 수동 URL 확인)
  verification_status  text        NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','verified','rejected','expired')),
  verified_at          timestamptz,
  verified_by          text,
  rejection_reason     text,

  -- 연구용 메타데이터 (PII 없음)
  experience_date      date,
  days_to_submit       integer,    -- 관람일로부터 제출까지 소요일

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),

  -- 1 entry = 1 report
  UNIQUE (entry_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_experience_reports_campaign
  ON public.experience_reports(campaign_id);

CREATE INDEX IF NOT EXISTS idx_experience_reports_performance
  ON public.experience_reports(performance_id);

CREATE INDEX IF NOT EXISTS idx_experience_reports_status
  ON public.experience_reports(verification_status);

CREATE INDEX IF NOT EXISTS idx_experience_reports_created
  ON public.experience_reports(created_at DESC);

-- RLS 활성화
ALTER TABLE public.experience_reports ENABLE ROW LEVEL SECURITY;

-- 공개: verified 리포트만 누구나 열람 가능
CREATE POLICY "experience_reports_public_read"
  ON public.experience_reports FOR SELECT
  USING (verification_status = 'verified');

-- 서비스 롤: 모든 작업 허용 (서버 사이드 actions.ts에서 admin client 사용)
CREATE POLICY "experience_reports_service_role_all"
  ON public.experience_reports
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.set_experience_reports_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_experience_reports_updated_at
  BEFORE UPDATE ON public.experience_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_experience_reports_updated_at();
