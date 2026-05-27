-- rejection_reason 컬럼 추가 (관리자가 거부 시 사유 기록)
alter table public.ticket_campaigns
  add column if not exists rejection_reason text;
