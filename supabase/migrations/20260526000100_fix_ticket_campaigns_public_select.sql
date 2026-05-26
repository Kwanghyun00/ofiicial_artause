-- ============================================================================
-- ticket_campaigns anon/authenticated SELECT 정책 추가
-- 문제: public_ticket_campaigns VIEW가 SECURITY INVOKER이므로
--       anon 사용자가 VIEW를 통해 조회할 때 ticket_campaigns 테이블의 RLS를 통과해야 함.
--       기존 정책이 service_role 전용이라 anon 조회가 permission denied 발생.
-- 해결: status='approved' 행만 anon/authenticated에게 SELECT 허용
-- ============================================================================

-- 이미 존재할 경우 대비해 DROP 후 재생성
DROP POLICY IF EXISTS "ticket_campaigns_public_select"
  ON public.ticket_campaigns;

CREATE POLICY "ticket_campaigns_public_select"
  ON public.ticket_campaigns
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- Audit
INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'rls_policy_added',
  'ticket_campaigns',
  jsonb_build_object(
    'applied_at', now(),
    'policy', 'ticket_campaigns_public_select',
    'reason', 'public_ticket_campaigns VIEW(SECURITY INVOKER) anon 조회 fix'
  )
);
