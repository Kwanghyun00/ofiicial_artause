-- ============================================================================
-- 체험단 플랫폼: 선정/체크인/지원 시 알림 자동 발송 DB 트리거
-- ============================================================================
-- NOTE: pg_cron 스케줄(notify-worker 5분 호출, 리마인더 배치)은
--       Supabase Dashboard > Database > Scheduled Functions에서 수동 설정.
--       아래는 DB 트리거만 포함합니다.

-- ============================================================================
-- 1. 선정(selection_status → 'selected') 시 자동 이메일 큐 추가
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_selection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_campaign  record;
  v_token     text;
  v_exp       timestamptz;
BEGIN
  IF NEW.selection_status = 'selected'
     AND (OLD.selection_status IS DISTINCT FROM 'selected') THEN

    SELECT title, slug, experience_dates, required_review_platforms, review_deadline_days,
           partner_email
    INTO v_campaign
    FROM public.ticket_campaigns
    WHERE id = NEW.campaign_id;

    -- 24시간 유효 confirm_token 생성
    v_token := encode(gen_random_bytes(32), 'hex');
    v_exp   := now() + interval '24 hours';

    UPDATE public.ticket_entries
    SET confirm_token     = v_token,
        confirm_token_exp = v_exp
    WHERE id = NEW.id;

    -- 지원자에게 선정 이메일
    INSERT INTO public.notifications (template, payload, deliver_at)
    VALUES (
      'entry_selected',
      jsonb_build_object(
        'email',             NEW.applicant_email,
        'applicantName',     NEW.applicant_name,
        'showTitle',         v_campaign.title,
        'campaignSlug',      v_campaign.slug,
        'confirmToken',      v_token,
        'snsTier',           NEW.sns_tier,
        'powerScore',        NEW.sns_power_score,
        'requiredPlatforms', v_campaign.required_review_platforms
      ),
      now()
    );

    -- 파트너에게도 선정 알림
    IF v_campaign.partner_email IS NOT NULL THEN
      INSERT INTO public.notifications (template, payload, deliver_at)
      VALUES (
        'partner_entry_new',
        jsonb_build_object(
          'email',         v_campaign.partner_email,
          'applicantName', NEW.applicant_name,
          'showTitle',     v_campaign.title,
          'snsTier',       NEW.sns_tier,
          'powerScore',    NEW.sns_power_score
        ),
        now()
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_selection ON public.ticket_entries;
CREATE TRIGGER trg_notify_on_selection
  AFTER UPDATE OF selection_status ON public.ticket_entries
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_selection();

-- ============================================================================
-- 2. 체크인(attendance_status → 'checked_in') 시 D+1 리뷰 요청 큐
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_checkin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_campaign record;
BEGIN
  IF NEW.attendance_status = 'checked_in'
     AND (OLD.attendance_status IS DISTINCT FROM 'checked_in') THEN

    SELECT title, slug, required_review_platforms, review_deadline_days
    INTO v_campaign
    FROM public.ticket_campaigns
    WHERE id = NEW.campaign_id;

    -- 관람 다음날 오전 10시에 리뷰 요청 발송
    INSERT INTO public.notifications (template, payload, deliver_at)
    VALUES (
      'review_reminder',
      jsonb_build_object(
        'email',             NEW.applicant_email,
        'applicantName',     NEW.applicant_name,
        'showTitle',         v_campaign.title,
        'campaignSlug',      v_campaign.slug,
        'qrToken',           NEW.qr_token,
        'requiredPlatforms', v_campaign.required_review_platforms,
        'daysLeft',          v_campaign.review_deadline_days,
        'deadline',          (CURRENT_DATE + v_campaign.review_deadline_days)::text
      ),
      (CURRENT_DATE + 1)::timestamptz + interval '10 hours'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_checkin ON public.ticket_entries;
CREATE TRIGGER trg_notify_on_checkin
  AFTER UPDATE OF attendance_status ON public.ticket_entries
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_checkin();

-- ============================================================================
-- 3. 지원 접수(INSERT) 시 접수 확인 이메일
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_on_entry_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_campaign record;
BEGIN
  SELECT title, slug, required_review_platforms
  INTO v_campaign
  FROM public.ticket_campaigns
  WHERE id = NEW.campaign_id;

  INSERT INTO public.notifications (template, payload, deliver_at)
  VALUES (
    'entry_received',
    jsonb_build_object(
      'email',         NEW.applicant_email,
      'applicantName', NEW.applicant_name,
      'showTitle',     v_campaign.title,
      'campaignSlug',  v_campaign.slug,
      'snsTier',       NEW.sns_tier,
      'powerScore',    NEW.sns_power_score
    ),
    now()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_entry_insert ON public.ticket_entries;
CREATE TRIGGER trg_notify_on_entry_insert
  AFTER INSERT ON public.ticket_entries
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_entry_insert();

-- ============================================================================
-- 4. D-3 리마인더 배치 SQL (pg_cron 또는 외부 크론으로 매일 09:00 실행)
-- ============================================================================
-- Supabase Dashboard > Database > Scheduled Functions 에서 아래 SQL을 등록:
--
-- INSERT INTO public.notifications (template, payload, deliver_at)
-- SELECT
--   'review_reminder',
--   jsonb_build_object(
--     'email',             te.applicant_email,
--     'applicantName',     te.applicant_name,
--     'showTitle',         tc.title,
--     'campaignSlug',      tc.slug,
--     'qrToken',           te.qr_token,
--     'requiredPlatforms', tc.required_review_platforms,
--     'daysLeft',          3,
--     'deadline',          (te.confirmed_date + tc.review_deadline_days)::text
--   ),
--   now()
-- FROM public.ticket_entries te
-- JOIN public.ticket_campaigns tc ON tc.id = te.campaign_id
-- WHERE te.selection_status = 'selected'
--   AND te.attendance_status = 'checked_in'
--   AND te.review_submitted = false
--   AND te.confirmed_date IS NOT NULL
--   AND (te.confirmed_date + tc.review_deadline_days) = (CURRENT_DATE + 3);
