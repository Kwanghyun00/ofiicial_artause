'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createEventCampaignSchema, type CreateEventCampaignPayload } from '@/lib/models/ticket-campaign';
import { isSupabaseConfigured } from '@/lib/config';
import { getPartnerSession } from '@/lib/auth/partner-session';
import { sendLotteryWinnerNotification, type LotteryWinnerData } from '@/lib/email/templates/lottery-winner';
import { sendCampaignRejectionNotification } from '@/lib/email/templates/campaign-rejected';

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

/**
 * 공연 종사자가 새로운 이벤트를 생성합니다.
 * - 공연 정보와 초대권 이벤트를 함께 생성
 * - 승인 대기 상태(pending_approval)로 저장
 */
export async function createEventCampaign(
  payload: CreateEventCampaignPayload
): Promise<ActionResult<{ performanceId: string; campaignId: string }>> {
  // 1. 입력값 검증
  const parsed = createEventCampaignSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const data = parsed.data;

  // 2. Mock 모드 처리
  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 이벤트 생성 요청:', data);
    return {
      success: true,
      data: {
        performanceId: 'mock-perf-' + Date.now(),
        campaignId: 'mock-camp-' + Date.now(),
      },
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 3. 공연 정보 생성 (performances 테이블)
    const performanceSlug = generateSlug(data.performanceTitle, data.startsAt);
    const { data: performance, error: perfError } = await supabase
      .from('performances')
      .insert({
        slug: performanceSlug,
        title: data.performanceTitle,
        synopsis: data.performanceDescription || null,
        ticket_link: data.ticketPurchaseUrl || null,
        status: 'draft',
        is_featured: false,
      })
      .select('id')
      .single();

    if (perfError || !performance) {
      console.error('Performance creation error:', perfError);
      return {
        success: false,
        error: '공연 정보 생성에 실패했습니다.',
      };
    }

    // 4. 이벤트 캠페인 생성 (ticket_campaigns 테이블)
    const campaignSlug = generateSlug(data.eventTitle, data.startsAt);
    const { data: campaign, error: campError } = await supabase
      .from('ticket_campaigns')
      .insert({
        slug: campaignSlug,
        performance_id: performance.id,
        title: data.eventTitle,
        description: data.eventDescription || null,
        reward: `${data.ticketCount}매`,
        starts_at: data.startsAt,
        ends_at: data.endsAt,
        form_link: data.promoChannel || null,
        status: 'pending_approval',
        ticket_purchase_url: data.ticketPurchaseUrl || null,
        partner_name: data.partnerName,
        partner_email: data.partnerEmail,
        partner_phone: data.partnerPhone,
      })
      .select('id')
      .single();

    if (campError || !campaign) {
      console.error('Campaign creation error:', campError);
      // 공연 정보도 롤백 (실패 시)
      await supabase.from('performances').delete().eq('id', performance.id);
      return {
        success: false,
        error: '이벤트 생성에 실패했습니다.',
      };
    }

    // 5. 캐시 무효화
    revalidatePath('/event-center');
    revalidatePath('/events');

    return {
      success: true,
      data: {
        performanceId: performance.id,
        campaignId: campaign.id,
      },
    };
  } catch (error) {
    console.error('Unexpected error in createEventCampaign:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 관리자가 이벤트를 승인합니다.
 */
export async function approveEventCampaign(campaignId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 이벤트 승인:', campaignId);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('ticket_campaigns')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin', // TODO: 실제 관리자 ID로 교체
      })
      .eq('id', campaignId);

    if (error) {
      console.error('Campaign approval error:', error);
      return { success: false, error: '승인 처리에 실패했습니다.' };
    }

    // 연관된 공연도 활성화
    const { data: campaign } = await supabase
      .from('ticket_campaigns')
      .select('performance_id')
      .eq('id', campaignId)
      .single();

    if (campaign?.performance_id) {
      await supabase
        .from('performances')
        .update({ status: 'scheduled' })
        .eq('id', campaign.performance_id);
    }

    revalidatePath('/event-center');
    revalidatePath('/events');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in approveEventCampaign:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

/**
 * 관리자가 이벤트를 거부합니다.
 * 거부 사유를 저장하고 파트너에게 안내 이메일을 발송합니다.
 */
export async function rejectEventCampaign(
  campaignId: string,
  rejectionReason = '관리자 검토 결과 승인 기준을 충족하지 않았습니다.',
): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 이벤트 거부:', campaignId, rejectionReason);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const rejectedAt = new Date().toISOString();

    // 캠페인 정보 조회 (이메일 발송에 필요)
    const { data: campaign } = await supabase
      .from('ticket_campaigns')
      .select('title, partner_name, partner_email')
      .eq('id', campaignId)
      .single();

    const { error } = await supabase
      .from('ticket_campaigns')
      .update({ status: 'rejected', rejection_reason: rejectionReason })
      .eq('id', campaignId);

    if (error) {
      console.error('Campaign rejection error:', error);
      return { success: false, error: '거부 처리에 실패했습니다.' };
    }

    // 파트너 이메일이 있으면 거부 안내 발송 (실패해도 거부 처리는 유지)
    if (campaign?.partner_email) {
      sendCampaignRejectionNotification({
        partnerName: campaign.partner_name ?? '파트너',
        partnerEmail: campaign.partner_email,
        campaignName: campaign.title ?? campaignId,
        rejectedAt,
        rejectionReason,
      }).catch((err) =>
        console.error('[rejectEventCampaign] rejection email failed:', err)
      );
    }

    revalidatePath('/event-center');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in rejectEventCampaign:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

/**
 * 당첨자 선정은 외부 도구(구글 시트 등)에서 수행됩니다.
 * 데이터베이스에 직접 selection_status를 업데이트하는 방식으로 처리하세요.
 */

/**
 * 공연 종사자가 관람 체크를 업데이트합니다.
 */
export async function updateAttendance(
  entryId: string,
  status: 'checked_in' | 'no_show'
): Promise<ActionResult> {
  // 권한 확인
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 관람 체크:', entryId, status);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 1. 권한 검증: 이 응모가 본인의 캠페인에 속하는지 확인
    const { data: entry } = await supabase
      .from('ticket_entries')
      .select('campaign_id')
      .eq('id', entryId)
      .single();

    if (!entry) {
      return { success: false, error: '응모 정보를 찾을 수 없습니다.' };
    }

    const { data: campaign } = await supabase
      .from('ticket_campaigns')
      .select('partner_email')
      .eq('id', entry.campaign_id)
      .single();

    if (!campaign || campaign.partner_email !== partnerEmail) {
      return { success: false, error: '권한이 없습니다.' };
    }

    // 2. 관람 체크 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {
      attendance_status: status,
    };

    if (status === 'checked_in') {
      updateData.checked_in_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('ticket_entries')
      .update(updateData)
      .eq('id', entryId);

    if (error) {
      console.error('Attendance update error:', error);
      return { success: false, error: '관람 체크 업데이트에 실패했습니다.' };
    }

    revalidatePath('/event-center');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateAttendance:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

/**
 * 패널티 부여 (노쇼, 취소 등) — Edge Function 제거, 직접 DB 연산
 *
 * 흐름:
 *  1. ticket_entries에서 entry 조회 → applicant_email 획득
 *  2. users 테이블에서 이메일로 user 조회
 *  3. user_penalties insert
 *     → DB 트리거(trigger_recalculate_trust_score)가 자동으로 trust_score 재계산
 *  4. 업데이트된 users 레코드 반환
 *  5. 알림 이메일 발송 (비필수)
 */
export async function applyPenalty(data: {
  entryId: string;
  penaltyType: 'no_show' | 'late_cancel' | 'rule_violation';
  points?: number;
  reason?: string;
}): Promise<ActionResult<{
  penaltyId: string;
  newTrustScore: number;
  isRestricted: boolean;
}>> {
  // Mock 모드 처리
  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 패널티 부여 요청:', data);
    return {
      success: true,
      data: {
        penaltyId: 'mock-penalty-' + Date.now(),
        newTrustScore: 80,
        isRestricted: false,
      },
    };
  }

  // 파트너 인증 확인
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // 1. 신청 정보 조회
    const { data: entry, error: entryError } = await db
      .from('ticket_entries')
      .select('id, campaign_id, applicant_name, applicant_email')
      .eq('id', data.entryId)
      .maybeSingle();

    if (entryError || !entry) {
      console.error('applyPenalty: entry not found', entryError);
      return { success: false, error: '신청 정보를 찾을 수 없습니다.' };
    }

    // 2. users 테이블에서 이메일로 사용자 조회
    const { data: user } = await db
      .from('users')
      .select('id, trust_score, is_restricted')
      .eq('email', entry.applicant_email.toLowerCase())
      .maybeSingle();

    if (!user) {
      // 사용자 계정 없음 — 패널티 기록만 남길 수 없으므로 early return
      // (user_penalties.user_id is NOT NULL)
      console.warn('applyPenalty: user not found for email', entry.applicant_email);
      return {
        success: true,
        data: { penaltyId: '', newTrustScore: 100, isRestricted: false },
      };
    }

    // 3. user_penalties insert (DB 트리거가 trust_score 재계산)
    const penaltyPoints = data.points ?? PENALTY_POINTS[data.penaltyType] ?? 10;
    const { data: penalty, error: penaltyError } = await db
      .from('user_penalties')
      .insert({
        user_id: user.id,
        entry_id: data.entryId,
        campaign_id: entry.campaign_id,
        penalty_type: data.penaltyType,
        points: penaltyPoints,
        reason: data.reason ?? PENALTY_REASON_KO[data.penaltyType],
      })
      .select('id')
      .single();

    if (penaltyError) {
      console.error('applyPenalty: insert error', penaltyError);
      return { success: false, error: '패널티 부여에 실패했습니다.' };
    }

    // 4. 업데이트된 trust_score 조회 (트리거가 이미 실행됨)
    const { data: updatedUser } = await db
      .from('users')
      .select('trust_score, is_restricted')
      .eq('id', user.id)
      .single();

    const newTrustScore = (updatedUser?.trust_score as number) ?? 0;
    const isRestricted = Boolean(updatedUser?.is_restricted);

    // 5. 패널티 알림 이메일 (비필수 — 실패해도 패널티는 유효)
    try {
      await sendPenaltyNotificationEmail({
        applicantName: entry.applicant_name as string,
        applicantEmail: entry.applicant_email as string,
        penaltyType: data.penaltyType,
        reason: data.reason ?? PENALTY_REASON_KO[data.penaltyType],
        newTrustScore,
        isRestricted,
      });
    } catch (emailErr) {
      console.warn('applyPenalty: email failed (non-fatal)', emailErr);
    }

    revalidatePath('/event-center');
    return {
      success: true,
      data: {
        penaltyId: (penalty as { id: string }).id,
        newTrustScore,
        isRestricted,
      },
    };
  } catch (error) {
    console.error('applyPenalty: unexpected error', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

// ─── 상수 ──────────────────────────────────────────────────────────────────

const PENALTY_POINTS: Record<string, number> = {
  no_show: 20,
  late_cancel: 10,
  rule_violation: 30,
};

const PENALTY_REASON_KO: Record<string, string> = {
  no_show: '공연 당일 미관람 (노쇼)',
  late_cancel: '공연 3일 이내 취소',
  rule_violation: '이용 규칙 위반',
};

// ─── 패널티 알림 이메일 ────────────────────────────────────────────────────

async function sendPenaltyNotificationEmail(payload: {
  applicantName: string;
  applicantEmail: string;
  penaltyType: string;
  reason: string;
  newTrustScore: number;
  isRestricted: boolean;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? 'noreply@artause.co.kr';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://artause.co.kr';

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8" /><title>알터즈 패널티 안내</title></head>
<body style="font-family: 'Apple SD Gothic Neo', sans-serif; background: #f9f9f9; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="background: #1a1a2e; padding: 32px 40px;">
      <p style="color: #a78bfa; font-size: 13px; letter-spacing: 0.08em; margin: 0 0 8px;">ARTAUSE</p>
      <h1 style="color: #fff; font-size: 20px; font-weight: 700; margin: 0;">패널티가 부여되었습니다</h1>
    </div>
    <div style="padding: 32px 40px;">
      <p style="color: #374151; font-size: 15px; line-height: 1.7; margin: 0 0 20px;">
        안녕하세요, <strong>${payload.applicantName}</strong>님.
      </p>
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #92400e; font-weight: 600; margin: 0 0 8px;">패널티 사유</p>
        <p style="font-size: 14px; color: #374151; margin: 0;">${payload.reason}</p>
      </div>
      <table style="width: 100%; font-size: 14px; color: #374151; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280; border-bottom: 1px solid #e5e7eb;">현재 신뢰도</td>
          <td style="padding: 8px 0; font-weight: 600; border-bottom: 1px solid #e5e7eb; text-align: right;">${payload.newTrustScore}점</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">응모 상태</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right; color: ${payload.isRestricted ? '#dc2626' : '#059669'};">
            ${payload.isRestricted ? '응모 제한 중' : '응모 가능'}
          </td>
        </tr>
      </table>
      ${payload.isRestricted ? `
      <div style="background: #fee2e2; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
        <p style="font-size: 13px; color: #991b1b; margin: 0; line-height: 1.6;">
          신뢰도 점수 60점 미만으로 응모가 일시 제한됩니다.<br />
          패널티 만료 후 자동으로 해제됩니다. (약 6개월)
        </p>
      </div>
      ` : ''}
      <a href="${siteUrl}/rules" style="display: inline-block; background: #7c3aed; color: #fff; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px;">이용 규칙 확인하기</a>
    </div>
    <div style="padding: 20px 40px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
      본 메일은 발신 전용입니다. 문의는 artause.co.kr을 통해 주세요.
    </div>
  </div>
</body>
</html>`;

  if (resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.applicantEmail],
        subject: '[알터즈] 패널티 부여 안내',
        html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend error ${res.status}: ${await res.text()}`);
    }
    return;
  }

  console.info('[Mock] Penalty notification email:', payload.applicantEmail, payload.penaltyType);
}

/**
 * 향상된 이벤트 생성 (상세 정보 포함)
 * EnhancedEventCreationWizard에서 호출됨
 */
export async function createEnhancedEventCampaign(formData: {
  // Basic Info
  oneLineIntro: string;
  posterImage: string; // URL after upload
  stillImages: string[]; // URLs after upload
  eventTitle: string;
  eventDescription: string;

  // Performance Details
  venueName: string;
  venueAddress: string;
  performancePeriodStart: string;
  performancePeriodEnd: string;
  sessionsPerWeek: number;
  runningTime: number;
  ageRating: string;

  // SNS & Marketing
  snsInstagram: string;
  snsYoutube: string;
  snsTiktok: string;
  hashtags: string[];

  // Production Team
  productionTeam: Array<{
    role: string;
    name: string;
    contact: string;
  }>;

  // Ticket Allocation
  ticketAllocations: Array<{
    date: string;
    time: string;
    quantity: number;
  }>;

  // Event Settings
  startsAt: string;
  endsAt: string;
  ticketPurchaseUrl: string;

  // Partner Info
  partnerEmail: string;
  partnerPhone: string;
}): Promise<ActionResult<{ performanceId: string; campaignId: string }>> {
  // 1. Mock 모드 처리
  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 향상된 이벤트 생성 요청:', formData);
    return {
      success: true,
      data: {
        performanceId: 'mock-perf-' + Date.now(),
        campaignId: 'mock-camp-' + Date.now(),
      },
    };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 2. 공연 정보 생성 (performances 테이블)
    const performanceSlug = generateSlug(formData.eventTitle, formData.startsAt);
    const { data: performance, error: perfError } = await supabase
      .from('performances')
      .insert({
        slug: performanceSlug,
        title: formData.eventTitle,
        synopsis: formData.eventDescription || null,
        venue: formData.venueName,
        period_start: formData.performancePeriodStart,
        period_end: formData.performancePeriodEnd,
        poster_url: formData.posterImage || null,
        ticket_link: formData.ticketPurchaseUrl || null,
        status: 'draft',
        is_featured: false,
      })
      .select('id')
      .single();

    if (perfError || !performance) {
      console.error('Performance creation error:', perfError);
      return {
        success: false,
        error: '공연 정보 생성에 실패했습니다.',
      };
    }

    // 3. 이벤트 캠페인 생성 (ticket_campaigns 테이블 - enhanced fields 포함)
    const totalTickets = formData.ticketAllocations.reduce((sum, alloc) => sum + alloc.quantity, 0);
    const campaignSlug = generateSlug(formData.eventTitle, formData.startsAt);
    const { data: campaign, error: campError } = await supabase
      .from('ticket_campaigns')
      .insert({
        slug: campaignSlug,
        performance_id: performance.id,
        title: formData.eventTitle,
        description: formData.eventDescription || null,
        reward: `${totalTickets}매`,
        starts_at: formData.startsAt,
        ends_at: formData.endsAt,
        ticket_purchase_url: formData.ticketPurchaseUrl || null,
        status: 'pending_approval',

        // Enhanced fields
        one_line_intro: formData.oneLineIntro,
        poster_image: formData.posterImage,
        still_images: JSON.stringify(formData.stillImages),
        venue_name: formData.venueName,
        venue_address: formData.venueAddress,
        performance_period_start: formData.performancePeriodStart,
        performance_period_end: formData.performancePeriodEnd,
        sessions_per_week: formData.sessionsPerWeek,
        running_time: formData.runningTime,
        age_rating: formData.ageRating,
        sns_instagram: formData.snsInstagram || null,
        sns_youtube: formData.snsYoutube || null,
        sns_tiktok: formData.snsTiktok || null,
        hashtags: JSON.stringify(formData.hashtags),
        production_team: JSON.stringify(formData.productionTeam),
        ticket_allocations: JSON.stringify(formData.ticketAllocations),
        partner_email: formData.partnerEmail,
        partner_phone: formData.partnerPhone,
      })
      .select('id')
      .single();

    if (campError || !campaign) {
      console.error('Campaign creation error:', campError);
      // 공연 정보도 롤백 (실패 시)
      await supabase.from('performances').delete().eq('id', performance.id);
      return {
        success: false,
        error: '이벤트 생성에 실패했습니다.',
      };
    }

    // 4. 캐시 무효화
    revalidatePath('/event-center');
    revalidatePath('/events');

    return {
      success: true,
      data: {
        performanceId: performance.id,
        campaignId: campaign.id,
      },
    };
  } catch (error) {
    console.error('Unexpected error in createEnhancedEventCampaign:', error);
    return {
      success: false,
      error: '서버 오류가 발생했습니다.',
    };
  }
}

/**
 * 추첨 실행 — ticket_entries에서 랜덤으로 winnerCount명을 선정하고 당첨 이메일을 발송합니다.
 * - 중복 추첨 방지 (이미 선정된 항목이 있으면 에러)
 * - 파트너 본인 캠페인만 가능
 */
export async function runLotteryDraw(
  campaignId: string,
  winnerCount: number,
): Promise<ActionResult<{ winnerCount: number }>> {
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) return { success: false, error: '로그인이 필요합니다.' };

  if (winnerCount < 1 || !Number.isFinite(winnerCount)) {
    return { success: false, error: '당첨 인원을 1명 이상 입력해 주세요.' };
  }

  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 추첨 실행:', campaignId, winnerCount);
    return { success: true, data: { winnerCount } };
  }

  try {
    const drawStart = Date.now();
    const supabase = await createServerSupabaseClient();

    // 권한 확인 및 캠페인 정보 조회 (이메일 발송에 필요한 공연 정보 포함)
    const { data: campaign } = await supabase
      .from('ticket_campaigns')
      .select('partner_email, ends_at, status, title, performance_id, venue_name, available_dates, performance_period_start')
      .eq('id', campaignId)
      .single();

    if (!campaign || campaign.partner_email !== partnerEmail) {
      return { success: false, error: '권한이 없습니다.' };
    }

    // 중복 추첨 방지
    const { count: existingCount } = await supabase
      .from('ticket_entries')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('selection_status', 'selected');

    if (existingCount && existingCount > 0) {
      return {
        success: false,
        error: `이미 ${existingCount}명이 선정되어 있습니다. 재추첨은 지원하지 않습니다.`,
      };
    }

    // 응모자 목록 조회 (미선정 항목만) — 'pending' 이 DB 기본값
    const { data: entries, error: fetchError } = await supabase
      .from('ticket_entries')
      .select('id, applicant_name, applicant_email')
      .eq('campaign_id', campaignId)
      .eq('selection_status', 'pending');

    if (fetchError || !entries || entries.length === 0) {
      return { success: false, error: '응모자가 없습니다.' };
    }

    // Fisher-Yates 셔플 — Math.random() - 0.5 정렬보다 편향 없는 공정 추첨
    const pool = [...entries];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const winners = pool.slice(0, Math.min(winnerCount, pool.length));
    const winnerIds = winners.map((w) => w.id);

    // 당첨자 업데이트
    const { error: updateError } = await supabase
      .from('ticket_entries')
      .update({ selection_status: 'selected', selected_at: new Date().toISOString() })
      .in('id', winnerIds);

    if (updateError) {
      console.error('runLotteryDraw update error:', updateError);
      return { success: false, error: '추첨 중 오류가 발생했습니다.' };
    }

    // lottery_runs 기록 저장
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://artause.co.kr';
    const performanceDate =
      (campaign.available_dates as string[] | null)?.[0] ??
      campaign.performance_period_start ??
      campaign.ends_at ??
      '';
    const venue = (campaign.venue_name as string | null) ?? '장소 미정';
    const myPageUrl = `${siteUrl}/my`;
    const confirmationMethod = `마이페이지(${myPageUrl})에서 당첨 여부를 확인하시고, 공연 당일 현장에서 성함을 말씀해 주시면 티켓을 수령하실 수 있습니다.`;

    // 당첨자 이메일 발송 (실패해도 추첨 결과는 유지)
    const emailResults = await Promise.allSettled(
      winners.map((winner) =>
        sendLotteryWinnerNotification({
          winnerName: winner.applicant_name ?? '당첨자',
          winnerEmail: winner.applicant_email ?? '',
          performanceTitle: campaign.title ?? '공연',
          performanceDate,
          venue,
          confirmationMethod,
          myPageUrl,
          entryId: winner.id,
          campaignId,
        } satisfies LotteryWinnerData)
      )
    );

    const emailFailCount = emailResults.filter((r) => r.status === 'rejected').length;
    if (emailFailCount > 0) {
      console.warn(`[runLotteryDraw] ${emailFailCount}개 이메일 발송 실패 (추첨 결과는 저장됨)`);
    }

    // 추첨 이력 로깅 — campaign_draws 테이블에 저장 (실패해도 추첨 결과는 유지)
    try {
      const durationMs = Date.now() - drawStart;
      const seed = Math.floor(Math.random() * 2 ** 32);
      const nonWinnerIds = new Set(winnerIds);
      const waitlist = pool
        .filter((e) => !nonWinnerIds.has(e.id))
        .map((e) => ({ id: e.id }));

      await supabase.from('campaign_draws').insert({
        campaign_id: campaignId,
        algorithm_version: 'fisher-yates-v1',
        seed,
        winners: winners.map((w) => ({
          id: w.id,
          name: w.applicant_name,
          email: w.applicant_email,
        })),
        waitlist,
        config: {
          requested_count: winnerCount,
          total_entries: entries.length,
          actual_winners: winnerIds.length,
        },
        duration_ms: durationMs,
        executed_by: partnerEmail,
      });
    } catch (logErr) {
      console.error('[runLotteryDraw] 이력 저장 실패 (추첨 결과는 유지):', logErr);
    }

    revalidatePath('/event-center');
    return { success: true, data: { winnerCount: winnerIds.length } };
  } catch (error) {
    console.error('Unexpected error in runLotteryDraw:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

/**
 * 공연 종사자가 승인 대기 중인 이벤트를 수정합니다.
 * pending_approval 상태인 캠페인만 수정 가능합니다.
 */
export async function updateEventCampaign(
  campaignId: string,
  formData: {
    title: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    ticketPurchaseUrl?: string;
    venueName?: string;
    oneLineIntro?: string;
    posterImage?: string;
  },
): Promise<ActionResult> {
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    return { success: false, error: '로그인이 필요합니다.' };
  }

  if (!formData.title?.trim()) {
    return { success: false, error: '이벤트 제목을 입력해 주세요.' };
  }
  if (!formData.startsAt || !formData.endsAt) {
    return { success: false, error: '이벤트 기간을 입력해 주세요.' };
  }

  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 이벤트 수정 요청:', campaignId, formData);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();

    // 1. 권한 확인 및 상태 검증
    const { data: campaign } = await supabase
      .from('ticket_campaigns')
      .select('partner_email, status')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return { success: false, error: '이벤트를 찾을 수 없습니다.' };
    }
    if (campaign.partner_email !== partnerEmail) {
      return { success: false, error: '수정 권한이 없습니다.' };
    }
    if (campaign.status !== 'pending_approval') {
      return { success: false, error: '승인 대기 중인 이벤트만 수정할 수 있습니다.' };
    }

    // 2. 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      starts_at: formData.startsAt,
      ends_at: formData.endsAt,
      ticket_purchase_url: formData.ticketPurchaseUrl?.trim() || null,
      venue_name: formData.venueName?.trim() || null,
      one_line_intro: formData.oneLineIntro?.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (formData.posterImage) {
      updatePayload.poster_image = formData.posterImage;
    }

    const { error } = await supabase
      .from('ticket_campaigns')
      .update(updatePayload)
      .eq('id', campaignId);

    if (error) {
      console.error('updateEventCampaign error:', error);
      return { success: false, error: '수정에 실패했습니다.' };
    }

    revalidatePath('/event-center');
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateEventCampaign:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

/**
 * Slug 생성 헬퍼 함수
 */
function generateSlug(title: string, date: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  const timestamp = date
    ? new Date(date).getTime().toString().slice(-6)
    : Date.now().toString().slice(-6);

  return `${base || 'event'}-${timestamp}`;
}
