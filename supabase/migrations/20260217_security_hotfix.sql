-- 2026-02-17 Security hotfix
-- Scope: RLS enablement, privilege hardening, public-safe campaign view,
--        duplicate entry prevention, status constraint normalization.

begin;

-- ---------------------------------------------------------------------------
-- 1) Enable RLS on critical tables
-- ---------------------------------------------------------------------------
alter table if exists public.ticket_entries enable row level security;
alter table if exists public.ticket_campaigns enable row level security;
alter table if exists public.promotion_requests enable row level security;
alter table if exists public.users enable row level security;
alter table if exists public.adgate_verifications enable row level security;

-- ---------------------------------------------------------------------------
-- 2) Public reads must go through sanitized view only
-- ---------------------------------------------------------------------------
create or replace view public.public_ticket_campaigns as
select
  id,
  slug,
  performance_id,
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

comment on view public.public_ticket_campaigns is 'Public-safe ticket campaigns (PII removed, approved only).';

revoke all on table public.ticket_campaigns from public;
revoke all on table public.ticket_campaigns from anon, authenticated;
grant all on table public.ticket_campaigns to service_role;

revoke all on table public.public_ticket_campaigns from public;
revoke all on table public.public_ticket_campaigns from anon, authenticated;
grant select on table public.public_ticket_campaigns to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3) ticket_entries: insert-only for anon/authenticated
-- ---------------------------------------------------------------------------
revoke all on table public.ticket_entries from public;
revoke all on table public.ticket_entries from anon, authenticated;
grant insert on table public.ticket_entries to anon, authenticated;
grant all on table public.ticket_entries to service_role;

drop policy if exists ticket_entries_insert_anon on public.ticket_entries;
create policy ticket_entries_insert_anon
  on public.ticket_entries
  for insert
  to anon
  with check (true);

drop policy if exists ticket_entries_insert_authenticated on public.ticket_entries;
create policy ticket_entries_insert_authenticated
  on public.ticket_entries
  for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- 4) promotion_requests: insert-only for anon/authenticated
-- ---------------------------------------------------------------------------
revoke all on table public.promotion_requests from public;
revoke all on table public.promotion_requests from anon, authenticated;
grant insert on table public.promotion_requests to anon, authenticated;
grant all on table public.promotion_requests to service_role;

drop policy if exists promotion_requests_insert_anon on public.promotion_requests;
create policy promotion_requests_insert_anon
  on public.promotion_requests
  for insert
  to anon
  with check (true);

drop policy if exists promotion_requests_insert_authenticated on public.promotion_requests;
create policy promotion_requests_insert_authenticated
  on public.promotion_requests
  for insert
  to authenticated
  with check (true);

-- ---------------------------------------------------------------------------
-- 5) users: self row select/update only, admin read via JWT claim
-- ---------------------------------------------------------------------------
revoke all on table public.users from public;
revoke all on table public.users from anon, authenticated;
grant select on table public.users to authenticated;
grant update (kakao_user_id, email) on table public.users to authenticated;
grant all on table public.users to service_role;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
  on public.users
  for select
  to authenticated
  using (
    id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
  on public.users
  for update
  to authenticated
  using (
    id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  )
  with check (
    id = auth.uid()
    or coalesce(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Role escalation guard: authenticated cannot update users.role because UPDATE
-- is only granted on (kakao_user_id, email).

-- ---------------------------------------------------------------------------
-- 6) adgate_verifications: server-only access (no anon/auth access)
-- ---------------------------------------------------------------------------
revoke all on table public.adgate_verifications from public;
revoke all on table public.adgate_verifications from anon, authenticated;
grant all on table public.adgate_verifications to service_role;

-- No anon/authenticated policies: default deny with RLS.

-- ---------------------------------------------------------------------------
-- 7) Function/view privilege hardening
-- ---------------------------------------------------------------------------
revoke all on function public.next_waitlist_promotions(timestamptz) from public;
revoke all on function public.next_waitlist_promotions(timestamptz) from anon, authenticated;
grant execute on function public.next_waitlist_promotions(timestamptz) to service_role;

revoke all on table public.active_penalties from public;
revoke all on table public.active_penalties from anon, authenticated;
grant select on table public.active_penalties to service_role;

-- ---------------------------------------------------------------------------
-- 8) Duplicate prevention for ticket_entries
-- ---------------------------------------------------------------------------
with ranked as (
  select
    id,
    row_number() over (
      partition by campaign_id, applicant_email
      order by submitted_at asc nulls last, id asc
    ) as rn
  from public.ticket_entries
)
delete from public.ticket_entries t
using ranked r
where t.id = r.id
  and r.rn > 1;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'ticket_entries'
      and c.contype = 'u'
      and pg_get_constraintdef(c.oid) ilike 'UNIQUE (campaign_id, applicant_email)%'
  ) then
    alter table public.ticket_entries
      add constraint ticket_entries_campaign_id_applicant_email_key
      unique (campaign_id, applicant_email);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 9) Resolve ticket_campaigns.status CHECK conflict
-- ---------------------------------------------------------------------------
update public.ticket_campaigns
set status = case
  when status in ('pending', 'pending approval', 'pending-approval', 'pending_approval') then 'pending_approval'
  when status in ('approved', 'accept', 'accepted') then 'approved'
  when status in ('schedule', 'scheduled') then 'scheduled'
  when status in ('open', 'active', 'live') then 'active'
  when status in ('closed', 'ended', 'finished') then 'closed'
  when status in ('reject', 'rejected') then 'rejected'
  when status in ('draft', 'temp') then 'draft'
  else 'draft'
end
where status is null
   or status not in ('draft', 'pending_approval', 'approved', 'scheduled', 'active', 'closed', 'rejected');

do $$
declare
  r record;
begin
  if to_regclass('public.ticket_campaigns') is null then
    return;
  end if;

  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'ticket_campaigns'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
  loop
    execute format(
      'alter table public.ticket_campaigns drop constraint if exists %I',
      r.conname
    );
  end loop;
end $$;

alter table public.ticket_campaigns
  add constraint ticket_campaigns_status_check
  check (status in ('draft','pending_approval','approved','scheduled','active','closed','rejected'));

commit;
