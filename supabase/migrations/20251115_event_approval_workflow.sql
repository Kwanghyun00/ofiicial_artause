-- 이벤트 승인 워크플로우 및 당첨자 관리 스키마 추가

-- ticket_campaigns 테이블에 승인 워크플로우 필드 추가
alter table public.ticket_campaigns
  add column if not exists status text not null default 'pending_approval'
    check (status in ('pending_approval', 'approved', 'rejected', 'closed')),
  add column if not exists ticket_purchase_url text,
  add column if not exists partner_name text,
  add column if not exists partner_email text,
  add column if not exists partner_phone text,
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text;

-- ticket_entries 테이블에 선정 및 관람 체크 필드 추가
alter table public.ticket_entries
  add column if not exists selection_status text not null default 'pending'
    check (selection_status in ('pending', 'selected', 'rejected')),
  add column if not exists attendance_status text not null default 'pending'
    check (attendance_status in ('pending', 'checked_in', 'no_show')),
  add column if not exists selected_at timestamptz,
  add column if not exists checked_in_at timestamptz;

-- 인덱스 추가 (성능 최적화)
create index if not exists idx_campaigns_status on public.ticket_campaigns(status);
create index if not exists idx_campaigns_approved on public.ticket_campaigns(status, approved_at)
  where status = 'approved';
create index if not exists idx_entries_selection on public.ticket_entries(campaign_id, selection_status);
create index if not exists idx_entries_attendance on public.ticket_entries(campaign_id, attendance_status);

-- 기존 데이터 마이그레이션: 기존 캠페인은 승인된 것으로 처리
update public.ticket_campaigns
set status = 'approved', approved_at = created_at
where status = 'pending_approval';

-- 코멘트 추가
comment on column public.ticket_campaigns.status is '이벤트 승인 상태: pending_approval(승인대기), approved(승인됨), rejected(거부됨), closed(종료됨)';
comment on column public.ticket_campaigns.ticket_purchase_url is '공연 티켓 구매 URL';
comment on column public.ticket_entries.selection_status is '당첨 여부: pending(대기), selected(당첨), rejected(미당첨)';
comment on column public.ticket_entries.attendance_status is '관람 여부: pending(미확인), checked_in(관람완료), no_show(미관람)';
