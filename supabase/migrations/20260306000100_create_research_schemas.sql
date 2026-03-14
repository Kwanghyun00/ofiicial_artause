-- ============================================================================
-- Research 스키마 생성
-- 목적: PRD DB_RESEARCH_DATA_PLAN §5.2 기준으로 운영 DB와 연구 레이어 분리
-- 생성일: 2026-03-06
-- ============================================================================
-- 구조:
--   public           → 운영 원본 (서비스 트랜잭션)
--   research_raw     → 비식별 원천 스냅샷 (PII 제거)
--   research_mart    → 주제별 집계 테이블 (분석용)
-- ============================================================================

-- pgcrypto: SHA-256 해시 기반 비식별화에 사용
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 스키마 생성
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS research_raw;
CREATE SCHEMA IF NOT EXISTS research_mart;

COMMENT ON SCHEMA research_raw IS
  '비식별 원천 스냅샷. 운영 테이블에서 PII를 제거/해시 치환하여 매일 적재. 보존 180일.';

COMMENT ON SCHEMA research_mart IS
  '주제별 집계 분석 테이블. research_raw 기반으로 매일 갱신. 보존 2년.';

-- ============================================================================
-- research_raw 테이블 정의
-- ============================================================================

-- 응모 이벤트 일별 스냅샷 (ticket_entries 기반, PII 해시 치환)
CREATE TABLE IF NOT EXISTS research_raw.entry_events_daily (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date   date NOT NULL,
  -- 비식별 사용자 키 (SHA-256(applicant_email || SALT))
  research_user_key text NOT NULL,
  campaign_id     uuid NOT NULL,
  consent_marketing boolean,
  submitted_at    timestamptz NOT NULL,
  -- PII 없는 응답 메타데이터만 (answers에서 추출, free-text 제외)
  has_answers     boolean,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE research_raw.entry_events_daily IS
  '[research_raw] 응모 이벤트 일별 스냅샷. PII 제거 완료. 원본: public.ticket_entries';
COMMENT ON COLUMN research_raw.entry_events_daily.research_user_key IS
  'SHA-256(applicant_email || PII_SALT). 개인 역추적 불가.';

CREATE INDEX IF NOT EXISTS idx_entry_events_daily_date
  ON research_raw.entry_events_daily (snapshot_date);
CREATE INDEX IF NOT EXISTS idx_entry_events_daily_campaign
  ON research_raw.entry_events_daily (campaign_id, snapshot_date);

-- 캠페인 일별 스냅샷
CREATE TABLE IF NOT EXISTS research_raw.campaign_snapshot_daily (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date         date NOT NULL,
  campaign_id           uuid NOT NULL,
  performance_id        uuid,
  title                 text NOT NULL,
  status                text,
  starts_at             timestamptz,
  ends_at               timestamptz,
  allocation_winners    integer,
  allocation_waitlist   integer,
  algorithm_version     text,
  total_entries         integer,  -- 집계값
  total_participants    integer,  -- 집계값
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, snapshot_date)
);

COMMENT ON TABLE research_raw.campaign_snapshot_daily IS
  '[research_raw] 캠페인 메타데이터 일별 스냅샷. PII 없음. 원본: public.ticket_campaigns';

CREATE INDEX IF NOT EXISTS idx_campaign_snapshot_date
  ON research_raw.campaign_snapshot_daily (snapshot_date);

-- 사용자 패널티 일별 스냅샷
CREATE TABLE IF NOT EXISTS research_raw.user_penalty_snapshot_daily (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date     date NOT NULL,
  research_user_key text NOT NULL,
  penalty_type      text NOT NULL,
  points            integer NOT NULL,
  expires_at        timestamptz NOT NULL,
  campaign_id       uuid,
  created_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE research_raw.user_penalty_snapshot_daily IS
  '[research_raw] 패널티 일별 스냅샷. PII 해시 치환. 원본: public.user_penalties';

CREATE INDEX IF NOT EXISTS idx_penalty_snapshot_date
  ON research_raw.user_penalty_snapshot_daily (snapshot_date);
CREATE INDEX IF NOT EXISTS idx_penalty_snapshot_user
  ON research_raw.user_penalty_snapshot_daily (research_user_key, snapshot_date);

-- 광고 검증 스냅샷
CREATE TABLE IF NOT EXISTS research_raw.ad_verification_snapshot_daily (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date       date NOT NULL,
  research_user_key   text NOT NULL,
  campaign_id         uuid NOT NULL,
  watched_ratio       numeric(5,2),
  focus_lost          boolean,
  muted               boolean,
  completed           boolean,
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE research_raw.ad_verification_snapshot_daily IS
  '[research_raw] 광고 시청 검증 스냅샷. PII 해시 치환. 원본: public.campaign_ad_watch_verifications';

CREATE INDEX IF NOT EXISTS idx_ad_verification_snapshot_date
  ON research_raw.ad_verification_snapshot_daily (snapshot_date);

-- ============================================================================
-- research_mart 테이블 정의
-- ============================================================================

-- 캠페인 Dimension
CREATE TABLE IF NOT EXISTS research_mart.dim_campaign (
  campaign_id           uuid PRIMARY KEY,
  performance_id        uuid,
  title                 text NOT NULL,
  category              text,
  region                text,
  algorithm_version     text,
  allocation_winners    integer,
  allocation_waitlist   integer,
  starts_at             timestamptz,
  ends_at               timestamptz,
  duration_days         integer,
  updated_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE research_mart.dim_campaign IS
  '[research_mart] 캠페인 차원 테이블. 분석 조인 키 제공.';

-- 캠페인 퍼널 일별 Fact
CREATE TABLE IF NOT EXISTS research_mart.fact_campaign_funnel_daily (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_date                 date NOT NULL,
  campaign_id               uuid NOT NULL REFERENCES research_mart.dim_campaign(campaign_id),
  total_entries             integer NOT NULL DEFAULT 0,
  unique_participants       integer NOT NULL DEFAULT 0,
  ad_verified_count         integer NOT NULL DEFAULT 0,
  ad_completion_rate        numeric(5,2),  -- ad_verified / entries * 100
  entry_conversion_rate     numeric(5,2),  -- entries / (ad_verified + 1) * 100
  winner_count              integer,
  waitlist_count            integer,
  acceptance_count          integer,       -- 당첨 후 수락
  decline_count             integer,       -- 당첨 후 거절
  created_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fact_date, campaign_id)
);

COMMENT ON TABLE research_mart.fact_campaign_funnel_daily IS
  '[research_mart] 캠페인 일별 응모 퍼널 지표. 핵심 연구 질문 §5.1.1/5.1.2 대응.';

CREATE INDEX IF NOT EXISTS idx_funnel_date ON research_mart.fact_campaign_funnel_daily (fact_date);
CREATE INDEX IF NOT EXISTS idx_funnel_campaign ON research_mart.fact_campaign_funnel_daily (campaign_id, fact_date);

-- 패널티 정책 효과 Fact
CREATE TABLE IF NOT EXISTS research_mart.fact_penalty_effect_daily (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_date               date NOT NULL,
  campaign_id             uuid,
  penalty_type            text NOT NULL,
  newly_penalized_users   integer NOT NULL DEFAULT 0,
  active_penalty_users    integer NOT NULL DEFAULT 0,
  re_entry_rate           numeric(5,2),   -- 패널티 후 재응모 비율
  no_show_rate            numeric(5,2),   -- 당첨 후 노쇼 비율
  created_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fact_date, campaign_id, penalty_type)
);

COMMENT ON TABLE research_mart.fact_penalty_effect_daily IS
  '[research_mart] 패널티 정책 효과 일별 지표. 핵심 연구 질문 §5.1.3 대응.';

-- 출석/당첨 Fact
CREATE TABLE IF NOT EXISTS research_mart.fact_attendance_daily (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_date             date NOT NULL,
  campaign_id           uuid NOT NULL REFERENCES research_mart.dim_campaign(campaign_id),
  winner_count          integer NOT NULL DEFAULT 0,
  attendance_count      integer NOT NULL DEFAULT 0,
  no_show_count         integer NOT NULL DEFAULT 0,
  attendance_rate       numeric(5,2),  -- attendance / winner * 100
  no_show_rate          numeric(5,2),
  created_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (fact_date, campaign_id)
);

COMMENT ON TABLE research_mart.fact_attendance_daily IS
  '[research_mart] 당첨자 출석/노쇼 일별 지표.';

-- ============================================================================
-- 접근 권한 (Role 기반)
-- ============================================================================

-- research_reader: mart 읽기 전용 (연구자용)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'research_reader') THEN
    CREATE ROLE research_reader;
  END IF;
END $$;

GRANT USAGE ON SCHEMA research_mart TO research_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA research_mart TO research_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA research_mart
  GRANT SELECT ON TABLES TO research_reader;

-- research_admin: 파이프라인 운영 담당자 (raw + mart 읽기/쓰기)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'research_admin') THEN
    CREATE ROLE research_admin;
  END IF;
END $$;

GRANT USAGE ON SCHEMA research_raw, research_mart TO research_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA research_raw TO research_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA research_mart TO research_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA research_raw
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO research_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA research_mart
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO research_admin;

-- research_raw 스키마는 research_reader에게 미노출 (원천 보호)
-- research_reader는 mart만 접근 가능

-- ============================================================================
-- 보존 정책 메타 테이블 (파이프라인 참조용)
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_raw._pipeline_meta (
  schema_name   text NOT NULL,
  table_name    text NOT NULL,
  retention_days integer NOT NULL,
  last_run_at   timestamptz,
  last_row_count bigint,
  notes         text,
  PRIMARY KEY (schema_name, table_name)
);

INSERT INTO research_raw._pipeline_meta (schema_name, table_name, retention_days, notes)
VALUES
  ('research_raw', 'entry_events_daily',           180, 'PRD §5.7: 180일 보존'),
  ('research_raw', 'campaign_snapshot_daily',       180, 'PRD §5.7: 180일 보존'),
  ('research_raw', 'user_penalty_snapshot_daily',   180, 'PRD §5.7: 180일 보존'),
  ('research_raw', 'ad_verification_snapshot_daily',180, 'PRD §5.7: 180일 보존'),
  ('research_mart','fact_campaign_funnel_daily',    730, 'PRD §5.7: 2년(730일) 보존'),
  ('research_mart','fact_penalty_effect_daily',     730, 'PRD §5.7: 2년 보존'),
  ('research_mart','fact_attendance_daily',         730, 'PRD §5.7: 2년 보존'),
  ('research_mart','dim_campaign',                  730, '캠페인 dim은 mart와 동일 보존')
ON CONFLICT DO NOTHING;
