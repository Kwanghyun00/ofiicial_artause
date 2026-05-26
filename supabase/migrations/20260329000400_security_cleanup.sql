-- ============================================================================
-- Security Cleanup & Legacy Table Drop — 2026-03-29
-- 목적:
--   1. sync_entry_count SECURITY DEFINER에 SET search_path 누락 수정
--   2. legacy 테이블 최종 DROP (예정일 2026-04-06 조기 실행)
--   3. 미사용 테이블 DROP (audiences, organization_followers, adgate_verifications)
--   4. notifications RLS 정책 명시
--   5. public_ticket_campaigns VIEW에서 내부 운영 필드 제거
--   6. reviews 테이블 별점 범위 CHECK 제약 추가
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. SECURITY FIX: sync_entry_count — SET search_path 누락
--    search_path 미설정 SECURITY DEFINER 함수는 SQL injection 위험
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_entry_count()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ticket_campaigns
    SET entry_count = entry_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ticket_campaigns
    SET entry_count = GREATEST(entry_count - 1, 0)
    WHERE id = OLD.campaign_id;
  END IF;
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.sync_entry_count IS
  'ticket_entries INSERT/DELETE 시 entry_count 자동 갱신 (search_path 고정)';

-- ============================================================================
-- 2. FK 제약 정리 — legacy 테이블 DROP 전처리
-- ============================================================================

-- 2-1. user_penalties: entries, event_campaigns 참조 FK 제거 → ticket_campaigns으로 재연결
ALTER TABLE public.user_penalties
  DROP CONSTRAINT IF EXISTS user_penalties_entry_id_fkey,
  DROP CONSTRAINT IF EXISTS user_penalties_campaign_id_fkey;

ALTER TABLE public.user_penalties
  ADD CONSTRAINT user_penalties_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES public.ticket_campaigns(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

-- 2-2. notifications: event_campaigns 참조 FK 제거
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_campaign_id_fkey;

-- campaign_id 컬럼은 유지하되, FK 없는 일반 uuid로 남겨둠
COMMENT ON COLUMN public.notifications.campaign_id IS
  '캠페인 참조 (legacy FK 제거됨. 현재는 ticket_campaigns.id를 저장)';

-- 2-3. adgate_verifications: 모든 FK 제거 (DROP 전처리)
ALTER TABLE public.adgate_verifications
  DROP CONSTRAINT IF EXISTS adgate_verifications_campaign_id_fkey,
  DROP CONSTRAINT IF EXISTS adgate_verifications_user_id_fkey,
  DROP CONSTRAINT IF EXISTS adgate_verifications_show_id_fkey;

-- ============================================================================
-- 3. Legacy 테이블 DROP
--    (2026-03-06 읽기 차단 후 모니터링 완료, 2주 경과)
-- ============================================================================

DROP TABLE IF EXISTS public.lottery_runs       CASCADE;
DROP TABLE IF EXISTS public.entries            CASCADE;
DROP TABLE IF EXISTS public.event_campaigns    CASCADE;
DROP TABLE IF EXISTS public.show_performances  CASCADE;
DROP TABLE IF EXISTS public.shows              CASCADE;

-- ============================================================================
-- 4. 미사용 테이블 DROP
-- ============================================================================

-- audiences: 2026-02-04 생성 후 앱 코드에서 미사용
DROP TABLE IF EXISTS public.audiences CASCADE;

-- organization_followers: 0002_community_follow.sql 생성, 미사용
DROP TABLE IF EXISTS public.organization_followers CASCADE;

-- adgate_verifications: campaign_ad_watch_verifications로 대체됨
DROP TABLE IF EXISTS public.adgate_verifications CASCADE;

-- ============================================================================
-- 5. notifications 테이블 RLS 정책 명시
--    (RLS는 활성화되어 있으나 명시적 정책 없어 혼란)
-- ============================================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 본인 알림만 조회 가능
DROP POLICY IF EXISTS "notifications_member_select" ON public.notifications;
CREATE POLICY "notifications_member_select"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 시스템/관리자만 생성·수정 가능 (앱 서버는 service_role 사용)
DROP POLICY IF EXISTS "notifications_service_all" ON public.notifications;
CREATE POLICY "notifications_service_all"
  ON public.notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. public_ticket_campaigns VIEW — 내부 운영 필드 제거
--    제거 대상: config (알고리즘 설정), algorithm_version, snapshot_seed (추첨 보안),
--              approved_by (내부 관리자 정보)
-- ============================================================================

DROP VIEW IF EXISTS public.public_ticket_campaigns;

CREATE VIEW public.public_ticket_campaigns AS
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
  'Public-safe 캠페인 뷰 (PII 제거, 내부 운영 필드 제거: config/algorithm_version/snapshot_seed/approved_by)';

REVOKE ALL ON TABLE public.public_ticket_campaigns FROM public;
REVOKE ALL ON TABLE public.public_ticket_campaigns FROM anon, authenticated;
GRANT SELECT ON TABLE public.public_ticket_campaigns TO anon, authenticated;

-- ============================================================================
-- 7. reviews — DB 레벨 별점 범위 제약
--    앱 레벨 검증의 이중 보호막
-- ============================================================================

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_overall_range;

ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_overall_range
    CHECK (rating_overall BETWEEN 1 AND 5);

-- 세부 별점도 범위 제약
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_acting_range;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_acting_range
    CHECK (rating_acting IS NULL OR rating_acting BETWEEN 1 AND 5);

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_direction_range;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_direction_range
    CHECK (rating_direction IS NULL OR rating_direction BETWEEN 1 AND 5);

ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_rating_immersion_range;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_rating_immersion_range
    CHECK (rating_immersion IS NULL OR rating_immersion BETWEEN 1 AND 5);

-- ============================================================================
-- 8. performances — 유저 제출 공연 INSERT 허용 정책
--    (findOrCreatePerformanceAction에서 service_role 클라이언트 사용 전제)
--    source='user' 공연은 서버 액션(server action)에서만 생성 가능하도록
--    anon/authenticated INSERT는 열지 않음 — service_role 만 허용 유지
-- ============================================================================

-- 기존 performances_admin_all 정책이 service_role 전체 허용 중이므로 추가 불필요.
-- 확인 차원에서 명시:
-- performances_public_select: anon/authenticated SELECT (status IN published 등)
-- performances_admin_all: service_role ALL ← findOrCreatePerformanceAction이 이 경로 사용

-- ============================================================================
-- 9. Audit log
-- ============================================================================

INSERT INTO public.audit_logs (actor_type, action, target, payload)
VALUES (
  'system',
  'security_cleanup_applied',
  'schema_governance',
  jsonb_build_object(
    'applied_at', now(),
    'fixes', ARRAY[
      'sync_entry_count SET search_path 추가',
      'legacy tables DROP: shows, show_performances, event_campaigns, entries, lottery_runs',
      'unused tables DROP: audiences, organization_followers, adgate_verifications',
      'notifications RLS 정책 명시',
      'public_ticket_campaigns VIEW 내부 필드 제거 (config/algorithm_version/snapshot_seed/approved_by)',
      'reviews 별점 범위 CHECK 제약 추가'
    ]
  )
);

COMMIT;
