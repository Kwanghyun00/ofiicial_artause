-- 공연 초대권 AdGate 스키마

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  kakao_user_id text not null unique,
  role text not null check (role in ('member', 'partner', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.shows (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.users(id),
  slug text not null unique,
  title text not null,
  summary text,
  intro_html text,
  category text,
  region text,
  hero_image text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.show_performances (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  starts_at timestamptz not null,
  venue text,
  seat_capacity integer,
  created_at timestamptz not null default now()
);

create table if not exists public.event_campaigns (
  id uuid primary key default gen_random_uuid(),
  show_id uuid not null references public.shows(id) on delete cascade,
  seats integer not null,
  apply_start timestamptz not null,
  apply_end timestamptz not null,
  draw_at timestamptz not null,
  status text not null check (status in ('draft','published','closed')) default 'draft',
  adgate_rules jsonb not null,
  weight_rules jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_campaigns(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  ad_verified boolean not null default false,
  intro_seen boolean not null default false,
  weight numeric not null default 1,
  weight_json jsonb,
  created_at timestamptz not null default now(),
  unique (campaign_id, user_id)
);

create table if not exists public.adgate_verifications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_campaigns(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  dwell_sec integer not null,
  verified boolean not null,
  ttl_exp timestamptz not null,
  utm jsonb,
  created_at timestamptz not null default now()
);

create index on public.adgate_verifications (campaign_id, user_id, ttl_exp);

create table if not exists public.lottery_runs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.event_campaigns(id) on delete cascade,
  seed_hash text not null,
  winners_json jsonb not null,
  wait_json jsonb not null,
  executed_at timestamptz not null default now(),
  executed_by uuid not null references public.users(id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  campaign_id uuid references public.event_campaigns(id),
  state text not null check (state in ('queued','sending','sent','failed')),
  deliver_at timestamptz not null,
  template text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  actor_id uuid references public.users(id),
  action text not null,
  target text,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.entries enable row level security;
alter table public.notifications enable row level security;
alter table public.shows enable row level security;
alter table public.event_campaigns enable row level security;
alter table public.lottery_runs enable row level security;

-- RBAC / RLS 정책
-- members
drop policy if exists entries_member_select on public.entries;
create policy entries_member_select on public.entries
  for select using (user_id = auth.uid());

drop policy if exists entries_member_insert on public.entries;
create policy entries_member_insert on public.entries
  for insert with check (user_id = auth.uid());

drop policy if exists notifications_member_select on public.notifications;
create policy notifications_member_select on public.notifications
  for select using (user_id = auth.uid());

-- partners
drop policy if exists shows_partner_select on public.shows;
create policy shows_partner_select on public.shows
  for select using (
    (
      partner_id = auth.uid()
      and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
    )
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

drop policy if exists shows_partner_update on public.shows;
create policy shows_partner_update on public.shows
  for update using (
    partner_id = auth.uid()
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
  ) with check (partner_id = auth.uid());

drop policy if exists campaigns_partner_select on public.event_campaigns;
create policy campaigns_partner_select on public.event_campaigns
  for select using (
    (
      exists (
        select 1 from public.shows s
        where s.id = show_id and s.partner_id = auth.uid()
      )
      and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
    )
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

drop policy if exists campaigns_partner_update on public.event_campaigns;
create policy campaigns_partner_update on public.event_campaigns
  for update using (
    exists (
      select 1 from public.shows s
      where s.id = show_id and s.partner_id = auth.uid()
    )
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
  ) with check (
    exists (
      select 1 from public.shows s
      where s.id = show_id and s.partner_id = auth.uid()
    )
    and exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'partner')
  );

-- admins (grant via supabase roles)
grant all on public.users, public.shows, public.show_performances,
  public.event_campaigns, public.entries, public.adgate_verifications,
  public.lottery_runs, public.notifications, public.audit_logs
  to service_role;

-- admin-only lottery run visibility
drop policy if exists lottery_admin_select on public.lottery_runs;
create policy lottery_admin_select on public.lottery_runs
  for select using (
    exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

-- waitlist promotion helper
create or replace function public.next_waitlist_promotions(now timestamptz)
returns table (
  campaign_id uuid,
  user_id uuid,
  title text
)
security definer
set search_path = public
language sql
as $$
  select ec.id as campaign_id, e.user_id, s.title
  from event_campaigns ec
  join shows s on s.id = ec.show_id
  join entries e on e.campaign_id = ec.id
  where ec.status = 'published'
    and ec.draw_at < now
    and e.ad_verified = true
    and e.intro_seen = true
    and e.weight > 0
$$;
