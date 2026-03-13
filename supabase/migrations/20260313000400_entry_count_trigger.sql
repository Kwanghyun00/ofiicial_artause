-- ============================================================================
-- entry_count 자동 집계 트리거
-- ticket_entries INSERT/DELETE 시 ticket_campaigns.entry_count를 자동 갱신
-- ============================================================================

-- 1. ticket_campaigns에 entry_count 컬럼 추가
ALTER TABLE public.ticket_campaigns
  ADD COLUMN IF NOT EXISTS entry_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.ticket_campaigns.entry_count IS '응모자 수 (ticket_entries 행 수와 동기화됨)';

-- 2. 기존 데이터로 초기화
UPDATE public.ticket_campaigns tc
SET entry_count = (
  SELECT count(*) FROM public.ticket_entries te
  WHERE te.campaign_id = tc.id
);

-- 3. 트리거 함수
CREATE OR REPLACE FUNCTION public.sync_entry_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.ticket_campaigns
    SET entry_count = entry_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.ticket_campaigns
    SET entry_count = GREATEST(entry_count - 1, 0)
    WHERE id = OLD.campaign_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 4. 트리거 등록
DROP TRIGGER IF EXISTS trg_sync_entry_count ON public.ticket_entries;
CREATE TRIGGER trg_sync_entry_count
  AFTER INSERT OR DELETE ON public.ticket_entries
  FOR EACH ROW EXECUTE FUNCTION public.sync_entry_count();

-- 5. VIEW 재생성: entry_count 포함
DROP VIEW IF EXISTS public.public_ticket_campaigns;

CREATE VIEW public.public_ticket_campaigns AS
SELECT
  id,
  slug,
  performance_id,
  kopis_id,
  title,
  description,
  reward,
  starts_at,
  ends_at,
  form_link,
  created_at,
  updated_at,
  status,
  allocation,
  algorithm_version,
  config,
  snapshot_seed,
  last_draw_at,
  ticket_purchase_url,
  approved_at,
  approved_by,
  available_dates,
  performance_period_start,
  performance_period_end,
  one_line_intro,
  poster_image,
  still_images,
  venue_name,
  venue_address,
  sessions_per_week,
  running_time,
  age_rating,
  sns_instagram,
  sns_youtube,
  sns_tiktok,
  hashtags,
  production_team,
  ticket_allocations,
  entry_count
FROM public.ticket_campaigns
WHERE status = 'approved';

COMMENT ON VIEW public.public_ticket_campaigns IS
  'Public-safe ticket campaigns (PII removed, approved only). Includes entry_count and kopis_id.';

-- 6. 권한 재부여
REVOKE ALL ON TABLE public.public_ticket_campaigns FROM public;
REVOKE ALL ON TABLE public.public_ticket_campaigns FROM anon, authenticated;
GRANT SELECT ON TABLE public.public_ticket_campaigns TO anon, authenticated;
