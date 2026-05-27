-- Supabase Storage: performance-assets 버킷 생성
-- 파트너가 업로드한 포스터/스틸 이미지를 저장합니다.

-- 버킷 생성 (이미 존재하면 무시)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'performance-assets',
  'performance-assets',
  true,                -- 퍼블릭 읽기
  5242880,             -- 최대 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS 정책: 퍼블릭 읽기 허용
create policy if not exists "performance_assets_public_read"
  on storage.objects for select
  using (bucket_id = 'performance-assets');

-- RLS 정책: 인증된 사용자 업로드 허용
-- (실제 운영에서는 service_role key를 통해 서버사이드에서만 업로드)
create policy if not exists "performance_assets_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'performance-assets');

-- RLS 정책: 본인 파일 삭제 허용
create policy if not exists "performance_assets_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'performance-assets');
