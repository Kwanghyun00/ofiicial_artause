-- Migration: 체험단 모집 플랫폼 전환 — Research Mart 팩트 테이블 확장
-- 기존 research_raw / research_mart 스키마에 체험단 전용 분석 테이블 추가

-- ============================================================================
-- research_raw: 체험단 리포트 스냅샷 (PII 제거)
-- ============================================================================

CREATE TABLE IF NOT EXISTS research_raw.experience_report_events_daily (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date         date        NOT NULL,
  campaign_id           uuid        NOT NULL,
  performance_id        uuid,
  genre                 text,         -- performances.category에서 복사
  region                text,

  -- 플랫폼 존재 여부 (PII 없는 boolean 플래그)
  platform              text        NOT NULL,  -- 'instagram' | 'blog_naver' | 'youtube' | 'tiktok'
  has_report            boolean     NOT NULL DEFAULT false,

  -- 제출 타이밍 (연구용)
  days_to_submit        integer,

  -- 평점 버킷 (역추적 방지)
  rating_overall_bucket text,        -- '1-2' | '3' | '4' | '5'

  -- 팔로워 범위 버킷 (자체 신고 기반, PII 아님)
  follower_bucket       text,        -- '0-500' | '501-2000' | '2001-10000' | '10000+'

  verification_status   text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exp_report_events_date
  ON research_raw.experience_report_events_daily(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_exp_report_events_campaign
  ON research_raw.experience_report_events_daily(campaign_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_exp_report_events_genre
  ON research_raw.experience_report_events_daily(genre, platform, snapshot_date);

COMMENT ON TABLE research_raw.experience_report_events_daily IS
  '[research_raw] 체험단 콘텐츠 제출 이벤트 일별 스냅샷. PII 제거. 원본: public.experience_reports';

-- research_raw: 지원서 SNS 정보 스냅샷 (팔로워 버킷화)
ALTER TABLE research_raw.entry_events_daily
  ADD COLUMN IF NOT EXISTS sns_platform_flags      jsonb,
  -- {"has_instagram": true, "has_blog": false, "has_youtube": true}
  ADD COLUMN IF NOT EXISTS instagram_followers_bucket text,
  -- '0-500' | '501-2000' | '2001-10000' | '10000+'
  ADD COLUMN IF NOT EXISTS content_type_flags      jsonb;
  -- {"photo_review": true, "video_review": false, "blog_post": true}

-- ============================================================================
-- research_mart: 체험단 퍼널 일별 팩트 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS research_mart.fact_experience_report_daily (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_date               date        NOT NULL,
  campaign_id             uuid        NOT NULL,
  performance_id          uuid,
  genre                   text,
  region                  text,

  -- 체험단 퍼널 지표
  recruited_count         integer     NOT NULL DEFAULT 0,   -- 선발 인원
  attended_count          integer     NOT NULL DEFAULT 0,   -- 실제 관람
  report_submitted_count  integer     NOT NULL DEFAULT 0,   -- 리포트 제출
  report_verified_count   integer     NOT NULL DEFAULT 0,   -- 검증 완료
  submission_rate         numeric(5,2),    -- submitted / attended * 100
  verification_rate       numeric(5,2),   -- verified / submitted * 100

  -- 콘텐츠 지표
  avg_rating_overall      numeric(3,2),
  avg_instagram_followers numeric(10,2),  -- 선발 체험단 평균 팔로워 (자체 신고)
  instagram_post_count    integer,
  blog_post_count         integer,
  youtube_video_count     integer,
  tiktok_post_count       integer,

  -- 제출 타이밍
  avg_days_to_submit      numeric(4,1),

  created_at              timestamptz NOT NULL DEFAULT now(),

  UNIQUE (fact_date, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_fact_exp_report_date
  ON research_mart.fact_experience_report_daily(fact_date DESC);
CREATE INDEX IF NOT EXISTS idx_fact_exp_report_genre
  ON research_mart.fact_experience_report_daily(genre, fact_date DESC);

COMMENT ON TABLE research_mart.fact_experience_report_daily IS
  '[research_mart] 캠페인별 일별 체험단 퍼널 지표. batch_refresh_mart.sql로 매일 갱신.';

-- ============================================================================
-- research_mart: SNS 플랫폼 × 장르 일별 팩트 테이블
-- ============================================================================

CREATE TABLE IF NOT EXISTS research_mart.fact_sns_platform_daily (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_date        date        NOT NULL,
  genre            text,       -- performances.category
  platform         text        NOT NULL
    CHECK (platform IN ('instagram','blog_naver','youtube','tiktok')),

  -- 지원자 지표 (버킷 기반, PII 없음)
  applicant_count  integer     NOT NULL DEFAULT 0,
  avg_followers    numeric(10,2),
  selected_count   integer     NOT NULL DEFAULT 0,
  report_count     integer     NOT NULL DEFAULT 0,

  created_at       timestamptz NOT NULL DEFAULT now(),

  UNIQUE (fact_date, genre, platform)
);

CREATE INDEX IF NOT EXISTS idx_fact_sns_platform_date
  ON research_mart.fact_sns_platform_daily(fact_date DESC);
CREATE INDEX IF NOT EXISTS idx_fact_sns_platform_genre
  ON research_mart.fact_sns_platform_daily(genre, platform, fact_date DESC);

COMMENT ON TABLE research_mart.fact_sns_platform_daily IS
  '[research_mart] 장르×플랫폼별 일별 SNS 지원자 분포. batch_refresh_mart.sql로 매일 갱신.';
