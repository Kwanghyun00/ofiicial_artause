-- ============================================================================
-- RLS Enabled No Policy Fix — 2026-04-04
-- Addresses 8 "RLS Enabled No Policy" suggestions in Supabase Security Advisor.
--
-- 배경:
--   20251028_ticket_campaign_ops.sql에서 아래 7개 테이블에
--   "No user-facing policies; default deny. Service role bypasses automatically."
--   주석과 함께 RLS만 활성화하고 정책을 미생성했음.
--   ticket_campaigns는 20260217_security_hotfix.sql에서 RLS 활성화 후
--   GRANT만 적용하고 명시적 정책 미생성.
--
-- 조치:
--   - 모든 테이블에 service_role 전용 ALL 정책 추가 (의도 명시)
--   - ticket_campaigns 직접 접근은 service_role 전용 유지
--     (공개 조회는 public_ticket_campaigns VIEW를 통해서만)
-- ============================================================================

-- ============================================================================
-- 1. campaign_ad_watch_verifications
--    광고 시청 검증 데이터 — 앱 서버(service_role)만 접근
-- ============================================================================
DROP POLICY IF EXISTS "campaign_ad_watch_verifications_service_all"
  ON public.campaign_ad_watch_verifications;

CREATE POLICY "campaign_ad_watch_verifications_service_all"
  ON public.campaign_ad_watch_verifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. campaign_blacklist
--    블랙리스트 — 관리자/서버(service_role)만 접근
-- ============================================================================
DROP POLICY IF EXISTS "campaign_blacklist_service_all"
  ON public.campaign_blacklist;

CREATE POLICY "campaign_blacklist_service_all"
  ON public.campaign_blacklist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 3. campaign_draws
--    추첨 실행 기록 — 관리자/서버(service_role)만 접근
-- ============================================================================
DROP POLICY IF EXISTS "campaign_draws_service_all"
  ON public.campaign_draws;

CREATE POLICY "campaign_draws_service_all"
  ON public.campaign_draws
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 4. campaign_entries
--    응모 원장 — 앱 서버(service_role)만 접근
--    (공개 응모는 ticket_entries 테이블을 사용)
-- ============================================================================
DROP POLICY IF EXISTS "campaign_entries_service_all"
  ON public.campaign_entries;

CREATE POLICY "campaign_entries_service_all"
  ON public.campaign_entries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. campaign_participants
--    참가자 레지스트리 — 앱 서버(service_role)만 접근
--    (PII 해시 포함, 직접 노출 불가)
-- ============================================================================
DROP POLICY IF EXISTS "campaign_participants_service_all"
  ON public.campaign_participants;

CREATE POLICY "campaign_participants_service_all"
  ON public.campaign_participants
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. campaign_waitlist_promotions
--    대기자 승격 원장 — 관리자/서버(service_role)만 접근
-- ============================================================================
DROP POLICY IF EXISTS "campaign_waitlist_promotions_service_all"
  ON public.campaign_waitlist_promotions;

CREATE POLICY "campaign_waitlist_promotions_service_all"
  ON public.campaign_waitlist_promotions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 7. campaign_winner_responses
--    당첨자 응답 추적 — 관리자/서버(service_role)만 접근
-- ============================================================================
DROP POLICY IF EXISTS "campaign_winner_responses_service_all"
  ON public.campaign_winner_responses;

CREATE POLICY "campaign_winner_responses_service_all"
  ON public.campaign_winner_responses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 8. ticket_campaigns
--    캠페인 원본 테이블 — 직접 접근은 service_role 전용
--    공개 조회는 public_ticket_campaigns VIEW(SECURITY INVOKER)를 통해서만
-- ============================================================================
DROP POLICY IF EXISTS "ticket_campaigns_service_all"
  ON public.ticket_campaigns;

CREATE POLICY "ticket_campaigns_service_all"
  ON public.ticket_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 9. Audit log
-- ============================================================================

INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'rls_no_policy_fix_applied',
  'schema_governance',
  jsonb_build_object(
    'applied_at', now(),
    'tables', ARRAY[
      'campaign_ad_watch_verifications',
      'campaign_blacklist',
      'campaign_draws',
      'campaign_entries',
      'campaign_participants',
      'campaign_waitlist_promotions',
      'campaign_winner_responses',
      'ticket_campaigns'
    ],
    'policy', 'service_role ALL (anon/authenticated 접근 차단 유지)'
  )
);
