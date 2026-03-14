-- ============================================================================
-- Campaign Cleanup — 2026-03-13
-- 초대권 이벤트를 2개만 남기고 나머지는 비공개 처리:
--   1. 연극 세 여자 이야기 (three-women-invitation) — 마감 처리 (ends_at 과거)
--   2. 연극 클로이 (cloe-invite-2026) — 모집 중 (ends_at 2026-03-21)
-- ============================================================================

-- 1. 위 2개 제외한 모든 approved 캠페인 비공개 처리
UPDATE public.ticket_campaigns
SET status = 'draft',
    updated_at = NOW()
WHERE slug NOT IN ('three-women-invitation', 'cloe-invite-2026')
  AND status = 'approved';

-- 2. 세 여자 이야기 마감 처리 (ends_at을 과거로 설정)
UPDATE public.ticket_campaigns
SET ends_at = '2026-03-01T14:59:59+00:00',
    status  = 'approved',
    updated_at = NOW()
WHERE slug = 'three-women-invitation';

-- 3. 클로이 모집 중 상태 확인 (이미 approved이면 유지)
UPDATE public.ticket_campaigns
SET status = 'approved',
    updated_at = NOW()
WHERE slug = 'cloe-invite-2026'
  AND status != 'approved';
