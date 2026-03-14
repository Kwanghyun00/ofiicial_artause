-- ============================================================================
-- Research 설정 저장소
-- 목적: PII_SALT 등 연구 파이프라인 비밀값을 DB 내부에 안전하게 보관
-- 생성일: 2026-03-06
-- ============================================================================
-- 보안:
--   - RLS deny-all: anon/authenticated는 접근 불가
--   - service_role은 RLS를 bypass하여 값 삽입/조회 가능
--   - 배치 SQL은 service_role 권한으로 실행 (Supabase Edge Function)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.research_config (
  key        text PRIMARY KEY,
  value      text NOT NULL,
  note       text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.research_config IS
  '[도메인:정책] [상태:활성] 연구 파이프라인 비밀값 저장소. service_role 전용.';

-- RLS 활성화 + deny-all (service_role은 bypass)
ALTER TABLE public.research_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "research_config_deny_all"
  ON public.research_config
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- 배치 SQL에서 사용하는 헬퍼 함수 (SECURITY DEFINER = 함수 소유자 권한으로 실행)
CREATE OR REPLACE FUNCTION public.get_research_config(p_key text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT value FROM public.research_config WHERE key = p_key;
$$;

-- 함수 실행 권한: research_admin만 (배치 파이프라인용)
REVOKE ALL ON FUNCTION public.get_research_config(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_research_config(text) TO research_admin;
