-- public_ticket_campaigns VIEW에 kopis_id 컬럼 추가
-- 20260313000100_add_kopis_id.sql에서 ticket_campaigns.kopis_id 컬럼이 추가됐지만
-- VIEW는 명시적 컬럼 목록으로 정의되어 있어 자동 반영되지 않아 별도 재정의 필요.
-- CREATE OR REPLACE VIEW는 컬럼 순서 변경을 허용하지 않으므로 DROP 후 재생성.

drop view if exists public.public_ticket_campaigns;

create view public.public_ticket_campaigns as
select
  id,
  slug,
  performance_id,
  kopis_id,
  title,
  description,
  reward,
  starts_at,
  ends_at,
  form_link,
  created_at,
  updated_at,
  status,
  allocation,
  algorithm_version,
  config,
  snapshot_seed,
  last_draw_at,
  ticket_purchase_url,
  approved_at,
  approved_by,
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
  ticket_allocations
from public.ticket_campaigns
where status = 'approved';

comment on view public.public_ticket_campaigns is 'Public-safe ticket campaigns (PII removed, approved only). Includes kopis_id for KOPIS data linking.';

-- 권한 재부여 (DROP 시 기존 GRANT 소멸)
revoke all on table public.public_ticket_campaigns from public;
revoke all on table public.public_ticket_campaigns from anon, authenticated;
grant select on table public.public_ticket_campaigns to anon, authenticated;
