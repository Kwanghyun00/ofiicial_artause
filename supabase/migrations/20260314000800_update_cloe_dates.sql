-- 클로이 캠페인 공연 날짜 업데이트 (3월 26~28일)
UPDATE public.ticket_campaigns
SET
  available_dates = ARRAY[
    '2026-03-26 20:00',
    '2026-03-27 20:00',
    '2026-03-28 14:00',
    '2026-03-28 17:00'
  ]::text[],
  updated_at = NOW()
WHERE slug = 'cloe-invite-2026';
