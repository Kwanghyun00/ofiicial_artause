-- ============================================================================
-- 레거시 테이블 읽기 경로 차단 (PRD §4.5 2단계)
-- 목적: AdGate v1 구 스키마 테이블을 앱 레벨에서 접근 불가로 전환
-- 생성일: 2026-03-06
-- 모니터링 기간: 2026-03-06 ~ 2026-03-20 (2주)
-- DROP 예정: 2026-04-06 (별도 마이그레이션)
-- ============================================================================
-- 대상 테이블:
--   - shows           (대체: performances + ticket_campaigns)
--   - show_performances (대체: ticket_campaigns.config)
--   - event_campaigns  (대체: ticket_campaigns)
--   - entries          (대체: campaign_entries)
--   - lottery_runs     (대체: campaign_draws)
-- ============================================================================
-- 주의: user_penalties가 entries(id), event_campaigns(id)를 FK 참조함.
--   → FK 제약은 유지하되, 앱 레벨 접근은 차단
--   → user_penalties 자체는 활성 테이블이므로 차단하지 않음
-- ============================================================================

-- RLS 활성화 (이미 활성화된 경우 무해)
ALTER TABLE IF EXISTS public.shows             ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.show_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_campaigns   ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.entries           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lottery_runs      ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거 후 deny-all 정책 적용

-- shows
DROP POLICY IF EXISTS "legacy_shows_deny_all" ON public.shows;
CREATE POLICY "legacy_shows_deny_all"
  ON public.shows
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.shows IS
  '[도메인:레거시] [상태:읽기차단] 2026-03-06 RLS로 앱 접근 차단. DROP 예정 2026-04-06.';

-- show_performances
DROP POLICY IF EXISTS "legacy_show_performances_deny_all" ON public.show_performances;
CREATE POLICY "legacy_show_performances_deny_all"
  ON public.show_performances
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.show_performances IS
  '[도메인:레거시] [상태:읽기차단] 2026-03-06 RLS로 앱 접근 차단. DROP 예정 2026-04-06.';

-- event_campaigns
DROP POLICY IF EXISTS "legacy_event_campaigns_deny_all" ON public.event_campaigns;
CREATE POLICY "legacy_event_campaigns_deny_all"
  ON public.event_campaigns
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.event_campaigns IS
  '[도메인:레거시] [상태:읽기차단] 2026-03-06 RLS로 앱 접근 차단. user_penalties FK 의존성 존재. DROP 예정 2026-04-06.';

-- entries
DROP POLICY IF EXISTS "legacy_entries_deny_all" ON public.entries;
CREATE POLICY "legacy_entries_deny_all"
  ON public.entries
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.entries IS
  '[도메인:레거시] [상태:읽기차단] 2026-03-06 RLS로 앱 접근 차단. user_penalties FK 의존성 존재. DROP 예정 2026-04-06.';

-- lottery_runs
DROP POLICY IF EXISTS "legacy_lottery_runs_deny_all" ON public.lottery_runs;
CREATE POLICY "legacy_lottery_runs_deny_all"
  ON public.lottery_runs
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

COMMENT ON TABLE public.lottery_runs IS
  '[도메인:레거시] [상태:읽기차단] 2026-03-06 RLS로 앱 접근 차단. DROP 예정 2026-04-06.';

-- ============================================================================
-- audit_logs에 레거시 차단 이벤트 기록
-- ============================================================================
INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'legacy_rls_block_applied',
  'schema_governance',
  jsonb_build_object(
    'tables', ARRAY['shows', 'show_performances', 'event_campaigns', 'entries', 'lottery_runs'],
    'applied_at', now(),
    'monitoring_until', '2026-03-20',
    'drop_planned_at', '2026-04-06',
    'note', 'PRD DB_RESEARCH_DATA_PLAN §4.5 2단계. user_penalties FK 의존성으로 DROP 전 entries/event_campaigns 컬럼 NULL 처리 필요.'
  )
);
