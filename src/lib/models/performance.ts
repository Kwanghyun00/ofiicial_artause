import { z } from 'zod';

export const performanceStatus = ['draft', 'scheduled', 'ongoing', 'completed'] as const;
export type PerformanceStatus = (typeof performanceStatus)[number];

export const performanceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2, '슬러그는 2자 이상이어야 합니다.')
    .regex(/^[a-z0-9-]+$/, '슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.'),
  title: z.string().min(2, '공연명을 입력해 주세요.'),
  status: z.enum(performanceStatus).default('draft'),
  category: z.string().min(1).nullable().optional(),
  region: z.string().min(1).nullable().optional(),
  organization: z.string().min(1).nullable().optional(),
  periodStart: z.string().nullable().optional(),
  periodEnd: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  synopsis: z.string().nullable().optional(),
  tasks: z.array(z.string().min(1)).nullable().optional(),
  posterUrl: z.string().url().nullable().optional(),
  heroHeadline: z.string().nullable().optional(),
  heroSubtitle: z.string().nullable().optional(),
  ticketLink: z.string().url().nullable().optional(),
  isFeatured: z.boolean().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type PerformancePayload = z.infer<typeof performanceSchema>;
