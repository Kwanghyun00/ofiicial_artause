-- Enhanced Event Creation Fields
-- Adds new fields to ticket_campaigns for detailed event information

-- Add basic info fields
alter table public.ticket_campaigns
add column if not exists one_line_intro text check (char_length(one_line_intro) <= 20),
add column if not exists poster_image text,
add column if not exists still_images jsonb default '[]'::jsonb;

-- Add performance detail fields
alter table public.ticket_campaigns
add column if not exists venue_name text,
add column if not exists venue_address text,
add column if not exists performance_period_start date,
add column if not exists performance_period_end date,
add column if not exists sessions_per_week integer,
add column if not exists running_time integer, -- in minutes
add column if not exists age_rating text;

-- Add SNS and marketing fields
alter table public.ticket_campaigns
add column if not exists sns_instagram text,
add column if not exists sns_youtube text,
add column if not exists sns_tiktok text,
add column if not exists hashtags jsonb default '[]'::jsonb;

-- Add production team field (array of {role, name, contact})
alter table public.ticket_campaigns
add column if not exists production_team jsonb default '[]'::jsonb;

-- Add ticket allocation field (array of {date, time, quantity})
alter table public.ticket_campaigns
add column if not exists ticket_allocations jsonb default '[]'::jsonb;

-- Add partner contact info
alter table public.ticket_campaigns
add column if not exists partner_email text,
add column if not exists partner_phone text;

-- Add comments for documentation
comment on column public.ticket_campaigns.one_line_intro is '한 줄 소개 (최대 20자)';
comment on column public.ticket_campaigns.poster_image is '포스터 이미지 Storage 경로';
comment on column public.ticket_campaigns.still_images is '스틸컷 이미지 Storage 경로 배열';
comment on column public.ticket_campaigns.venue_name is '공연장 이름';
comment on column public.ticket_campaigns.venue_address is '공연장 주소';
comment on column public.ticket_campaigns.performance_period_start is '공연 시작일';
comment on column public.ticket_campaigns.performance_period_end is '공연 종료일';
comment on column public.ticket_campaigns.sessions_per_week is '주당 회차';
comment on column public.ticket_campaigns.running_time is '공연 러닝타임 (분)';
comment on column public.ticket_campaigns.age_rating is '관람 연령';
comment on column public.ticket_campaigns.sns_instagram is '인스타그램 계정';
comment on column public.ticket_campaigns.sns_youtube is '유튜브 계정';
comment on column public.ticket_campaigns.sns_tiktok is '틱톡 계정';
comment on column public.ticket_campaigns.hashtags is '해시태그 배열';
comment on column public.ticket_campaigns.production_team is '제작진 정보 [{role, name, contact}]';
comment on column public.ticket_campaigns.ticket_allocations is '티켓 배분 정보 [{date, time, quantity}]';
comment on column public.ticket_campaigns.partner_email is '담당자 이메일';
comment on column public.ticket_campaigns.partner_phone is '담당자 연락처';
