-- ============================================================================
-- 세 여자 이야기 공연 + 캠페인 생성 (없으면 INSERT, 있으면 UPDATE)
-- 클로이 캠페인 available_dates 설정
-- ============================================================================

-- 1. performances 레코드 (ticket_campaigns.performance_id FK 충족용)
INSERT INTO public.performances (
  id,
  slug,
  title,
  status,
  category,
  region,
  organization,
  period_start,
  period_end,
  venue,
  synopsis,
  is_featured,
  created_at,
  updated_at
)
SELECT
  '10000000-0000-0000-0000-000000000005'::uuid,
  'three-women-stories',
  '세 여자 이야기',
  'completed',
  '연극',
  '서울',
  '극단 고래',
  '2026-02-01',
  '2026-03-01',
  '아르코예술극장 대극장',
  '세 명의 여성이 서로 다른 삶을 통해 연대하는 이야기.',
  false,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.performances WHERE id = '10000000-0000-0000-0000-000000000005'::uuid
);

-- 2. 세 여자 이야기 캠페인 INSERT (없으면)
INSERT INTO public.ticket_campaigns (
  id,
  slug,
  performance_id,
  title,
  description,
  one_line_intro,
  status,
  starts_at,
  ends_at,
  venue_name,
  venue_address,
  performance_period_start,
  performance_period_end,
  reward,
  allocation,
  entry_count,
  age_rating,
  running_time,
  hashtags,
  kopis_id,
  algorithm_version,
  config,
  available_dates,
  created_at,
  updated_at
)
SELECT
  '20000000-0000-0000-0000-000000000005'::uuid,
  'three-women-invitation',
  '10000000-0000-0000-0000-000000000005'::uuid,
  '연극 세 여자 이야기 초대권',
  '한국 여성 작가의 섬세한 시선으로 풀어낸 세 여성의 삶. 웃음과 눈물을 넘나드는 감동적인 무대입니다.',
  '세 여자, 무대 위의 이야기',
  'approved',
  '2026-01-15T00:00:00+09:00',
  '2026-03-01T23:59:59+09:00',
  '아르코예술극장 대극장',
  '서울 종로구 대학로 41',
  '2026-02-01',
  '2026-03-01',
  '2인 초대권',
  '{"total": 20}'::jsonb,
  0,
  '14세 이상',
  110,
  '["연극", "여성서사", "초대권", "아르코"]'::jsonb,
  NULL,
  '1.0',
  '{}'::jsonb,
  ARRAY['2026-03-01', '2026-03-07', '2026-03-10']::text[],
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.ticket_campaigns WHERE slug = 'three-women-invitation'
);

-- 이미 존재하는 경우 주요 정보 업데이트
UPDATE public.ticket_campaigns SET
  title          = '연극 세 여자 이야기 초대권',
  description    = '한국 여성 작가의 섬세한 시선으로 풀어낸 세 여성의 삶. 웃음과 눈물을 넘나드는 감동적인 무대입니다.',
  one_line_intro = '세 여자, 무대 위의 이야기',
  status         = 'approved',
  ends_at        = '2026-03-01T23:59:59+09:00',
  venue_name     = '아르코예술극장 대극장',
  venue_address  = '서울 종로구 대학로 41',
  performance_period_start = '2026-02-01',
  performance_period_end   = '2026-03-01',
  reward         = '2인 초대권',
  age_rating     = '14세 이상',
  running_time   = 110,
  hashtags       = '["연극", "여성서사", "초대권", "아르코"]'::jsonb,
  updated_at     = NOW()
WHERE slug = 'three-women-invitation';

-- 3. 클로이 캠페인 available_dates 설정
UPDATE public.ticket_campaigns
SET
  available_dates = ARRAY[
    '2026-03-15',
    '2026-03-18',
    '2026-03-19',
    '2026-03-20',
    '2026-03-21'
  ]::text[],
  updated_at = NOW()
WHERE slug = 'cloe-invite-2026';
