-- bookmarks: 사용자가 북마크한 공연 목록
-- auth.users 의 id 를 참조하므로 Supabase Auth 필요

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  performance_id UUID       NOT NULL REFERENCES public.performances(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, performance_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- 본인 북마크만 접근 가능
CREATE POLICY "bookmarks: own rows only"
  ON public.bookmarks
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx         ON public.bookmarks (user_id);
CREATE INDEX IF NOT EXISTS bookmarks_performance_id_idx  ON public.bookmarks (performance_id);
