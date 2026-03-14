-- ============================================================================
-- Rule Engine 마이그레이션
-- 목적: 노쇼 패널티, 신뢰도 점수, 응모 제한 시스템 구축
-- 생성일: 2025-11-17
-- ============================================================================

-- Ensure uuid-ossp extension exists
create extension if not exists "pgcrypto";

-- 0. users 테이블에 email 컬럼 추가 (없는 경우)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

COMMENT ON COLUMN users.email IS '사용자 이메일 주소 (선택, 고유)';

-- 1. user_penalties 테이블 생성
-- 사용자의 패널티 기록을 추적 (노쇼, 취소, 규칙 위반 등)
CREATE TABLE IF NOT EXISTS user_penalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES entries(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES event_campaigns(id) ON DELETE SET NULL,

  -- 패널티 유형
  penalty_type TEXT NOT NULL CHECK (penalty_type IN ('no_show', 'late_cancel', 'rule_violation')),

  -- 패널티 점수
  points INT NOT NULL DEFAULT 10 CHECK (points > 0),

  -- 사유
  reason TEXT,

  -- 만료일 (기본 6개월 후)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 months'),

  -- 생성 정보
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) -- 파트너가 수동으로 부여한 경우

);

-- 인덱스 생성
CREATE INDEX idx_user_penalties_user_id ON user_penalties(user_id);
CREATE INDEX idx_user_penalties_entry_id ON user_penalties(entry_id);
CREATE INDEX idx_user_penalties_expires_at ON user_penalties(expires_at);
CREATE INDEX idx_user_penalties_created_at ON user_penalties(created_at DESC);

-- 패널티 만료일 인덱스 (부분 인덱스 제거 - NOW() 함수는 IMMUTABLE이 아님)
CREATE INDEX idx_user_penalties_active ON user_penalties(user_id, expires_at);

COMMENT ON TABLE user_penalties IS '사용자 패널티 기록 테이블';
COMMENT ON COLUMN user_penalties.penalty_type IS '패널티 유형: no_show(노쇼), late_cancel(3일 이내 취소), rule_violation(규칙 위반)';
COMMENT ON COLUMN user_penalties.points IS '차감할 신뢰도 점수';
COMMENT ON COLUMN user_penalties.expires_at IS '패널티 만료일 (자동 삭제 대상)';


-- ============================================================================
-- 2. campaign_rules 테이블 생성
-- 캠페인별 규칙 정의 (취소 마감, 출석 필수, 양도 금지 등)
CREATE TABLE IF NOT EXISTS campaign_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES event_campaigns(id) ON DELETE CASCADE,

  -- 규칙 유형
  rule_type TEXT NOT NULL CHECK (rule_type IN ('cancel_deadline', 'attendance_required', 'no_transfer', 'custom')),

  -- 규칙 설정 (JSON)
  -- 예: {"days_before": 3, "penalty_points": 10}
  --     {"required": true, "penalty_points": 20}
  config JSONB NOT NULL DEFAULT '{}',

  -- 활성화 여부
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- 생성일
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_campaign_rules_campaign_id ON campaign_rules(campaign_id);
CREATE INDEX idx_campaign_rules_active ON campaign_rules(campaign_id, is_active) WHERE is_active = TRUE;

COMMENT ON TABLE campaign_rules IS '캠페인별 규칙 정의 테이블';
COMMENT ON COLUMN campaign_rules.rule_type IS '규칙 유형: cancel_deadline(취소 마감), attendance_required(출석 필수), no_transfer(양도 금지)';
COMMENT ON COLUMN campaign_rules.config IS '규칙 상세 설정 (JSON)';


-- ============================================================================
-- 3. users 테이블에 신뢰도 관련 컬럼 추가
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS trust_score INT NOT NULL DEFAULT 100 CHECK (trust_score >= 0 AND trust_score <= 100),
  ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS restriction_reason TEXT,
  ADD COLUMN IF NOT EXISTS restriction_until TIMESTAMPTZ;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_trust_score ON users(trust_score);
CREATE INDEX IF NOT EXISTS idx_users_is_restricted ON users(is_restricted) WHERE is_restricted = TRUE;

COMMENT ON COLUMN users.trust_score IS '사용자 신뢰도 점수 (0-100, 기본 100)';
COMMENT ON COLUMN users.is_restricted IS '응모 제한 여부 (60점 이하 시 자동 TRUE)';
COMMENT ON COLUMN users.restriction_reason IS '제한 사유';
COMMENT ON COLUMN users.restriction_until IS '제한 해제 예정일';


-- ============================================================================
-- 4. entries 테이블에 취소 관련 컬럼 추가
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_entries_is_cancelled ON entries(is_cancelled);
CREATE INDEX IF NOT EXISTS idx_entries_cancelled_at ON entries(cancelled_at DESC) WHERE cancelled_at IS NOT NULL;

COMMENT ON COLUMN entries.is_cancelled IS '응모 취소 여부';
COMMENT ON COLUMN entries.cancelled_at IS '취소 일시';
COMMENT ON COLUMN entries.cancellation_reason IS '취소 사유';


-- ============================================================================
-- 5. RLS (Row Level Security) 정책 설정
-- ============================================================================

-- user_penalties 테이블 RLS 활성화
ALTER TABLE user_penalties ENABLE ROW LEVEL SECURITY;

-- 본인의 패널티만 조회 가능 (member)
DROP POLICY IF EXISTS "Users can view their own penalties" ON user_penalties;
CREATE POLICY "Users can view their own penalties"
  ON user_penalties
  FOR SELECT
  USING (auth.uid() = user_id);

-- 파트너는 자신의 캠페인 관련 패널티 조회 가능
DROP POLICY IF EXISTS "Partners can view penalties for their campaigns" ON user_penalties;
CREATE POLICY "Partners can view penalties for their campaigns"
  ON user_penalties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_campaigns ec
      INNER JOIN shows s ON s.id = ec.show_id
      INNER JOIN users u ON u.id = s.partner_id
      WHERE ec.id = user_penalties.campaign_id
        AND u.id = auth.uid()
        AND u.role = 'partner'
    )
  );

-- 파트너는 자신의 캠페인에 대해 패널티 부여 가능
DROP POLICY IF EXISTS "Partners can create penalties for their campaigns" ON user_penalties;
CREATE POLICY "Partners can create penalties for their campaigns"
  ON user_penalties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM event_campaigns ec
      INNER JOIN shows s ON s.id = ec.show_id
      INNER JOIN users u ON u.id = s.partner_id
      WHERE ec.id = user_penalties.campaign_id
        AND u.id = auth.uid()
        AND u.role = 'partner'
    )
  );

-- 관리자는 모든 패널티 조회/생성/삭제 가능
DROP POLICY IF EXISTS "Admins have full access to penalties" ON user_penalties;
CREATE POLICY "Admins have full access to penalties"
  ON user_penalties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- campaign_rules 테이블 RLS 활성화
ALTER TABLE campaign_rules ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 규칙 조회 가능 (공개)
DROP POLICY IF EXISTS "Anyone can view campaign rules" ON campaign_rules;
CREATE POLICY "Anyone can view campaign rules"
  ON campaign_rules
  FOR SELECT
  USING (TRUE);

-- 파트너는 자신의 캠페인에 대해 규칙 생성/수정 가능
DROP POLICY IF EXISTS "Partners can manage rules for their campaigns" ON campaign_rules;
CREATE POLICY "Partners can manage rules for their campaigns"
  ON campaign_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM event_campaigns ec
      INNER JOIN shows s ON s.id = ec.show_id
      INNER JOIN users u ON u.id = s.partner_id
      WHERE ec.id = campaign_rules.campaign_id
        AND u.id = auth.uid()
        AND u.role = 'partner'
    )
  );

-- 관리자는 모든 규칙 관리 가능
DROP POLICY IF EXISTS "Admins have full access to campaign rules" ON campaign_rules;
CREATE POLICY "Admins have full access to campaign rules"
  ON campaign_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================================
-- 6. 유틸리티 함수: 사용자 신뢰도 점수 재계산
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_trust_score(target_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_penalty_points INT;
  new_trust_score INT;
BEGIN
  -- 만료되지 않은 패널티의 총 점수 계산
  SELECT COALESCE(SUM(points), 0)
  INTO total_penalty_points
  FROM user_penalties
  WHERE user_id = target_user_id
    AND expires_at > NOW();

  -- 신뢰도 점수 = 100 - 총 패널티 점수
  new_trust_score := GREATEST(0, 100 - total_penalty_points);

  -- users 테이블 업데이트
  UPDATE users
  SET
    trust_score = new_trust_score,
    is_restricted = (new_trust_score < 60),
    restriction_reason = CASE
      WHEN new_trust_score < 60 THEN '신뢰도 점수 부족'
      ELSE NULL
    END
  WHERE id = target_user_id;

  RETURN new_trust_score;
END;
$$;

COMMENT ON FUNCTION recalculate_trust_score IS '사용자의 신뢰도 점수를 재계산하고 제한 여부를 업데이트';


-- ============================================================================
-- 7. 트리거: 패널티 추가 시 자동 점수 재계산
-- ============================================================================

CREATE OR REPLACE FUNCTION trigger_recalculate_trust_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- 패널티가 추가/삭제될 때 자동으로 신뢰도 점수 재계산
  PERFORM recalculate_trust_score(NEW.user_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_penalty_insert ON user_penalties;
CREATE TRIGGER after_penalty_insert
  AFTER INSERT ON user_penalties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_trust_score();

DROP TRIGGER IF EXISTS after_penalty_delete ON user_penalties;
CREATE TRIGGER after_penalty_delete
  AFTER DELETE ON user_penalties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_recalculate_trust_score();


-- ============================================================================
-- 8. 기본 캠페인 규칙 삽입
-- ============================================================================

-- 기존 모든 캠페인에 기본 규칙 추가
INSERT INTO campaign_rules (campaign_id, rule_type, config)
SELECT
  id,
  'cancel_deadline',
  '{"days_before": 3, "penalty_points": 10}'::jsonb
FROM event_campaigns
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_rules cr
  WHERE cr.campaign_id = event_campaigns.id
    AND cr.rule_type = 'cancel_deadline'
);

INSERT INTO campaign_rules (campaign_id, rule_type, config)
SELECT
  id,
  'attendance_required',
  '{"required": true, "penalty_points": 20}'::jsonb
FROM event_campaigns
WHERE NOT EXISTS (
  SELECT 1 FROM campaign_rules cr
  WHERE cr.campaign_id = event_campaigns.id
    AND cr.rule_type = 'attendance_required'
);


-- ============================================================================
-- 9. 뷰: 활성 패널티 조회
-- ============================================================================

CREATE OR REPLACE VIEW active_penalties AS
SELECT
  p.*,
  u.email AS user_email,
  u.trust_score,
  s.title AS campaign_title
FROM user_penalties p
INNER JOIN users u ON u.id = p.user_id
LEFT JOIN event_campaigns ec ON ec.id = p.campaign_id
LEFT JOIN shows s ON s.id = ec.show_id
WHERE p.expires_at > NOW()
ORDER BY p.created_at DESC;

COMMENT ON VIEW active_penalties IS '만료되지 않은 활성 패널티 목록';


-- ============================================================================
-- 완료
-- ============================================================================

-- 마이그레이션 완료 로그
DO $$
BEGIN
  RAISE NOTICE 'Rule Engine 마이그레이션 완료';
  RAISE NOTICE '- user_penalties 테이블 생성';
  RAISE NOTICE '- campaign_rules 테이블 생성';
  RAISE NOTICE '- users 테이블에 trust_score 추가';
  RAISE NOTICE '- entries 테이블에 취소 관련 컬럼 추가';
  RAISE NOTICE '- RLS 정책 설정 완료';
  RAISE NOTICE '- 자동 점수 재계산 트리거 설정 완료';
END $$;



