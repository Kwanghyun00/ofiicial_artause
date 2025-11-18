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

// 공연 종사자가 이벤트를 생성할 때 사용하는 스키마
export const createEventCampaignSchema = z.object({
  // 공연 정보
  performanceTitle: z.string().min(2, '공연 제목을 입력해 주세요.'),
  performanceDescription: z.string().optional(),
  ticketPurchaseUrl: z.string().url('올바른 URL을 입력해 주세요.').optional().or(z.literal('')),

  // 이벤트 정보
  eventTitle: z.string().min(2, '이벤트 제목을 입력해 주세요.'),
  eventDescription: z.string().optional(),
  ticketCount: z.number().min(1, '최소 1매 이상 제공해야 합니다.'),
  startsAt: z.string().min(1, '이벤트 시작일을 선택해 주세요.'),
  endsAt: z.string().min(1, '이벤트 종료일을 선택해 주세요.'),
  showDate: z.string().min(1, '공연 날짜를 선택해 주세요.'),

  // 공연 종사자 정보
  partnerName: z.string().min(2, '담당자 이름을 입력해 주세요.'),
  partnerEmail: z.string().email('올바른 이메일을 입력해 주세요.'),
  partnerPhone: z.string().min(10, '연락처를 입력해 주세요.'),

  // 홍보 채널
  promoChannel: z.string().url('올바른 URL을 입력해 주세요.').optional().or(z.literal('')),
});

export type CreateEventCampaignPayload = z.infer<typeof createEventCampaignSchema>;

// 이벤트 승인 상태
export type CampaignStatus = 'pending_approval' | 'approved' | 'rejected' | 'closed';

// 선정 상태
export type SelectionStatus = 'pending' | 'selected' | 'rejected';

// 관람 상태
export type AttendanceStatus = 'pending' | 'checked_in' | 'no_show';
