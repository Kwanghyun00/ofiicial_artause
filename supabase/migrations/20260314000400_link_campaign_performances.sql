-- ============================================================================
-- 캠페인-공연 데이터 연결 정리
--
-- 문제:
--   1. ticket_campaigns.kopis_id는 있으나 연결된 performances.kopis_id가 null인 경우
--      → getPerformanceByKopisId가 해당 performances를 찾지 못함
--   2. 이전 KOPIS sync가 캠페인에 연결된 기존 performances를 업데이트하지 않고
--      source='kopis' 인 중복 레코드를 생성한 경우
--
-- 해결:
--   1. 캠페인에 연결된 performances에 kopis_id 역방향 설정
--   2. source='kopis'이고 어떤 캠페인에도 연결되지 않은 고아 레코드 삭제
-- ============================================================================

-- 1. 캠페인의 kopis_id를 linked performances에 설정
--    (ticket_campaigns.performance_id → performances.id 경로를 따라)
UPDATE public.performances p
SET
    kopis_id   = tc.kopis_id,
    source     = 'kopis',
    updated_at = NOW()
FROM public.ticket_campaigns tc
WHERE p.id = tc.performance_id
  AND tc.kopis_id IS NOT NULL
  AND (p.kopis_id IS NULL OR p.kopis_id != tc.kopis_id);

-- 2. 이전 broken sync가 생성한 고아 레코드 제거
--    조건: source='kopis' AND 어떤 ticket_campaign도 performance_id로 참조하지 않음
DELETE FROM public.performances p
WHERE p.source = 'kopis'
  AND NOT EXISTS (
    SELECT 1
    FROM public.ticket_campaigns c
    WHERE c.performance_id = p.id
  );
