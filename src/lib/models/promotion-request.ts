import { z } from 'zod';

export const promotionRequestStatus = ['new', 'in_review', 'approved', 'rejected', 'completed'] as const;
export type PromotionRequestStatus = (typeof promotionRequestStatus)[number];

export const promotionRequestSchema = z.object({
  id: z.string().uuid().optional(),
  status: z.enum(promotionRequestStatus).default('new'),
  organizationName: z.string().min(2, '단체명을 입력해 주세요.'),
  contactName: z.string().min(2, '담당자 이름을 입력해 주세요.'),
  contactEmail: z.string().email('올바른 이메일 주소를 입력해 주세요.'),
  contactPhone: z.string().min(7, '연락처를 입력해 주세요.'),
  performanceTitle: z.string().min(2, '공연명을 입력해 주세요.'),
  performanceCategory: z.string().nullable().optional(),
  performanceRegion: z.string().nullable().optional(),
  performanceDates: z.string().nullable().optional(),
  performanceVenue: z.string().nullable().optional(),
  performanceSynopsis: z.string().nullable().optional(),
  marketingGoals: z.string().nullable().optional(),
  marketingChannels: z.array(z.string()).default([]),
  assetsUrl: z.string().url().nullable().optional(),
  additionalNotes: z.string().nullable().optional(),
  submittedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PromotionRequestPayload = z.infer<typeof promotionRequestSchema>;
