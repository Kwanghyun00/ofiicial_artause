-- ============================================================================
-- 체험단 플랫폼: 알림 큐 + 파트너 과금 모델
-- ============================================================================

-- ============================================================================
-- 1. notifications 테이블 (notify-worker가 소비하는 이메일 큐)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  template     text        NOT NULL,
  -- 체험단 템플릿 목록:
  --   entry_received     : 지원 접수 확인 (지원자)
  --   entry_selected     : 선정 통보 + 확정 링크 (지원자)
  --   entry_confirmed    : 참석 확정 + QR 발송 (지원자)
  --   entry_declined     : 불참 처리 (지원자)
  --   review_reminder    : 리뷰 제출 D-3 리마인더 (지원자)
  --   review_received    : 리뷰 제출 감사 (지원자)
  --   report_verified    : 포트폴리오 등재 완료 (지원자)
  --   partner_entry_new  : 신규 지원자 알림 (파트너)
  --   partner_slot_low   : 크레딧 부족 경고 (파트너)
  --   winner             : 기존 당첨 알림 (하위호환)
  --   waitlist_promoted  : 기존 대기자 승급 (하위호환)
  payload      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  state        text        NOT NULL DEFAULT 'queued'
    CHECK (state IN ('queued','sent','failed','cancelled')),
  deliver_at   timestamptz NOT NULL DEFAULT now(),
  attempts     integer     NOT NULL DEFAULT 0,
  error_msg    text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_state_deliver
  ON public.notifications(state, deliver_at)
  WHERE state = 'queued';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
-- 서비스 롤만 접근 (서버 사이드 전용)
CREATE POLICY "notifications_service_only"
  ON public.notifications
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 2. partner_credits 테이블 (파트너 크레딧 잔액)
-- ============================================================================
-- 과금 구조:
--   - 체험단 모집 공고 등록: 무료
--   - 체험단 1인 선발 확정 시: 크레딧 차감 (기본 1,500크레딧 = 1,500원)
--   - SNS 파워 티어에 따라 차감량 상이 (일반 1x, 파워 1.5x, 인플루언서 2x)

CREATE TABLE IF NOT EXISTS public.partner_credits (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_email   text        NOT NULL UNIQUE,
  balance         integer     NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_charged   integer     NOT NULL DEFAULT 0,   -- 누적 충전 크레딧
  total_used      integer     NOT NULL DEFAULT 0,   -- 누적 사용 크레딧
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_credits_service_only"
  ON public.partner_credits
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 3. credit_transactions 테이블 (크레딧 충전/차감 내역)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_email   text        NOT NULL,
  type            text        NOT NULL
    CHECK (type IN ('charge','deduct','refund','bonus')),
  amount          integer     NOT NULL,             -- 양수: 충전/환불, 음수: 차감
  balance_after   integer     NOT NULL,
  description     text,
  -- 차감인 경우 연결된 entry
  entry_id        uuid        REFERENCES public.ticket_entries(id) ON DELETE SET NULL,
  campaign_id     uuid        REFERENCES public.ticket_campaigns(id) ON DELETE SET NULL,
  -- 충전인 경우 결제 참조
  payment_ref     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_partner
  ON public.credit_transactions(partner_email, created_at DESC);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_transactions_service_only"
  ON public.credit_transactions
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 4. ticket_campaigns 과금 필드 추가
-- ============================================================================

ALTER TABLE public.ticket_campaigns
  ADD COLUMN IF NOT EXISTS cost_per_slot    integer NOT NULL DEFAULT 1500,
  -- 기본 1,500크레딧 (1크레딧 = 1원)
  -- SNS 파워 티어별 자동 배수:
  --   일반(500명 미만)    : cost_per_slot * 1.0
  --   파워(500-5000명)    : cost_per_slot * 1.5
  --   마이크로(5000-5만명): cost_per_slot * 2.0
  --   인플루언서(5만명+)  : cost_per_slot * 3.0

  ADD COLUMN IF NOT EXISTS billing_enabled  boolean NOT NULL DEFAULT true,
  -- false = 관리자 승인 프로모션 캠페인 (무료)

  ADD COLUMN IF NOT EXISTS total_slots_billed integer NOT NULL DEFAULT 0;
  -- 실제 크레딧 차감이 발생한 선발 인원 수

-- ============================================================================
-- 5. ticket_entries SNS 파워 스코어 + 확정 필드 추가
-- ============================================================================

ALTER TABLE public.ticket_entries
  -- SNS 파워 스코어 (지원 시 자동 계산)
  ADD COLUMN IF NOT EXISTS sns_power_score   integer NOT NULL DEFAULT 0,
  -- 공식: instagram_followers*0.6 + blog_visitors*0.3 + youtube_subs*0.5 (정규화)
  ADD COLUMN IF NOT EXISTS sns_tier          text NOT NULL DEFAULT 'general'
    CHECK (sns_tier IN ('general','power','micro','influencer')),
  -- general(500미만), power(500-5000), micro(5000-50000), influencer(50000+)
  ADD COLUMN IF NOT EXISTS slot_cost         integer,
  -- 이 지원자 선발 시 실제 차감될 크레딧 (sns_tier 기반 계산)

  -- 선정 확정 흐름
  ADD COLUMN IF NOT EXISTS confirm_token     text UNIQUE,
  ADD COLUMN IF NOT EXISTS confirm_token_exp timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_at      timestamptz,
  ADD COLUMN IF NOT EXISTS confirmed_date    date,
  ADD COLUMN IF NOT EXISTS confirmed_time    text,
  ADD COLUMN IF NOT EXISTS qr_token          text UNIQUE DEFAULT gen_random_uuid()::text,
  ADD COLUMN IF NOT EXISTS declined_at       timestamptz;

CREATE INDEX IF NOT EXISTS idx_ticket_entries_sns_tier
  ON public.ticket_entries(sns_tier);
CREATE INDEX IF NOT EXISTS idx_ticket_entries_sns_power_score
  ON public.ticket_entries(sns_power_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_ticket_entries_qr_token
  ON public.ticket_entries(qr_token);

-- ============================================================================
-- 6. SNS 파워 스코어 자동 계산 함수 + 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_sns_power_score()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  instagram_score integer;
  blog_score      integer;
  youtube_score   integer;
  total_score     integer;
  tier            text;
  campaign_cost   integer;
  tier_multiplier numeric;
BEGIN
  -- 각 플랫폼 기여도 (팔로워/방문자 → 점수 정규화)
  instagram_score := COALESCE(NEW.sns_instagram_followers, 0) / 10;
  blog_score      := COALESCE(NEW.sns_blog_monthly_visitors, 0) / 30;
  youtube_score   := COALESCE(NEW.sns_youtube_subscribers, 0) / 8;

  -- 인스타그램 60%, 블로그 25%, 유튜브 15% 가중치
  total_score := (instagram_score * 60 + blog_score * 25 + youtube_score * 15) / 100;

  -- 티어 결정 (인스타그램 팔로워 기준)
  IF COALESCE(NEW.sns_instagram_followers, 0) >= 50000 THEN
    tier := 'influencer';
    tier_multiplier := 3.0;
  ELSIF COALESCE(NEW.sns_instagram_followers, 0) >= 5000 THEN
    tier := 'micro';
    tier_multiplier := 2.0;
  ELSIF COALESCE(NEW.sns_instagram_followers, 0) >= 500 THEN
    tier := 'power';
    tier_multiplier := 1.5;
  ELSE
    tier := 'general';
    tier_multiplier := 1.0;
  END IF;

  -- 캠페인 기준 슬롯 비용 가져오기
  SELECT COALESCE(cost_per_slot, 1500)
  INTO campaign_cost
  FROM public.ticket_campaigns
  WHERE id = NEW.campaign_id;

  NEW.sns_power_score := total_score;
  NEW.sns_tier        := tier;
  NEW.slot_cost       := ROUND(campaign_cost * tier_multiplier);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ticket_entries_sns_score
  BEFORE INSERT OR UPDATE OF
    sns_instagram_followers, sns_blog_monthly_visitors, sns_youtube_subscribers
  ON public.ticket_entries
  FOR EACH ROW EXECUTE FUNCTION public.calculate_sns_power_score();

-- ============================================================================
-- 7. 선정 확정 시 크레딧 차감 함수 + 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION public.deduct_credit_on_selection()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_partner_email  text;
  v_slot_cost      integer;
  v_billing_enabled boolean;
  v_current_balance integer;
BEGIN
  -- selection_status가 'selected'로 변경될 때만 실행
  IF NEW.selection_status = 'selected' AND
     (OLD.selection_status IS DISTINCT FROM 'selected') THEN

    -- 파트너 이메일 조회
    SELECT partner_email, billing_enabled
    INTO v_partner_email, v_billing_enabled
    FROM public.ticket_campaigns
    WHERE id = NEW.campaign_id;

    -- 과금 비활성화 캠페인은 스킵
    IF NOT COALESCE(v_billing_enabled, true) THEN
      RETURN NEW;
    END IF;

    v_slot_cost := COALESCE(NEW.slot_cost, 1500);

    -- 크레딧 잔액 확인 및 차감 (원자적 업데이트)
    UPDATE public.partner_credits
    SET
      balance     = balance - v_slot_cost,
      total_used  = total_used + v_slot_cost,
      updated_at  = now()
    WHERE partner_email = v_partner_email
      AND balance >= v_slot_cost
    RETURNING balance INTO v_current_balance;

    IF NOT FOUND THEN
      -- 잔액 부족: 선정 차단 (선택적 — 현재는 경고만)
      -- 필요시 RAISE EXCEPTION '크레딧 잔액이 부족합니다' 로 변경
      RAISE WARNING '[credit] partner % has insufficient credits for entry %',
        v_partner_email, NEW.id;
      RETURN NEW;
    END IF;

    -- 차감 내역 기록
    INSERT INTO public.credit_transactions (
      partner_email, type, amount, balance_after,
      description, entry_id, campaign_id
    ) VALUES (
      v_partner_email, 'deduct', -v_slot_cost, v_current_balance,
      format('%s 체험단 선발 (티어: %s)', NEW.applicant_name, NEW.sns_tier),
      NEW.id, NEW.campaign_id
    );

    -- 캠페인 총 청구 슬롯 수 증가
    UPDATE public.ticket_campaigns
    SET total_slots_billed = total_slots_billed + 1
    WHERE id = NEW.campaign_id;

    -- 잔액 부족 경고 알림 (5,000크레딧 미만)
    IF v_current_balance < 5000 THEN
      INSERT INTO public.notifications (template, payload, deliver_at)
      VALUES (
        'partner_slot_low',
        jsonb_build_object(
          'email', v_partner_email,
          'balance', v_current_balance,
          'threshold', 5000
        ),
        now()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_deduct_credit_on_selection
  AFTER UPDATE OF selection_status ON public.ticket_entries
  FOR EACH ROW EXECUTE FUNCTION public.deduct_credit_on_selection();

-- ============================================================================
-- 8. selection_status 허용값 확장: 'declined' 추가
--    (선발됐으나 본인이 불참 선택한 케이스 — 'rejected'와 구분)
-- ============================================================================
DO $$
BEGIN
  -- 기존 CHECK 제약 삭제 후 재생성 (IF EXISTS 패턴)
  ALTER TABLE public.ticket_entries
    DROP CONSTRAINT IF EXISTS ticket_entries_selection_status_check;

  ALTER TABLE public.ticket_entries
    ADD CONSTRAINT ticket_entries_selection_status_check
    CHECK (selection_status IN ('pending','selected','rejected','declined'));
EXCEPTION WHEN others THEN
  NULL; -- 제약이 다른 이름으로 존재하면 무시 (DB push 재실행 안전)
END;
$$;
