-- SNS 에디터 픽 테이블
CREATE TABLE IF NOT EXISTS public.sns_picks (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  performance_id uuid NOT NULL REFERENCES public.performances(id) ON DELETE CASCADE,
  caption        text,                   -- SNS용 한줄 소개 (관리자 직접 작성)
  channel        text NOT NULL DEFAULT 'instagram'
                   CHECK (channel IN ('instagram', 'youtube', 'tiktok', 'all')),
  display_order  integer NOT NULL DEFAULT 0,
  promo_start    timestamptz,
  promo_end      timestamptz,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sns_picks_is_active ON public.sns_picks (is_active);
CREATE INDEX IF NOT EXISTS idx_sns_picks_display_order ON public.sns_picks (display_order);

-- RLS 활성화
ALTER TABLE public.sns_picks ENABLE ROW LEVEL SECURITY;

-- 퍼블릭 읽기 (활성 픽)
CREATE POLICY "sns_picks_public_read" ON public.sns_picks
  FOR SELECT TO public
  USING (
    is_active = true
    AND (promo_end IS NULL OR promo_end > now())
  );

-- 서비스 롤 전체 권한
CREATE POLICY "sns_picks_service_all" ON public.sns_picks
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
