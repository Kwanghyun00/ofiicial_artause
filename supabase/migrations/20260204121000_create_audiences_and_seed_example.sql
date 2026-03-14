-- Create audiences table (single SNS account per audience)
create table if not exists public.audiences (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  sns_platform text,
  sns_handle text,
  sns_url text,
  memo text,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audiences_phone_idx on public.audiences (phone);
create index if not exists audiences_sns_handle_idx on public.audiences (sns_handle);

drop trigger if exists trg_audiences_updated_at on public.audiences;
create trigger trg_audiences_updated_at
  before update on public.audiences
  for each row
  execute function public.trigger_set_timestamps();

alter table if exists public.audiences enable row level security;

-- Seed a single example performance + ticket campaign
with perf as (
  insert into public.performances (
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
    is_featured
  )
  values (
    'example-performance',
    '예시 공연',
    'ongoing',
    '연극',
    '서울',
    '알터즈',
    current_date,
    current_date + interval '30 days',
    '예시 극장',
    '예시 공연 소개입니다.',
    true
  )
  on conflict (slug) do update set title = excluded.title
  returning id
)
insert into public.ticket_campaigns (
  performance_id,
  title,
  description,
  reward,
  starts_at,
  ends_at,
  form_link,
  one_line_intro,
  venue_name,
  performance_period_start,
  performance_period_end
)
select
  perf.id,
  '예시 공연',
  '예시 공연 초대권 이벤트입니다.',
  '초대권 1인 2매',
  now(),
  now() + interval '10 days',
  null,
  '예시 초대권',
  '예시 극장',
  current_date,
  current_date + interval '30 days'
from perf
where not exists (
  select 1
  from public.ticket_campaigns tc
  where tc.performance_id = perf.id
    and tc.title = '예시 공연'
);
