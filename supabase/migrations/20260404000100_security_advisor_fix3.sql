-- ============================================================================
-- Security Advisor Fix #3 — 2026-04-04
-- Addresses 11 warnings flagged by Supabase Security Advisor:
--   1-3. Function Search Path Mutable:
--         get_research_config, trigger_recalculate_trust_score,
--         trigger_set_timestamps
--   4-9. RLS Policy Always True (WITH CHECK (true) on INSERT):
--         feedback, performance_submissions, promotion_requests (×2),
--         review_events, ticket_entries (×2)
--  10.  Leaked Password Protection: Auth 설정 (마이그레이션 외 조치 필요)
-- ============================================================================

-- ============================================================================
-- 1. trigger_set_timestamps — SET search_path 추가
--    timestamps 자동 세팅 트리거 함수
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_set_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at = COALESCE(NEW.created_at, NOW());
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_set_timestamps IS
  'created_at/updated_at 자동 설정 트리거 함수 (search_path 고정)';

-- ============================================================================
-- 2. trigger_recalculate_trust_score — SET search_path 추가
--    패널티 추가/삭제 시 신뢰도 점수 자동 재계산
-- ============================================================================

CREATE OR REPLACE FUNCTION public.trigger_recalculate_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  PERFORM public.recalculate_trust_score(NEW.user_id);
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_recalculate_trust_score IS
  '패널티 INSERT/DELETE 시 신뢰도 점수 자동 재계산 (search_path 고정)';

-- ============================================================================
-- 3. get_research_config — SET search_path 추가
--    연구 파이프라인 설정값 조회 (SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_research_config(p_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT value FROM public.research_config WHERE key = p_key;
$$;

REVOKE ALL ON FUNCTION public.get_research_config(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_research_config(text) TO research_admin;

COMMENT ON FUNCTION public.get_research_config IS
  '연구 파이프라인 비밀값 조회. research_admin 전용. (SECURITY DEFINER, search_path 고정)';

-- ============================================================================
-- 4. feedback — INSERT 정책 개선
--    to public → to anon, authenticated 분리
--    WITH CHECK (true) → 구조적 필수값 검증 추가
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;

CREATE POLICY "feedback_anon_insert"
  ON public.feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    type IN ('bug', 'feature', 'improvement', 'question', 'other')
    AND title IS NOT NULL
    AND description IS NOT NULL
  );

-- ============================================================================
-- 5. performance_submissions — INSERT 정책 개선
--    service_role 정책은 기존 유지, anon/authenticated INSERT 정책 개선
-- ============================================================================

DROP POLICY IF EXISTS "performance_submissions_insert" ON public.performance_submissions;

CREATE POLICY "performance_submissions_insert"
  ON public.performance_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    contact_name IS NOT NULL
    AND contact_email IS NOT NULL
  );

-- ============================================================================
-- 6. promotion_requests — INSERT 정책 개선
--    anon/authenticated 각각 → 하나로 합치고 필수값 검증 추가
-- ============================================================================

DROP POLICY IF EXISTS "promotion_requests_insert_anon"        ON public.promotion_requests;
DROP POLICY IF EXISTS "promotion_requests_insert_authenticated" ON public.promotion_requests;

CREATE POLICY "promotion_requests_insert"
  ON public.promotion_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    contact_name IS NOT NULL
    AND contact_email IS NOT NULL
  );

-- ============================================================================
-- 7. review_events — INSERT 정책 개선
--    to public → to anon, authenticated 분리
--    WITH CHECK (true) → event_type 필수 검증 추가
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can insert review events" ON public.review_events;

CREATE POLICY "review_events_insert"
  ON public.review_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_type IN ('view', 'expand', 'helpful', 'report')
    AND user_identifier IS NOT NULL
  );

-- ============================================================================
-- 8. ticket_entries — INSERT 정책 개선
--    anon/authenticated 각각 → 하나로 합치고 필수값 검증 추가
-- ============================================================================

DROP POLICY IF EXISTS "ticket_entries_insert_anon"          ON public.ticket_entries;
DROP POLICY IF EXISTS "ticket_entries_insert_authenticated" ON public.ticket_entries;

CREATE POLICY "ticket_entries_insert"
  ON public.ticket_entries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    campaign_id IS NOT NULL
    AND applicant_email IS NOT NULL
  );

-- ============================================================================
-- 9. Audit log
-- ============================================================================

INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'security_advisor_fix3_applied',
  'schema_governance',
  jsonb_build_object(
    'applied_at', now(),
    'fixes', ARRAY[
      'trigger_set_timestamps SET search_path 추가',
      'trigger_recalculate_trust_score SET search_path 추가',
      'get_research_config SET search_path 추가',
      'feedback INSERT 정책: to public → anon/authenticated + 필수값 검증',
      'performance_submissions INSERT 정책: 필수값 검증 추가',
      'promotion_requests INSERT 정책: 통합 + 필수값 검증',
      'review_events INSERT 정책: to public → anon/authenticated + event_type 검증',
      'ticket_entries INSERT 정책: 통합 + 필수값 검증',
      '(별도 조치) Auth > Leaked Password Protection 활성화 필요'
    ]
  )
);

-- ============================================================================
-- NOTE: Leaked Password Protection (Auth 설정)
-- Supabase 대시보드 > Authentication > Providers > Email 에서
-- "Enable Leaked Password Protection" 활성화 필요.
-- 이 설정은 SQL 마이그레이션으로 변경 불가.
-- ============================================================================
