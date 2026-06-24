-- 공연 시작일 컬럼 추가
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS performance_start_date date;

-- 공연 반응 테이블
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  reaction_type text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_reactions_reaction_type_check
    CHECK (reaction_type IN ('감동', '즐거움', '긴장', '여운')),
  UNIQUE(post_slug, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_slug ON public.post_reactions (post_slug);

-- RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "누구나 반응 조회 가능" ON public.post_reactions
  FOR SELECT USING (true);

CREATE POLICY "누구나 반응 추가 가능" ON public.post_reactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "누구나 반응 업데이트 가능" ON public.post_reactions
  FOR UPDATE USING (true);

-- 원자적 반응 증가 RPC
CREATE OR REPLACE FUNCTION increment_post_reaction(
  p_post_slug text,
  p_reaction_type text
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.post_reactions (post_slug, reaction_type, count)
  VALUES (p_post_slug, p_reaction_type, 1)
  ON CONFLICT (post_slug, reaction_type)
  DO UPDATE SET count = post_reactions.count + 1, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION increment_post_reaction TO anon, authenticated;
