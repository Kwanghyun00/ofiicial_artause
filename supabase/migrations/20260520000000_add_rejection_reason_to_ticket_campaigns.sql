alter table public.ticket_campaigns
  add column if not exists rejection_reason text;
