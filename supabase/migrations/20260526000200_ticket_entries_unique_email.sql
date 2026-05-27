-- ============================================================================
-- ticket_entries — (campaign_id, applicant_email) unique constraint
-- 같은 이메일로 동일 캠페인에 중복 신청하는 경우를 DB 레벨에서 방지한다.
-- PostgreSQL unique violation: error code 23505
-- ============================================================================

ALTER TABLE public.ticket_entries
  DROP CONSTRAINT IF EXISTS ticket_entries_campaign_email_unique;

ALTER TABLE public.ticket_entries
  ADD CONSTRAINT ticket_entries_campaign_email_unique
    UNIQUE (campaign_id, applicant_email);

COMMENT ON CONSTRAINT ticket_entries_campaign_email_unique
  ON public.ticket_entries IS '동일 캠페인에 동일 이메일로 중복 신청 방지';
