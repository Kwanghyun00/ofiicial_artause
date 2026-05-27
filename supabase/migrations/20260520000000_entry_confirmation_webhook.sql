-- ticket_entries 신규 삽입 시 이메일 확인 웹훅 트리거
-- pg_net 확장이 활성화된 Supabase 프로젝트에서 동작
-- SUPABASE_WEBHOOK_SECRET 환경변수와 NEXT_PUBLIC_SITE_URL을 Supabase Vault/Settings에 설정 필요

create extension if not exists pg_net schema extensions;

create or replace function notify_entry_confirmation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _site_url text := current_setting('app.site_url', true);
  _webhook_secret text := current_setting('app.webhook_secret', true);
  _performance_name text;
  _payload jsonb;
begin
  -- 연결된 campaign → performance 이름 조회
  select p.title into _performance_name
  from ticket_campaigns tc
  join performances p on p.id = tc.performance_id
  where tc.id = new.campaign_id
  limit 1;

  _payload := jsonb_build_object(
    'record', row_to_json(new),
    'performance_name', coalesce(_performance_name, '공연')
  );

  perform extensions.http_post(
    url        => _site_url || '/api/ticket-entry-confirm',
    body       => _payload::text,
    content_type => 'application/json',
    headers    => jsonb_build_object('Authorization', 'Bearer ' || coalesce(_webhook_secret, ''))
  );

  return new;
end;
$$;

drop trigger if exists trg_entry_confirmation on ticket_entries;
create trigger trg_entry_confirmation
  after insert on ticket_entries
  for each row
  execute function notify_entry_confirmation();

comment on function notify_entry_confirmation() is
  'ticket_entries 삽입 시 /api/ticket-entry-confirm 웹훅을 호출하여 신청 접수 확인 이메일을 발송한다';
