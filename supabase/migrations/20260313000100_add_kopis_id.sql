-- ticket_campaigns에 kopis_id 컬럼 추가
-- KOPIS 공연 ID (예: PF284487)를 저장해 실제 공연 데이터와 연결
ALTER TABLE public.ticket_campaigns
  ADD COLUMN IF NOT EXISTS kopis_id TEXT;

COMMENT ON COLUMN public.ticket_campaigns.kopis_id IS 'KOPIS 공연예술통합전산망 공연 ID (mt20id). 설정 시 이벤트 페이지에서 KOPIS 공식 데이터를 함께 표시한다.';

-- performances 테이블에도 kopis_id 추가
ALTER TABLE public.performances
  ADD COLUMN IF NOT EXISTS kopis_id TEXT;

COMMENT ON COLUMN public.performances.kopis_id IS 'KOPIS 공연 ID (mt20id). 설정 시 공연 목록/상세에서 KOPIS 공식 데이터를 참조한다.';
