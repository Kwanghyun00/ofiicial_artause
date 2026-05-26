alter table public.performances
  add column if not exists state text,
  add column if not exists openrun text,
  add column if not exists detail_images jsonb default '[]'::jsonb,
  add column if not exists kopis_facility_id text,
  add column if not exists kopis_sections jsonb default '{}'::jsonb;

comment on column public.performances.state is 'KOPIS 공연 상태 원문 또는 코드';
comment on column public.performances.openrun is 'KOPIS 오픈런 여부 (Y/N)';
comment on column public.performances.detail_images is 'KOPIS 공연상세 이미지 배열';
comment on column public.performances.kopis_facility_id is 'KOPIS 공연시설 ID (mt10id)';
comment on column public.performances.kopis_sections is 'KOPIS DB 검색 메뉴 단위 스냅샷 (공연목록/공연상세/시설/제작사/수상작/축제/원창작자)';
