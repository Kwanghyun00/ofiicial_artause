-- community_posts에 포스터 및 이미지 배열 컬럼 추가
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS poster_url text,
  ADD COLUMN IF NOT EXISTS images jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.community_posts.poster_url IS '공연 포스터 이미지 URL';
COMMENT ON COLUMN public.community_posts.images IS
  '[{"url": "https://...", "alt": "설명", "type": "card_news|rehearsal|profile|other"}]';
