-- ============================================================================
-- notifications 테이블 체험단 알림 시스템용 스키마 수정
-- 기존: user_id NOT NULL (AdGate 개인 알림용)
-- 변경: user_id nullable (시스템 자동 알림도 지원), attempts + error_msg 추가
-- ============================================================================

-- 1. user_id FK 제약 해제 후 nullable로 변경
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE public.notifications
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. 재처리 추적 컬럼 추가
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS attempts  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_msg text;

-- 3. 빠른 폴링을 위한 인덱스 (state='queued' + deliver_at)
CREATE INDEX IF NOT EXISTS idx_notifications_state_deliver
  ON public.notifications(state, deliver_at)
  WHERE state = 'queued';

-- 4. 기존 RLS 정책 정리 — service_role 전용으로 교체
DROP POLICY IF EXISTS notifications_member_select ON public.notifications;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'notifications'
      AND policyname = 'notifications_service_only'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY notifications_service_only
        ON public.notifications
        USING (auth.role() = 'service_role')
        WITH CHECK (auth.role() = 'service_role')
    $policy$;
  END IF;
END;
$$;
