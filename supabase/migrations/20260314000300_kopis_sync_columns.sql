-- ============================================================================
-- performances 테이블에 KOPIS 배치 동기화용 컬럼 추가
-- source: 데이터 출처 ('manual' | 'kopis')
-- last_synced_at: 마지막 KOPIS 동기화 시각
-- sync_status: 동기화 상태 ('synced' | 'error' | 'pending')
-- 상세 정보 컬럼: cast_info, crew_info, runtime_text, age_limit, price_info, schedule_info
-- ============================================================================

ALTER TABLE public.performances
  ADD COLUMN IF NOT EXISTS source          TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'kopis')),
  ADD COLUMN IF NOT EXISTS last_synced_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sync_status     TEXT
    CHECK (sync_status IN ('synced', 'error', 'pending')),
  ADD COLUMN IF NOT EXISTS cast_info       TEXT,
  ADD COLUMN IF NOT EXISTS crew_info       TEXT,
  ADD COLUMN IF NOT EXISTS runtime_text    TEXT,
  ADD COLUMN IF NOT EXISTS age_limit       TEXT,
  ADD COLUMN IF NOT EXISTS price_info      TEXT,
  ADD COLUMN IF NOT EXISTS schedule_info   TEXT;

COMMENT ON COLUMN public.performances.source         IS '데이터 출처: manual(직접 등록), kopis(KOPIS 배치 동기화)';
COMMENT ON COLUMN public.performances.last_synced_at IS 'KOPIS 배치 동기화 마지막 실행 시각';
COMMENT ON COLUMN public.performances.sync_status    IS 'KOPIS 동기화 상태: synced/error/pending';
COMMENT ON COLUMN public.performances.cast_info      IS 'KOPIS 출연진';
COMMENT ON COLUMN public.performances.crew_info      IS 'KOPIS 제작진';
COMMENT ON COLUMN public.performances.runtime_text   IS 'KOPIS 러닝타임 텍스트 (예: "110분")';
COMMENT ON COLUMN public.performances.age_limit      IS 'KOPIS 관람 연령 (예: "14세 이상")';
COMMENT ON COLUMN public.performances.price_info     IS 'KOPIS 가격 정보';
COMMENT ON COLUMN public.performances.schedule_info  IS 'KOPIS 공연 일정 안내';

-- kopis_id에 UNIQUE 인덱스 추가 (upsert 기준)
-- NULL 값은 중복 허용 (수동 등록 공연 다수 존재)
CREATE UNIQUE INDEX IF NOT EXISTS performances_kopis_id_unique
  ON public.performances(kopis_id)
  WHERE kopis_id IS NOT NULL;
