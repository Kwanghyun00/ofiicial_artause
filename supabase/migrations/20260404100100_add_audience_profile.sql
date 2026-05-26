-- ============================================================
-- user_preferences 에 관객 프로필 컬럼 추가
-- ============================================================

alter table public.user_preferences
  add column if not exists audience_type     text
    check (audience_type in ('arts_expert', 'culture_fan', 'general', 'newcomer')),
  add column if not exists visit_frequency   text
    check (visit_frequency in ('frequent', 'regular', 'occasional', 'first_time')),
  add column if not exists discovery_channel text
    check (discovery_channel in ('sns', 'artist_fan', 'search', 'word_of_mouth')),
  add column if not exists profile_done      boolean not null default false;

comment on column public.user_preferences.audience_type is
  'Q6: 공연과 나의 관계 (예술전공/문화애호가/일반관객/입문자)';
comment on column public.user_preferences.visit_frequency is
  'Q7: 공연 관람 빈도 (월1회+/분기1회/연1~3회/거의처음)';
comment on column public.user_preferences.discovery_channel is
  'Q8: 공연 정보 탐색 경로 (SNS/아티스트팬/직접검색/지인추천)';
comment on column public.user_preferences.profile_done is
  '프로필 3문항 완료 여부';
