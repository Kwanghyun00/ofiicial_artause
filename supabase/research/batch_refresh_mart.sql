-- ============================================================================
-- 일배치: research_mart 집계 갱신 (04:00 KST = 19:00 UTC)
-- 목적: research_raw → research_mart 집계 테이블 갱신
-- 실행: Supabase Edge Function 또는 pg_cron (batch_snapshot_raw.sql 이후)
-- PRD: §5.4, §5.1 핵심 연구 질문 대응
-- ============================================================================

DO $$
DECLARE
  v_fact_date date := CURRENT_DATE - 1;
BEGIN
  RAISE NOTICE '[mart_batch] 시작: fact_date=%', v_fact_date;

  -- ============================================================================
  -- 1. dim_campaign 갱신 (SCD Type 1: 덮어쓰기)
  -- ============================================================================
  INSERT INTO research_mart.dim_campaign (
    campaign_id,
    performance_id,
    title,
    algorithm_version,
    allocation_winners,
    allocation_waitlist,
    starts_at,
    ends_at,
    duration_days,
    updated_at
  )
  SELECT
    tc.id,
    tc.performance_id,
    tc.title,
    tc.algorithm_version,
    (tc.allocation->>'winners')::integer,
    (tc.allocation->>'waitlist')::integer,
    tc.starts_at,
    tc.ends_at,
    EXTRACT(DAY FROM tc.ends_at - tc.starts_at)::integer,
    now()
  FROM public.ticket_campaigns tc
  ON CONFLICT (campaign_id) DO UPDATE SET
    performance_id     = EXCLUDED.performance_id,
    title              = EXCLUDED.title,
    algorithm_version  = EXCLUDED.algorithm_version,
    allocation_winners = EXCLUDED.allocation_winners,
    allocation_waitlist= EXCLUDED.allocation_waitlist,
    starts_at          = EXCLUDED.starts_at,
    ends_at            = EXCLUDED.ends_at,
    duration_days      = EXCLUDED.duration_days,
    updated_at         = now();

  -- ============================================================================
  -- 2. fact_campaign_funnel_daily 갱신
  -- 핵심 연구 질문: §5.1.1 캠페인 특성 vs 응모 전환율, §5.1.2 광고 통과율 vs 응모 완료율
  -- ============================================================================
  DELETE FROM research_mart.fact_campaign_funnel_daily
  WHERE fact_date = v_fact_date;

  INSERT INTO research_mart.fact_campaign_funnel_daily (
    fact_date,
    campaign_id,
    total_entries,
    unique_participants,
    ad_verified_count,
    ad_completion_rate,
    entry_conversion_rate,
    winner_count,
    waitlist_count,
    acceptance_count,
    decline_count
  )
  SELECT
    v_fact_date                             AS fact_date,
    cs.campaign_id,
    cs.total_entries,
    cs.total_participants                   AS unique_participants,
    COALESCE(av_agg.ad_verified_count, 0)  AS ad_verified_count,
    -- 광고 통과율: 완료 / 전체 응모자 * 100
    CASE WHEN cs.total_entries > 0
      THEN ROUND(COALESCE(av_agg.ad_verified_count, 0)::numeric / cs.total_entries * 100, 2)
      ELSE 0
    END                                     AS ad_completion_rate,
    -- 응모 전환율: 응모 완료 / 광고 통과 * 100
    CASE WHEN COALESCE(av_agg.ad_verified_count, 0) > 0
      THEN ROUND(cs.total_entries::numeric / av_agg.ad_verified_count * 100, 2)
      ELSE NULL
    END                                     AS entry_conversion_rate,
    draw_agg.winner_count,
    draw_agg.waitlist_count,
    resp_agg.acceptance_count,
    resp_agg.decline_count
  FROM research_raw.campaign_snapshot_daily cs
  -- 광고 검증 집계
  LEFT JOIN (
    SELECT campaign_id,
           COUNT(*) FILTER (WHERE completed) AS ad_verified_count
    FROM research_raw.ad_verification_snapshot_daily
    WHERE snapshot_date = v_fact_date
    GROUP BY campaign_id
  ) av_agg ON av_agg.campaign_id = cs.campaign_id
  -- 추첨 결과 (운영 테이블 직접 참조)
  LEFT JOIN (
    SELECT
      campaign_id,
      jsonb_array_length(winners)  AS winner_count,
      jsonb_array_length(waitlist) AS waitlist_count
    FROM public.campaign_draws
    WHERE run_at::date = v_fact_date
  ) draw_agg ON draw_agg.campaign_id = cs.campaign_id
  -- 당첨자 응답 집계
  LEFT JOIN (
    SELECT
      cd.campaign_id,
      COUNT(*) FILTER (WHERE cwr.status = 'accepted') AS acceptance_count,
      COUNT(*) FILTER (WHERE cwr.status = 'declined') AS decline_count
    FROM public.campaign_winner_responses cwr
    JOIN public.campaign_draws cd ON cd.id = cwr.draw_id
    WHERE cwr.responded_at::date = v_fact_date
    GROUP BY cd.campaign_id
  ) resp_agg ON resp_agg.campaign_id = cs.campaign_id
  WHERE cs.snapshot_date = v_fact_date
    AND EXISTS (SELECT 1 FROM research_mart.dim_campaign dc WHERE dc.campaign_id = cs.campaign_id);

  -- ============================================================================
  -- 3. fact_penalty_effect_daily 갱신
  -- 핵심 연구 질문: §5.1.3 패널티 정책 효과
  -- ============================================================================
  DELETE FROM research_mart.fact_penalty_effect_daily
  WHERE fact_date = v_fact_date;

  INSERT INTO research_mart.fact_penalty_effect_daily (
    fact_date,
    campaign_id,
    penalty_type,
    newly_penalized_users,
    active_penalty_users,
    no_show_rate
  )
  SELECT
    v_fact_date,
    ups.campaign_id,
    ups.penalty_type,
    -- 당일 신규 패널티
    COUNT(DISTINCT ups.research_user_key)                         AS newly_penalized_users,
    -- 현재 활성 패널티 (만료 미도래)
    COUNT(DISTINCT ups2.research_user_key)                        AS active_penalty_users,
    -- 노쇼율: no_show / 전체 신규 패널티
    CASE WHEN COUNT(*) > 0
      THEN ROUND(
        COUNT(*) FILTER (WHERE ups.penalty_type = 'no_show')::numeric / COUNT(*) * 100, 2)
      ELSE NULL
    END                                                           AS no_show_rate
  FROM research_raw.user_penalty_snapshot_daily ups
  LEFT JOIN research_raw.user_penalty_snapshot_daily ups2
    ON ups2.research_user_key = ups.research_user_key
    AND ups2.snapshot_date = v_fact_date
    AND ups2.expires_at > now()
  WHERE ups.snapshot_date = v_fact_date
  GROUP BY ups.campaign_id, ups.penalty_type;

  -- ============================================================================
  -- 4. fact_attendance_daily 갱신
  -- ============================================================================
  DELETE FROM research_mart.fact_attendance_daily
  WHERE fact_date = v_fact_date;

  INSERT INTO research_mart.fact_attendance_daily (
    fact_date,
    campaign_id,
    winner_count,
    attendance_count,
    no_show_count,
    attendance_rate,
    no_show_rate
  )
  SELECT
    v_fact_date,
    f.campaign_id,
    f.winner_count,
    -- 수락 = 출석으로 간주 (ticket_entries 기반 verified_attendance 없으면 acceptance 사용)
    COALESCE(f.acceptance_count, 0)                                        AS attendance_count,
    COALESCE(f.winner_count, 0) - COALESCE(f.acceptance_count, 0)         AS no_show_count,
    CASE WHEN COALESCE(f.winner_count, 0) > 0
      THEN ROUND(COALESCE(f.acceptance_count, 0)::numeric / f.winner_count * 100, 2)
      ELSE NULL
    END                                                                    AS attendance_rate,
    CASE WHEN COALESCE(f.winner_count, 0) > 0
      THEN ROUND(
        (COALESCE(f.winner_count, 0) - COALESCE(f.acceptance_count, 0))::numeric
        / f.winner_count * 100, 2)
      ELSE NULL
    END                                                                    AS no_show_rate
  FROM research_mart.fact_campaign_funnel_daily f
  WHERE f.fact_date = v_fact_date
    AND f.winner_count IS NOT NULL;

  -- ============================================================================
  -- 5. 파이프라인 메타 갱신
  -- ============================================================================
  UPDATE research_raw._pipeline_meta
  SET last_run_at = now()
  WHERE schema_name = 'research_mart';

  RAISE NOTICE '[mart_batch] 완료: fact_date=%', v_fact_date;

END $$;
