'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createEventCampaignSchema, type CreateEventCampaignPayload } from '@/lib/models/ticket-campaign';
import { isSupabaseConfigured } from '@/lib/config';
import { getPartnerSession } from '@/lib/auth/partner-session';

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
 */
export async function rejectEventCampaign(campaignId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    console.info('[Mock Mode] 이벤트 거부:', campaignId);
    return { success: true };
  }

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from('ticket_campaigns')
      .update({ status: 'rejected' })
      .eq('id', campaignId);

    if (error) {
      console.error('Campaign rejection error:', error);
      return { success: false, error: '거부 처리에 실패했습니다.' };
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
 * 패널티 부여 (노쇼, 취소 등)
 * - Edge Function (penalty-apply)을 호출하여 패널티 부여
 * - 신뢰도 점수 차감 및 응모 제한 처리
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

  try {
    // Supabase URL 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Supabase 설정이 필요합니다.' };
    }

    // Edge Function 호출
    const response = await fetch(`${supabaseUrl}/functions/v1/penalty-apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        entry_id: data.entryId,
        penalty_type: data.penaltyType,
        points: data.points,
        reason: data.reason,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || '패널티 부여에 실패했습니다.',
      };
    }

    const result = await response.json();

    // 페이지 재검증
    revalidatePath('/event-center');

    return {
      success: true,
      data: {
        penaltyId: result.penalty_id,
        newTrustScore: result.new_trust_score,
        isRestricted: result.is_restricted,
      },
    };
  } catch (error) {
    console.error('패널티 부여 오류:', error);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
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
