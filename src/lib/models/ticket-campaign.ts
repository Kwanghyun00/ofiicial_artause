import { z } from 'zod';

export const ticketCampaignSchema = z.object({
  id: z.string().uuid().optional(),
  performanceId: z.string().uuid(),
  title: z.string().min(2, '이벤트명을 입력해 주세요.'),
  description: z.string().nullable().optional(),
  reward: z.string().nullable().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  formLink: z.string().url().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type TicketCampaignPayload = z.infer<typeof ticketCampaignSchema>;
