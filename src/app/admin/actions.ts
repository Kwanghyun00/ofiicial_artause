'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/config';
import { sendCampaignApprovalNotification } from '@/lib/email/templates/campaign-approved';
import { sendCampaignRejectionNotification } from '@/lib/email/templates/campaign-rejected';

type ActionResult = { success: boolean; error?: string };

function getSupabaseClient() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : createServerSupabaseClient();
}

async function resolvePartnerEmail(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  campaign: { partner_email: string | null; partner_name: string | null; performance_id: string }
): Promise<{ email: string | null; name: string | null }> {
  if (campaign.partner_email) {
    return { email: campaign.partner_email, name: campaign.partner_name };
  }

  // Fallback: look up partner email via organizations linked to the performance
  try {
    const { data: performance } = await supabase
      .from('performances')
      .select('organization_id')
      .eq('id', campaign.performance_id)
      .maybeSingle();

    if (performance?.organization_id) {
      // Check users table for a partner with matching organization context
      const { data: orgUser } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'partner')
        .eq('is_restricted', false)
        .maybeSingle();

      if (orgUser?.email) {
        return { email: orgUser.email, name: campaign.partner_name };
      }

      // Fallback to organizations table contact info if available
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', performance.organization_id)
        .maybeSingle();

      if (org) {
        return { email: null, name: org.name };
      }
    }
  } catch (err) {
    console.warn('[Admin] resolvePartnerEmail fallback error', err);
  }

  return { email: null, name: campaign.partner_name };
}

export async function approveCampaign(campaignId: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    console.info('[Mock] approveCampaign:', campaignId);
    return { success: true };
  }

  try {
    const supabase = await getSupabaseClient();
    const approvedAt = new Date().toISOString();

    const { data: campaign, error: fetchError } = await supabase
      .from('ticket_campaigns')
      .select('id, title, partner_name, partner_email, slug, performance_id, starts_at')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      console.error('[Admin] approveCampaign fetch error', fetchError);
      return { success: false, error: '캠페인을 찾을 수 없습니다.' };
    }

    const { error: updateError } = await supabase
      .from('ticket_campaigns')
      .update({ status: 'approved', approved_at: approvedAt })
      .eq('id', campaignId);

    if (updateError) {
      console.error('[Admin] approveCampaign update error', updateError);
      return { success: false, error: '승인 처리에 실패했습니다.' };
    }

    // Non-blocking email notification — failure must not affect approval result
    try {
      const { email: partnerEmail, name: partnerName } = await resolvePartnerEmail(supabase, {
        partner_email: campaign.partner_email,
        partner_name: campaign.partner_name,
        performance_id: campaign.performance_id,
      });

      if (partnerEmail) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://artause.co.kr';
        const campaignUrl = `${baseUrl}/event-center`;

        const startsAtFormatted = campaign.starts_at
          ? new Date(campaign.starts_at).toLocaleString('ko-KR', {
              timeZone: 'Asia/Seoul',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null;

        await sendCampaignApprovalNotification({
          partnerName: partnerName ?? '파트너',
          campaignName: campaign.title,
          approvedAt: new Date(approvedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          campaignUrl,
          partnerEmail,
          startsAt: startsAtFormatted,
        });
      }
    } catch (emailErr) {
      console.error('[Admin] approveCampaign email notification failed (non-blocking)', emailErr);
    }

    revalidatePath('/admin');
    revalidatePath('/event-center');
    return { success: true };
  } catch (err) {
    console.error('[Admin] approveCampaign exception', err);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}

export async function rejectCampaign(campaignId: string, rejectionReason?: string): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    console.info('[Mock] rejectCampaign:', campaignId);
    return { success: true };
  }

  try {
    const supabase = await getSupabaseClient();

    const { data: campaign, error: fetchError } = await supabase
      .from('ticket_campaigns')
      .select('id, title, partner_name, partner_email, performance_id')
      .eq('id', campaignId)
      .single();

    if (fetchError || !campaign) {
      console.error('[Admin] rejectCampaign fetch error', fetchError);
      return { success: false, error: '캠페인을 찾을 수 없습니다.' };
    }

    const { error } = await supabase
      .from('ticket_campaigns')
      .update({ status: 'rejected' })
      .eq('id', campaignId);

    if (error) {
      console.error('[Admin] rejectCampaign error', error);
      return { success: false, error: '거부 처리에 실패했습니다.' };
    }

    // Non-blocking email notification — failure must not affect rejection result
    try {
      const { email: partnerEmail, name: partnerName } = await resolvePartnerEmail(supabase, {
        partner_email: campaign.partner_email,
        partner_name: campaign.partner_name,
        performance_id: campaign.performance_id,
      });

      if (partnerEmail) {
        const rejectedAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        await sendCampaignRejectionNotification({
          partnerName: partnerName ?? '파트너',
          campaignName: campaign.title,
          rejectedAt,
          rejectionReason: rejectionReason ?? null,
          partnerEmail,
        });
      }
    } catch (emailErr) {
      console.error('[Admin] rejectCampaign email notification failed (non-blocking)', emailErr);
    }

    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    console.error('[Admin] rejectCampaign exception', err);
    return { success: false, error: '서버 오류가 발생했습니다.' };
  }
}
