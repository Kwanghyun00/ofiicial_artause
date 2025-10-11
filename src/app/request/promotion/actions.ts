'use server';

import { promotionRequestSchema } from '@/lib/models/promotion-request';
import { submitPromotionRequest } from '@/lib/supabase/queries';

export type PromotionRequestState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

export async function submitPromotionRequestAction(
  _prevState: PromotionRequestState,
  formData: FormData,
): Promise<PromotionRequestState> {
  const raw = {
    organizationName: formData.get('organizationName'),
    contactName: formData.get('contactName'),
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone'),
    performanceTitle: formData.get('performanceTitle'),
    performanceCategory: formData.get('performanceCategory') || null,
    performanceRegion: formData.get('performanceRegion') || null,
    performanceDates: formData.get('performanceDates') || null,
    performanceVenue: formData.get('performanceVenue') || null,
    performanceSynopsis: formData.get('performanceSynopsis') || null,
    marketingGoals: formData.get('marketingGoals') || null,
    marketingChannels: formData.getAll('marketingChannels').map(String),
    assetsUrl: formData.get('assetsUrl') || null,
    additionalNotes: formData.get('additionalNotes') || null,
  };

  const parsed = promotionRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0]?.message ?? '입력 값을 다시 확인해 주세요.';
    return { status: 'error', message: issue };
  }

  try {
    await submitPromotionRequest(parsed.data);
    return {
      status: 'success',
      message: '상담 요청이 접수되었습니다. 담당자가 24시간 이내에 연락드릴게요!',
    };
  } catch (error) {
    console.error('submitPromotionRequestAction error', error);
    return { status: 'error', message: '요청 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
  }
}
