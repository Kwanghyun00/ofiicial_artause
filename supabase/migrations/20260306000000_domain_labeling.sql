-- ============================================================================
-- 도메인 분류 및 테이블 라벨링
-- 목적: PRD DB_RESEARCH_DATA_PLAN §4.1 기준으로 테이블에 소유자/도메인/상태 주석을 표준화
-- 생성일: 2026-03-06
-- ============================================================================

-- ============================================================================
-- [도메인: 콘텐츠/카탈로그] Owner: Product + Backend
-- ============================================================================
COMMENT ON TABLE public.performances IS
  '[도메인:콘텐츠] [상태:활성] 공연 카탈로그 원본. Owner: Product+Backend';

COMMENT ON TABLE public.organizations IS
  '[도메인:콘텐츠] [상태:활성] 공연 단체/제작사 정보. Owner: Product+Backend';

COMMENT ON TABLE public.community_posts IS
  '[도메인:콘텐츠] [상태:활성] 단체 블로그 게시물. Owner: Product+Backend';

COMMENT ON TABLE public.reviews IS
  '[도메인:콘텐츠] [상태:활성] 관객 공연 후기. Owner: Product+Backend';

COMMENT ON TABLE public.review_events IS
  '[도메인:콘텐츠] [상태:활성] 후기 행동 이벤트 로그(도움돼요, 신고 등). Owner: Product+Backend';

-- ============================================================================
-- [도메인: 캠페인 운영] Owner: Campaign Ops + Backend
-- ============================================================================
COMMENT ON TABLE public.ticket_campaigns IS
  '[도메인:캠페인] [상태:활성] 공연 초대권 응모 캠페인. Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.ticket_entries IS
  '[도메인:캠페인] [상태:활성] 관객 응모 접수 원본 (PII 포함). Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_participants IS
  '[도메인:캠페인] [상태:활성] 응모자 식별자 (연락처 해시). Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_entries IS
  '[도메인:캠페인] [상태:활성] 가중치 기반 응모 원장. Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_draws IS
  '[도메인:캠페인] [상태:활성] 추첨 실행 기록. Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_winner_responses IS
  '[도메인:캠페인] [상태:활성] 당첨자 수락/거절 응답 추적. Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_waitlist_promotions IS
  '[도메인:캠페인] [상태:활성] 대기 순번 승격 원장. Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_ad_watch_verifications IS
  '[도메인:캠페인] [상태:활성] 광고 시청 검증 증거. Owner: Campaign Ops+Backend';

COMMENT ON TABLE public.campaign_blacklist IS
  '[도메인:캠페인] [상태:활성] 캠페인 블랙리스트. Owner: Campaign Ops+Backend';

-- ============================================================================
-- [도메인: 정책/신뢰도] Owner: Security + Backend
-- ============================================================================
COMMENT ON TABLE public.users IS
  '[도메인:정책] [상태:활성] 역할 기반 사용자 계정 (member/partner/admin). Owner: Security+Backend';

COMMENT ON TABLE public.user_penalties IS
  '[도메인:정책] [상태:활성] 사용자 패널티 기록 (노쇼, 취소, 규칙위반). Owner: Security+Backend';

COMMENT ON TABLE public.campaign_rules IS
  '[도메인:정책] [상태:활성] 캠페인별 규칙 정의. Owner: Security+Backend';

COMMENT ON TABLE public.adgate_verifications IS
  '[도메인:정책] [상태:레거시후보] AdGate 구 스키마 검증 레코드. 신규 campaign_ad_watch_verifications로 대체 예정. Owner: Backend';

COMMENT ON TABLE public.audit_logs IS
  '[도메인:정책] [상태:활성] 시스템 감사 추적 로그. Owner: Security+Backend';

-- ============================================================================
-- [도메인: 접수/운영지원] Owner: Ops + Backend
-- ============================================================================
COMMENT ON TABLE public.promotion_requests IS
  '[도메인:운영지원] [상태:활성] 마케팅 컨설팅 신청 접수 (PII 포함). Owner: Ops+Backend';

COMMENT ON TABLE public.performance_submissions IS
  '[도메인:운영지원] [상태:활성] 파트너 공연 등록 신청. Owner: Ops+Backend';

COMMENT ON TABLE public.feedback IS
  '[도메인:운영지원] [상태:활성] 서비스 피드백 (free-text PII 주의). Owner: Ops+Backend';

COMMENT ON TABLE public.audiences IS
  '[도메인:운영지원] [상태:활성] 관객 프로필. Owner: Ops+Backend';

COMMENT ON TABLE public.notifications IS
  '[도메인:운영지원] [상태:활성] 사용자 알림 발송 큐. Owner: Ops+Backend';

-- ============================================================================
-- [도메인: 레거시 후보] Owner: Backend (정리 책임)
-- 참조 코드 없음 확인 완료 (2026-03-06 기준 queries.ts 미참조)
-- ============================================================================
COMMENT ON TABLE public.shows IS
  '[도메인:레거시] [상태:deprecate예정] AdGate v1 구 공연 테이블. ticket_campaigns+performances로 대체됨. 2026-04-06 이후 DROP 예정.';

COMMENT ON TABLE public.show_performances IS
  '[도메인:레거시] [상태:deprecate예정] AdGate v1 구 회차 테이블. 2026-04-06 이후 DROP 예정.';

COMMENT ON TABLE public.event_campaigns IS
  '[도메인:레거시] [상태:deprecate예정] AdGate v1 구 캠페인 테이블. ticket_campaigns로 대체됨. user_penalties 참조 존재. 2026-04-06 이후 DROP 예정.';

COMMENT ON TABLE public.entries IS
  '[도메인:레거시] [상태:deprecate예정] AdGate v1 구 응모 테이블. campaign_entries로 대체됨. user_penalties 참조 존재. 2026-04-06 이후 DROP 예정.';

COMMENT ON TABLE public.lottery_runs IS
  '[도메인:레거시] [상태:deprecate예정] AdGate v1 구 추첨 실행 테이블. campaign_draws로 대체됨. 2026-04-06 이후 DROP 예정.';

-- ============================================================================
-- PII 컬럼 주석 표준화 (연구 반출 금지 명시)
-- ============================================================================
COMMENT ON COLUMN public.users.email IS '[PII:반출금지] 사용자 이메일';
COMMENT ON COLUMN public.ticket_entries.applicant_name IS '[PII:반출금지] 응모자 이름';
COMMENT ON COLUMN public.ticket_entries.applicant_email IS '[PII:반출금지] 응모자 이메일';
COMMENT ON COLUMN public.ticket_entries.applicant_phone IS '[PII:반출금지] 응모자 전화번호';
COMMENT ON COLUMN public.promotion_requests.contact_name IS '[PII:반출금지] 담당자 이름';
COMMENT ON COLUMN public.promotion_requests.contact_email IS '[PII:반출금지] 담당자 이메일';
COMMENT ON COLUMN public.promotion_requests.contact_phone IS '[PII:반출금지] 담당자 전화번호';
COMMENT ON COLUMN public.reviews.author_name IS '[PII:반출금지] 후기 작성자 이름';
COMMENT ON COLUMN public.reviews.author_email IS '[PII:반출금지] 후기 작성자 이메일';
COMMENT ON COLUMN public.reviews.review_text IS '[PII:주의] free-text, 연구 반출 시 별도 승인 필요';
COMMENT ON COLUMN public.feedback.description IS '[PII:주의] free-text, 연구 반출 시 별도 승인 필요';
COMMENT ON COLUMN public.ticket_entries.answers IS '[PII:주의] free-text JSON, 연구 반출 시 별도 승인 필요';
