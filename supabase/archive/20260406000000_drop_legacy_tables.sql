-- ============================================================================
-- 레거시 테이블 최종 DROP (PRD §4.5 5단계)
-- 목적: AdGate v1 구 스키마 테이블 완전 제거
-- 실행 예정: 2026-04-06 (2주 모니터링 후)
-- 전제 조건:
--   1. 20260306000200_legacy_rls_block.sql 적용 완료
--   2. 2주 모니터링 이상 이상 없음 확인
--   3. user_penalties.entry_id FK NULL 처리 완료 (하단 스텝 포함)
-- ============================================================================
-- 실행 방법:
--   mv supabase/archive/20260406000000_drop_legacy_tables.sql \
--      supabase/migrations/20260406000000_drop_legacy_tables.sql
-- 그 후 Supabase 마이그레이션 적용
-- ============================================================================

BEGIN;

-- 1. user_penalties의 레거시 FK 컬럼 NULL 처리 및 제약 제거
--    (entries, event_campaigns 참조 → NULL 허용 컬럼이므로 데이터 손실 없음)
ALTER TABLE public.user_penalties
  DROP CONSTRAINT IF EXISTS user_penalties_entry_id_fkey,
  DROP CONSTRAINT IF EXISTS user_penalties_campaign_id_fkey;

-- entry_id/campaign_id는 NULL 허용이므로 컬럼 자체는 유지,
-- 단 레거시 테이블 참조 FK만 제거
-- 새 FK가 필요하면 campaign_entries, ticket_campaigns로 교체
ALTER TABLE public.user_penalties
  ADD CONSTRAINT user_penalties_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.ticket_campaigns(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

-- 2. adgate_verifications의 레거시 FK 제거
ALTER TABLE public.adgate_verifications
  DROP CONSTRAINT IF EXISTS adgate_verifications_campaign_id_fkey,
  DROP CONSTRAINT IF EXISTS adgate_verifications_user_id_fkey;

-- 3. notifications의 레거시 FK 제거
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_campaign_id_fkey;

-- 4. lottery_runs DROP (event_campaigns 참조 → 먼저 DROP)
DROP TABLE IF EXISTS public.lottery_runs CASCADE;

-- 5. entries DROP
DROP TABLE IF EXISTS public.entries CASCADE;

-- 6. event_campaigns DROP
DROP TABLE IF EXISTS public.event_campaigns CASCADE;

-- 7. show_performances DROP
DROP TABLE IF EXISTS public.show_performances CASCADE;

-- 8. shows DROP
DROP TABLE IF EXISTS public.shows CASCADE;

-- 9. adgate_verifications: event_campaigns 없으므로 이관 또는 DROP
--    campaign_ad_watch_verifications로 대체됨. 데이터가 있으면 이관 후 DROP.
-- DROP TABLE IF EXISTS public.adgate_verifications CASCADE;
-- (데이터 보존 여부 확인 후 별도 판단 필요 - 주석 처리)

-- 10. audit_logs에 기록
INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'legacy_tables_dropped',
  'schema_governance',
  jsonb_build_object(
    'tables_dropped', ARRAY[
      'lottery_runs', 'entries', 'event_campaigns',
      'show_performances', 'shows'
    ],
    'dropped_at', now(),
    'reason', 'PRD DB_RESEARCH_DATA_PLAN §4.5: 2주 모니터링 후 최종 정리'
  )
);

COMMIT;
