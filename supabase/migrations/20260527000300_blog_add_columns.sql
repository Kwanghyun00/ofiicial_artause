-- community_posts에 블로그/에세이 시스템용 컬럼 추가
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS performance_id uuid REFERENCES public.performances(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

-- 기존에 published_at이 있는 글은 published 처리
UPDATE public.community_posts SET is_published = true WHERE published_at IS NOT NULL;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_community_posts_is_published ON public.community_posts (is_published);
CREATE INDEX IF NOT EXISTS idx_community_posts_performance_id ON public.community_posts (performance_id);
