// Review system types
// Maintained separately from types.ts (which is UTF-16 LE encoded)

export interface ReviewRow {
  id: string
  performance_id: string
  author_name: string
  author_email: string
  reservation_id: string | null
  verified_attendance: boolean
  rating_overall: number
  rating_acting: number | null
  rating_direction: number | null
  rating_immersion: number | null
  tags: string[] | null
  review_headline: string | null
  review_text: string | null
  spoiler_flag: boolean
  helpful_count: number
  report_count: number
  status: string
  created_at: string
  updated_at: string
}

export interface ReviewInsert {
  performance_id: string
  author_name: string
  author_email: string
  reservation_id?: string | null
  verified_attendance?: boolean
  rating_overall: number
  rating_acting?: number | null
  rating_direction?: number | null
  rating_immersion?: number | null
  tags?: string[] | null
  review_headline?: string | null
  review_text?: string | null
  spoiler_flag?: boolean
  status?: string
}

export interface ReviewSummary {
  avgRating: number
  totalCount: number
  verifiedCount: number
  tagFrequency: Record<string, number>
}

export type Review = ReviewRow
