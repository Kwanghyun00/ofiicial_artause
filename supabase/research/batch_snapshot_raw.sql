-- ============================================================================
-- 일배치: research_raw 스냅샷 적재 (03:30 KST = 18:30 UTC)
-- 목적: 운영 테이블 → research_raw 비식별 스냅샷
-- 실행: Supabase Edge Function 또는 pg_cron
-- PRD: §5.3 비식별/개인정보 처리 원칙, §5.4 데이터 수집/갱신 주기
--
-- PII_SALT: public.research_config 테이블에서 service_role로 읽음
--   INSERT: REST API + service_role key로 1회 설정 (2026-03-06 완료)
-- ============================================================================

-- ============================================================================
-- 0. 실행 파라미터
-- ============================================================================
DO $$
DECLARE
  v_snapshot_date date := CURRENT_DATE - 1;  -- 전일 기준 스냅샷
  v_salt          text := (SELECT value FROM public.research_config WHERE key = 'pii_salt');
  v_batch_id      uuid := gen_random_uuid();
  v_entry_count   bigint;
  v_campaign_count bigint;
  v_penalty_count  bigint;
  v_ad_count       bigint;
BEGIN
  RAISE NOTICE '[research_batch] 시작: snapshot_date=%, batch_id=%', v_snapshot_date, v_batch_id;

  IF v_salt IS NULL OR v_salt = '' THEN
    RAISE EXCEPTION '[research_batch] research_config.pii_salt 가 설정되지 않았습니다. 배치를 중단합니다.';
  END IF;

  -- ============================================================================
  -- 1. entry_events_daily: ticket_entries → 비식별 스냅샷
  -- ============================================================================
  -- 당일 스냅샷 중복 방지 (재실행 안전)
  DELETE FROM research_raw.entry_events_daily
  WHERE snapshot_date = v_snapshot_date;

  INSERT INTO research_raw.entry_events_daily (
    snapshot_date,
    research_user_key,
    campaign_id,
    consent_marketing,
    submitted_at,
    has_answers
  )
  SELECT
    v_snapshot_date,
    -- PII 해시: SHA-256(lower(trim(email)) || salt)
    encode(
      digest(lower(trim(te.applicant_email)) || v_salt, 'sha256'),
      'hex'
    ) AS research_user_key,
    te.campaign_id,
    te.consent_marketing,
    te.submitted_at,
    (te.answers IS NOT NULL AND te.answers != '{}'::jsonb) AS has_answers
  FROM public.ticket_entries te
  WHERE date_trunc('day', te.submitted_at AT TIME ZONE 'Asia/Seoul')
        = v_snapshot_date;

  GET DIAGNOSTICS v_entry_count = ROW_COUNT;

  -- ============================================================================
  -- 2. campaign_snapshot_daily: ticket_campaigns + 집계값
  -- ============================================================================
  DELETE FROM research_raw.campaign_snapshot_daily
  WHERE snapshot_date = v_snapshot_date;

  INSERT INTO research_raw.campaign_snapshot_daily (
    snapshot_date,
    campaign_id,
    performance_id,
    title,
    status,
    starts_at,
    ends_at,
    allocation_winners,
    allocation_waitlist,
    algorithm_version,
    total_entries,
    total_participants
  )
  SELECT
    v_snapshot_date,
    tc.id,
    tc.performance_id,
    tc.title,
    tc.status,
    tc.starts_at,
    tc.ends_at,
    (tc.allocation->>'winners')::integer,
    (tc.allocation->>'waitlist')::integer,
    tc.algorithm_version,
    COUNT(DISTINCT te.id),
    COUNT(DISTINCT cp.id)
  FROM public.ticket_campaigns tc
  LEFT JOIN public.ticket_entries   te ON te.campaign_id = tc.id
  LEFT JOIN public.campaign_participants cp ON cp.campaign_id = tc.id
  -- 스냅샷 기준: 캠페인이 당일 이전에 시작된 것
  WHERE tc.starts_at::date <= v_snapshot_date
  GROUP BY tc.id, tc.performance_id, tc.title, tc.status,
           tc.starts_at, tc.ends_at, tc.allocation, tc.algorithm_version;

  GET DIAGNOSTICS v_campaign_count = ROW_COUNT;

  -- ============================================================================
  -- 3. user_penalty_snapshot_daily: user_penalties → 비식별 스냅샷
  -- ============================================================================
  DELETE FROM research_raw.user_penalty_snapshot_daily
  WHERE snapshot_date = v_snapshot_date;

  INSERT INTO research_raw.user_penalty_snapshot_daily (
    snapshot_date,
    research_user_key,
    penalty_type,
    points,
    expires_at,
    campaign_id
  )
  SELECT
    v_snapshot_date,
    -- user_id 해시 (email 없으면 user_id + salt)
    encode(
      digest(up.user_id::text || v_salt, 'sha256'),
      'hex'
    ) AS research_user_key,
    up.penalty_type,
    up.points,
    up.expires_at,
    up.campaign_id
  FROM public.user_penalties up
  WHERE date_trunc('day', up.created_at AT TIME ZONE 'Asia/Seoul')
        = v_snapshot_date;

  GET DIAGNOSTICS v_penalty_count = ROW_COUNT;

  -- ============================================================================
  -- 4. ad_verification_snapshot_daily: campaign_ad_watch_verifications → 비식별
  -- ============================================================================
  DELETE FROM research_raw.ad_verification_snapshot_daily
  WHERE snapshot_date = v_snapshot_date;

  INSERT INTO research_raw.ad_verification_snapshot_daily (
    snapshot_date,
    research_user_key,
    campaign_id,
    watched_ratio,
    focus_lost,
    muted,
    completed
  )
  SELECT
    v_snapshot_date,
    encode(
      digest(av.participant_id::text || v_salt, 'sha256'),
      'hex'
    ) AS research_user_key,
    av.campaign_id,
    av.watched_ratio,
    av.focus_lost,
    av.muted,
    (av.completed_at IS NOT NULL) AS completed
  FROM public.campaign_ad_watch_verifications av
  WHERE date_trunc('day', av.created_at AT TIME ZONE 'Asia/Seoul')
        = v_snapshot_date;

  GET DIAGNOSTICS v_ad_count = ROW_COUNT;

  -- ============================================================================
  -- 5. 파이프라인 메타 갱신
  -- ============================================================================
  UPDATE research_raw._pipeline_meta
  SET last_run_at = now(), last_row_count = v_entry_count
  WHERE schema_name = 'research_raw' AND table_name = 'entry_events_daily';

  UPDATE research_raw._pipeline_meta
  SET last_run_at = now(), last_row_count = v_campaign_count
  WHERE schema_name = 'research_raw' AND table_name = 'campaign_snapshot_daily';

  UPDATE research_raw._pipeline_meta
  SET last_run_at = now(), last_row_count = v_penalty_count
  WHERE schema_name = 'research_raw' AND table_name = 'user_penalty_snapshot_daily';

  UPDATE research_raw._pipeline_meta
  SET last_run_at = now(), last_row_count = v_ad_count
  WHERE schema_name = 'research_raw' AND table_name = 'ad_verification_snapshot_daily';

  RAISE NOTICE '[research_batch] 완료: entries=%, campaigns=%, penalties=%, ad_verifications=%',
    v_entry_count, v_campaign_count, v_penalty_count, v_ad_count;

  -- ============================================================================
  -- 6. PII 유입 여부 검사 (QA: §5.5 정책 준수)
  -- ============================================================================
  -- entry_events_daily에 이메일 패턴이 있으면 경보
  IF EXISTS (
    SELECT 1 FROM research_raw.entry_events_daily
    WHERE snapshot_date = v_snapshot_date
      AND research_user_key ~ '@'
  ) THEN
    RAISE WARNING '[QA:PII_ALERT] entry_events_daily에 이메일 형식 데이터 감지됨!';
  END IF;

END $$;
