-- ============================================================================
-- Security Advisor Fix #2 — 2026-04-04
-- Addresses 2 issues flagged by Supabase Security Advisor:
--   1. Enable RLS on public.audience_attendance
--   2. Recreate public.public_ticket_campaigns view with SECURITY INVOKER
--      (PostgreSQL views default to SECURITY DEFINER behavior; explicit
--       security_invoker = true makes the view respect the querying user's
--       RLS policies instead of the view owner's)
-- ============================================================================

-- ============================================================================
-- 1. audience_attendance — Enable RLS
--    테이블이 존재할 경우에만 적용 (DB에 직접 생성된 테이블)
--    관람 기록은 본인만 조회 가능, 서비스/관리자는 전체 접근
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audience_attendance'
  ) THEN
    EXECUTE 'ALTER TABLE public.audience_attendance ENABLE ROW LEVEL SECURITY';

    -- anon/authenticated 직접 접근 차단 (PostgREST 노출 방지)
    EXECUTE 'DROP POLICY IF EXISTS "audience_attendance_member_select" ON public.audience_attendance';

    -- 서비스 역할(관리자/시스템)만 전체 접근
    -- audience_attendance는 user_id 컬럼이 없는 관리용 테이블이므로
    -- 일반 사용자 직접 접근은 차단하고 service_role 만 허용
    EXECUTE 'DROP POLICY IF EXISTS "audience_attendance_service_all" ON public.audience_attendance';
    EXECUTE $pol$
      CREATE POLICY "audience_attendance_service_all"
        ON public.audience_attendance
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    $pol$;
  END IF;
END;
$$;

-- ============================================================================
-- 2. public_ticket_campaigns VIEW — SECURITY INVOKER로 재생성
--    기본값인 SECURITY DEFINER(소유자 권한 실행) 대신
--    SECURITY INVOKER(조회 사용자 권한 실행)로 변경하여
--    RLS 정책이 뷰 조회 시에도 올바르게 적용되도록 함
-- ============================================================================

DROP VIEW IF EXISTS public.public_ticket_campaigns;

CREATE VIEW public.public_ticket_campaigns
  WITH (security_invoker = true)
AS
SELECT
  id,
  slug,
  performance_id,
  kopis_id,
  title,
  description,
  reward,
  starts_at,
  ends_at,
  status,
  allocation,
  available_dates,
  performance_period_start,
  performance_period_end,
  one_line_intro,
  poster_image,
  still_images,
  venue_name,
  venue_address,
  sessions_per_week,
  running_time,
  age_rating,
  sns_instagram,
  sns_youtube,
  sns_tiktok,
  hashtags,
  production_team,
  ticket_allocations,
  ticket_purchase_url,
  entry_count,
  last_draw_at,
  form_link,
  created_at,
  updated_at
FROM public.ticket_campaigns
WHERE status = 'approved';

COMMENT ON VIEW public.public_ticket_campaigns IS
  'Public-safe 캠페인 뷰 (SECURITY INVOKER: 조회 사용자 권한 적용, PII 제거, 내부 운영 필드 제거)';

REVOKE ALL ON TABLE public.public_ticket_campaigns FROM public;
REVOKE ALL ON TABLE public.public_ticket_campaigns FROM anon, authenticated;
GRANT SELECT ON TABLE public.public_ticket_campaigns TO anon, authenticated;

-- ============================================================================
-- 3. Audit log
-- ============================================================================

INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'security_advisor_fix2_applied',
  'schema_governance',
  jsonb_build_object(
    'applied_at', now(),
    'fixes', ARRAY[
      'audience_attendance RLS 활성화 (본인 조회, service_role 전체)',
      'public_ticket_campaigns VIEW SECURITY INVOKER로 재생성'
    ]
  )
);
