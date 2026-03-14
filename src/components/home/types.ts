export type Show = {
  id: string
  slug: string
  title: string
  region?: string | null
  tags?: string[] | null
  period_start?: string | null
  period_end?: string | null
  poster_url?: string | null
}

export type Campaign = {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  one_line_intro?: string | null
  poster_image?: string | null
  reward?: string | null
  ends_at?: string | null
  starts_at?: string | null
  entry_count?: number | null
}

export type Organization = {
  id: string
  name: string
  region?: string | null
}
