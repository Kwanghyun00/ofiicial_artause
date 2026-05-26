-- show_sessions: 개별 공연 회차 정보 테이블
-- Phase 1 추가 — performances 테이블과 1:N 관계
-- 향후 ticket_campaigns와 연결하여 회차별 초대 이벤트 지원

CREATE TABLE IF NOT EXISTS public.show_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performance_id uuid NOT NULL
    REFERENCES public.performances(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  start_time  time,
  venue_name  text,
  capacity    int4,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 인덱스: 공연별 회차 목록 조회
CREATE INDEX IF NOT EXISTS show_sessions_performance_id_idx
  ON public.show_sessions (performance_id);

-- 인덱스: 날짜별 회차 조회
CREATE INDEX IF NOT EXISTS show_sessions_session_date_idx
  ON public.show_sessions (session_date);

-- RLS 활성화
ALTER TABLE public.show_sessions ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용 (공연 정보는 공개)
CREATE POLICY "show_sessions_public_read"
  ON public.show_sessions
  FOR SELECT
  USING (true);

-- 관리자만 쓰기 가능
CREATE POLICY "show_sessions_admin_write"
  ON public.show_sessions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

COMMENT ON TABLE public.show_sessions IS
  '공연 회차 정보. performances와 1:N 관계. 향후 ticket_campaigns의 session_ids로 회차별 초대 이벤트 연결.';
