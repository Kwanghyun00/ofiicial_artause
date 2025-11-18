-- 뷰 정의
create or replace view analytics.view_show_detail as
select
  user_id,
  campaign_id,
  dwell_sec,
  scroll_pct,
  occurred_at
from event_logs
where event = 'show_detail_view';

create or replace view analytics.view_adgate as
select
  user_id,
  campaign_id,
  event,
  reason,
  occurred_at
from event_logs
where event in ('adgate_open', 'adgate_verify_success', 'adgate_verify_fail');

create or replace view analytics.view_entry as
select
  user_id,
  campaign_id,
  event,
  status_code,
  occurred_at
from event_logs
where event like 'entry_%';

-- KPI 쿼리
-- 상세 → 응모 전환율
select
  campaign_id,
  count(distinct case when event = 'entry_success' then user_id end)::float
    / nullif(count(distinct case when event = 'show_detail_view' then user_id end), 0)
    as detail_to_entry_rate
from event_logs
where occurred_at >= date_trunc('day', now()) - interval '7 days'
group by campaign_id;

-- AdGate → 응모 전환율
select
  campaign_id,
  count(distinct case when event = 'entry_success' then user_id end)::float
    / nullif(count(distinct case when event = 'adgate_verify_success' then user_id end), 0)
    as adgate_to_entry_rate
from event_logs
where occurred_at >= date_trunc('day', now()) - interval '7 days'
group by campaign_id;

-- 응모 완료율 (attempt 대비 success)
select
  campaign_id,
  count(case when event = 'entry_success' then 1 end)::float
    / nullif(count(case when event = 'entry_attempt' then 1 end), 0)
    as entry_completion_rate
from event_logs
where occurred_at >= date_trunc('day', now()) - interval '7 days'
group by campaign_id;

-- 알림 도달율
select
  campaign_id,
  count(case when event = 'notify_sent' then 1 end)::float
    / nullif(count(case when event = 'notify_queued' then 1 end), 0)
    as notification_delivery_rate
from event_logs
where occurred_at >= date_trunc('day', now()) - interval '7 days'
group by campaign_id;
