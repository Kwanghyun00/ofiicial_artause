-- ============================================================================
-- Security Advisor Fix — 2026-03-13
-- Addresses 8 issues flagged by Supabase Security Advisor:
--   1-6. Enable RLS on tables missing it (performances, organizations,
--         community_posts, organization_followers, performance_submissions,
--         audit_logs)
--   7-8. Add SET search_path to SECURITY DEFINER functions
--         (recalculate_trust_score, increment_review_helpful)
-- ============================================================================

-- ============================================================================
-- 1. performances — public read (published/scheduled/ongoing), admin full
-- ============================================================================

ALTER TABLE public.performances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performances_public_select" ON public.performances;
CREATE POLICY "performances_public_select"
  ON public.performances
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('scheduled', 'ongoing', 'completed'));

DROP POLICY IF EXISTS "performances_admin_all" ON public.performances;
CREATE POLICY "performances_admin_all"
  ON public.performances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 2. organizations — public read, admin full
-- ============================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organizations_public_select" ON public.organizations;
CREATE POLICY "organizations_public_select"
  ON public.organizations
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "organizations_admin_all" ON public.organizations;
CREATE POLICY "organizations_admin_all"
  ON public.organizations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 3. community_posts — only published posts are public, admin full
-- ============================================================================

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_public_select" ON public.community_posts;
CREATE POLICY "community_posts_public_select"
  ON public.community_posts
  FOR SELECT
  TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= NOW());

DROP POLICY IF EXISTS "community_posts_admin_all" ON public.community_posts;
CREATE POLICY "community_posts_admin_all"
  ON public.community_posts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 4. organization_followers — anyone can follow (INSERT), no public read of
--    other users' follows, admin full
-- ============================================================================

ALTER TABLE public.organization_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "organization_followers_insert" ON public.organization_followers;
CREATE POLICY "organization_followers_insert"
  ON public.organization_followers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "organization_followers_admin_all" ON public.organization_followers;
CREATE POLICY "organization_followers_admin_all"
  ON public.organization_followers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. performance_submissions — anyone can submit (INSERT), no public read
--    (contains PII: contact_name, contact_email, contact_phone), admin full
-- ============================================================================

ALTER TABLE public.performance_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_submissions_insert" ON public.performance_submissions;
CREATE POLICY "performance_submissions_insert"
  ON public.performance_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "performance_submissions_admin_all" ON public.performance_submissions;
CREATE POLICY "performance_submissions_admin_all"
  ON public.performance_submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. audit_logs — no public access, service_role only
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    EXECUTE 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "audit_logs_admin_all" ON public.audit_logs';
    EXECUTE '
      CREATE POLICY "audit_logs_admin_all"
        ON public.audit_logs
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    ';
  END IF;
END;
$$;

-- ============================================================================
-- 7. Fix SECURITY DEFINER function: recalculate_trust_score
--    Add SET search_path = public to prevent search_path injection
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalculate_trust_score(target_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_penalty_points INT;
  new_trust_score INT;
BEGIN
  SELECT COALESCE(SUM(points), 0)
  INTO total_penalty_points
  FROM public.user_penalties
  WHERE user_id = target_user_id
    AND expires_at > NOW();

  new_trust_score := GREATEST(0, 100 - total_penalty_points);

  UPDATE public.users
  SET
    trust_score = new_trust_score,
    is_restricted = (new_trust_score < 60),
    restriction_reason = CASE
      WHEN new_trust_score < 60 THEN '신뢰도 점수 부족'
      ELSE NULL
    END
  WHERE id = target_user_id;

  RETURN new_trust_score;
END;
$$;

COMMENT ON FUNCTION public.recalculate_trust_score IS '사용자의 신뢰도 점수를 재계산하고 제한 여부를 업데이트';

-- ============================================================================
-- 8. Fix SECURITY DEFINER function: increment_review_helpful
--    Add SET search_path = public to prevent search_path injection
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_review_helpful(review_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id AND status = 'published';
$$;

COMMENT ON FUNCTION public.increment_review_helpful IS '후기 도움돼요 카운트 원자적 증가 (search_path 고정)';
