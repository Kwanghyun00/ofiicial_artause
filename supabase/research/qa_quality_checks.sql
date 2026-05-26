-- ============================================================================
-- 데이터 품질 QA 검증 쿼리
-- 목적: PRD DB_RESEARCH_DATA_PLAN §5.5 품질 관리 기준 구현
-- 실행: 매일 배치 완료 후 (04:30 KST 이전 SLA)
-- ============================================================================
-- QA 항목:
--   1. 완전성: 일자별 레코드 수 전일 대비 급감 감지 (-30% 이하면 경보)
--   2. 유일성: 키 중복 검사
--   3. 참조 무결성: fact FK가 dim에 모두 매핑되는지 검사
--   4. 적시성: 적재 완료 시각 SLA 준수 (04:30 KST)
--   5. 정책 준수: PII 컬럼 유입 여부
-- ============================================================================

DO $$
DECLARE
  v_check_date       date    := CURRENT_DATE - 1;
  v_prev_date        date    := CURRENT_DATE - 2;
  v_sla_deadline_utc time    := '19:30:00';  -- 04:30 KST = 19:30 UTC
  v_alert_threshold  numeric := 0.30;         -- 30% 감소 기준
  v_issues           integer := 0;

  -- 레코드 수 변수
  v_today_entries   bigint;
  v_prev_entries    bigint;
  v_today_campaigns bigint;
  v_prev_campaigns  bigint;

  -- SLA 변수
  v_last_run_at     timestamptz;
BEGIN
  RAISE NOTICE '=== [QA] 품질 검증 시작: % ===', v_check_date;

  -- =========================================================================
  -- 1. 완전성 검사: 레코드 수 전일 대비 급감
  -- =========================================================================
  RAISE NOTICE '[QA:1] 완전성 검사 시작';

  -- entry_events_daily
  SELECT COUNT(*) INTO v_today_entries
  FROM research_raw.entry_events_daily
  WHERE snapshot_date = v_check_date;

  SELECT COUNT(*) INTO v_prev_entries
  FROM research_raw.entry_events_daily
  WHERE snapshot_date = v_prev_date;

  IF v_prev_entries > 0
     AND v_today_entries < v_prev_entries * (1 - v_alert_threshold)
  THEN
    RAISE WARNING '[QA:1:FAIL] entry_events_daily 레코드 급감 감지! 전일=%, 당일=%, 감소율=%.1f%%',
      v_prev_entries, v_today_entries,
      (1 - v_today_entries::numeric / v_prev_entries) * 100;
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:1:PASS] entry_events_daily: 전일=%, 당일=%', v_prev_entries, v_today_entries;
  END IF;

  -- campaign_snapshot_daily
  SELECT COUNT(*) INTO v_today_campaigns
  FROM research_raw.campaign_snapshot_daily
  WHERE snapshot_date = v_check_date;

  SELECT COUNT(*) INTO v_prev_campaigns
  FROM research_raw.campaign_snapshot_daily
  WHERE snapshot_date = v_prev_date;

  IF v_prev_campaigns > 0
     AND v_today_campaigns < v_prev_campaigns * (1 - v_alert_threshold)
  THEN
    RAISE WARNING '[QA:1:FAIL] campaign_snapshot_daily 레코드 급감! 전일=%, 당일=%',
      v_prev_campaigns, v_today_campaigns;
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:1:PASS] campaign_snapshot_daily: 전일=%, 당일=%', v_prev_campaigns, v_today_campaigns;
  END IF;

  -- =========================================================================
  -- 2. 유일성 검사: 키 중복
  -- =========================================================================
  RAISE NOTICE '[QA:2] 유일성 검사 시작';

  -- campaign_snapshot_daily: (campaign_id, snapshot_date) 유니크 보장 확인
  IF EXISTS (
    SELECT campaign_id, snapshot_date
    FROM research_raw.campaign_snapshot_daily
    WHERE snapshot_date = v_check_date
    GROUP BY campaign_id, snapshot_date
    HAVING COUNT(*) > 1
  ) THEN
    RAISE WARNING '[QA:2:FAIL] campaign_snapshot_daily 키 중복 발견!';
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:2:PASS] campaign_snapshot_daily 유일성 확인';
  END IF;

  -- fact_campaign_funnel_daily: (fact_date, campaign_id) 유니크
  IF EXISTS (
    SELECT fact_date, campaign_id
    FROM research_mart.fact_campaign_funnel_daily
    WHERE fact_date = v_check_date
    GROUP BY fact_date, campaign_id
    HAVING COUNT(*) > 1
  ) THEN
    RAISE WARNING '[QA:2:FAIL] fact_campaign_funnel_daily 키 중복 발견!';
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:2:PASS] fact_campaign_funnel_daily 유일성 확인';
  END IF;

  -- =========================================================================
  -- 3. 참조 무결성: fact의 campaign_id가 dim에 존재하는지
  -- =========================================================================
  RAISE NOTICE '[QA:3] 참조 무결성 검사 시작';

  IF EXISTS (
    SELECT 1
    FROM research_mart.fact_campaign_funnel_daily f
    LEFT JOIN research_mart.dim_campaign d ON d.campaign_id = f.campaign_id
    WHERE f.fact_date = v_check_date
      AND d.campaign_id IS NULL
  ) THEN
    RAISE WARNING '[QA:3:FAIL] fact_campaign_funnel_daily → dim_campaign FK 누락 발견!';
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:3:PASS] fact → dim 참조 무결성 확인';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM research_mart.fact_attendance_daily f
    LEFT JOIN research_mart.dim_campaign d ON d.campaign_id = f.campaign_id
    WHERE f.fact_date = v_check_date
      AND d.campaign_id IS NULL
  ) THEN
    RAISE WARNING '[QA:3:FAIL] fact_attendance_daily → dim_campaign FK 누락 발견!';
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:3:PASS] fact_attendance_daily → dim 참조 무결성 확인';
  END IF;

  -- =========================================================================
  -- 4. 적시성 검사: 파이프라인 last_run_at SLA (04:30 KST = 19:30 UTC)
  -- =========================================================================
  RAISE NOTICE '[QA:4] 적시성 검사 시작';

  SELECT last_run_at INTO v_last_run_at
  FROM research_raw._pipeline_meta
  WHERE schema_name = 'research_raw' AND table_name = 'entry_events_daily';

  IF v_last_run_at IS NULL
     OR (v_last_run_at AT TIME ZONE 'UTC')::time > v_sla_deadline_utc
  THEN
    RAISE WARNING '[QA:4:FAIL] 파이프라인 SLA 위반! last_run_at=%', v_last_run_at;
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:4:PASS] SLA 준수. last_run_at=%', v_last_run_at;
  END IF;

  -- =========================================================================
  -- 5. PII 정책 준수 검사: 이메일/전화번호 형식 패턴 탐지
  -- =========================================================================
  RAISE NOTICE '[QA:5] PII 정책 준수 검사 시작';

  -- research_user_key에 '@' 포함 = 해싱 실패
  IF EXISTS (
    SELECT 1 FROM research_raw.entry_events_daily
    WHERE snapshot_date = v_check_date
      AND research_user_key ~ '@'
    LIMIT 1
  ) THEN
    RAISE WARNING '[QA:5:FAIL:CRITICAL] entry_events_daily.research_user_key에 이메일 원문 유입 감지!';
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:5:PASS] entry_events_daily PII 미감지';
  END IF;

  -- penalty 스냅샷 PII 검사
  IF EXISTS (
    SELECT 1 FROM research_raw.user_penalty_snapshot_daily
    WHERE snapshot_date = v_check_date
      AND research_user_key ~ '@'
    LIMIT 1
  ) THEN
    RAISE WARNING '[QA:5:FAIL:CRITICAL] user_penalty_snapshot_daily에 이메일 원문 유입 감지!';
    v_issues := v_issues + 1;
  ELSE
    RAISE NOTICE '[QA:5:PASS] user_penalty_snapshot_daily PII 미감지';
  END IF;

  -- =========================================================================
  -- 최종 결과
  -- =========================================================================
  IF v_issues = 0 THEN
    RAISE NOTICE '=== [QA] 모든 검사 통과: issues=0 ===';
  ELSE
    RAISE WARNING '=== [QA] 검사 완료: issues=% (위의 WARNING 확인 요망) ===', v_issues;
  END IF;

  -- audit_logs에 QA 결과 기록
  INSERT INTO public.audit_logs (actor_type, action, target, payload)
  VALUES (
    'system',
    'research_qa_run',
    'research_batch',
    jsonb_build_object(
      'check_date', v_check_date,
      'issues', v_issues,
      'entry_count_today', v_today_entries,
      'campaign_count_today', v_today_campaigns,
      'last_pipeline_run', v_last_run_at
    )
  );

END $$;

-- ============================================================================
-- 보존 정책 집행: 기한 초과 데이터 삭제
-- ============================================================================
DO $$
DECLARE
  v_deleted bigint;
BEGIN
  RAISE NOTICE '[RETENTION] 보존 기간 초과 데이터 삭제 시작';

  -- research_raw: 180일
  DELETE FROM research_raw.entry_events_daily
  WHERE snapshot_date < CURRENT_DATE - 180;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] entry_events_daily 삭제: %건', v_deleted;

  DELETE FROM research_raw.campaign_snapshot_daily
  WHERE snapshot_date < CURRENT_DATE - 180;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] campaign_snapshot_daily 삭제: %건', v_deleted;

  DELETE FROM research_raw.user_penalty_snapshot_daily
  WHERE snapshot_date < CURRENT_DATE - 180;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] user_penalty_snapshot_daily 삭제: %건', v_deleted;

  DELETE FROM research_raw.ad_verification_snapshot_daily
  WHERE snapshot_date < CURRENT_DATE - 180;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] ad_verification_snapshot_daily 삭제: %건', v_deleted;

  -- research_mart: 730일(2년)
  DELETE FROM research_mart.fact_campaign_funnel_daily
  WHERE fact_date < CURRENT_DATE - 730;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] fact_campaign_funnel_daily 삭제: %건', v_deleted;

  DELETE FROM research_mart.fact_penalty_effect_daily
  WHERE fact_date < CURRENT_DATE - 730;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] fact_penalty_effect_daily 삭제: %건', v_deleted;

  DELETE FROM research_mart.fact_attendance_daily
  WHERE fact_date < CURRENT_DATE - 730;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '[RETENTION] fact_attendance_daily 삭제: %건', v_deleted;

  RAISE NOTICE '[RETENTION] 완료';
END $$;
