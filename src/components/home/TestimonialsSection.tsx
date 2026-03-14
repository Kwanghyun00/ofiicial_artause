import Link from "next/link"
import { Quote, Star, BadgeCheck } from "lucide-react"
import type { ReviewRow } from "@/lib/supabase/review-types"

// 하드코딩 샘플 — DB 후기가 없을 때 폴백
const fallbackTestimonials = [
  {
    name: "뮤지컬덕후",
    tag: "뮤지컬 관람",
    content: "알터즈 초대권으로 처음 뮤지컬을 봤는데, 생각보다 훨씬 감동적이었어요. 덕분에 공연에 입문했습니다.",
    show: "뮤지컬 초대권 이벤트",
    rating: 5,
    verified: false,
  },
  {
    name: "연극매니아",
    tag: "연극 관람",
    content: "당첨 결과를 이메일로 빠르게 받았고, 좌석 안내도 친절했어요. 다음 이벤트도 꼭 응모할 거예요.",
    show: "대학로 연극 초대권",
    rating: 5,
    verified: false,
  },
]

type DisplayReview = {
  name: string
  tag: string
  content: string
  show: string
  rating: number
  verified: boolean
}

function fromReviewRow(r: ReviewRow): DisplayReview {
  return {
    name: r.author_name,
    tag: r.verified_attendance ? "인증 관람" : "관람",
    content: r.review_text ?? r.review_headline ?? "",
    show: r.review_headline ?? "",
    rating: r.rating_overall,
    verified: r.verified_attendance,
  }
}

type Props = {
  reviews?: ReviewRow[]
}

export function TestimonialsSection({ reviews }: Props) {
  // DB 후기가 있고 내용이 있는 것만 사용, 없으면 폴백
  const dbReviews = (reviews ?? [])
    .filter((r) => r.review_text || r.review_headline)
    .slice(0, 3)

  const testimonials: DisplayReview[] =
    dbReviews.length >= 2
      ? dbReviews.map(fromReviewRow)
      : fallbackTestimonials

  return (
    <section className="border-t border-border/60 py-16">
      <div className="space-y-4 text-center">
        <span className="cue">후기</span>
        <h2 className="text-3xl font-semibold text-foreground md:text-4xl">초대권으로 공연을 만난 관객들</h2>
        <p className="text-base text-muted-foreground md:text-lg">
          실제 응모 후 공연을 관람한 관객들의 이야기입니다.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, idx) => (
          <article key={idx} className="spotlight-card relative flex h-full flex-col justify-between p-8">
            <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/20" />
            <div>
              <div className="mb-4 flex gap-1 text-primary">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground">{testimonial.content}</p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-sm">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                {testimonial.verified && (
                  <BadgeCheck className="h-4 w-4 text-emerald-500" aria-label="인증 관람" />
                )}
              </div>
              <p className="text-muted-foreground">{testimonial.tag}</p>
              {testimonial.show && (
                <p className="mt-2 text-xs font-semibold text-primary">{testimonial.show}</p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/reviews"
          className="inline-flex items-center rounded-full border border-primary/40 px-6 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
        >
          관람 후기 더 보기
        </Link>
      </div>
    </section>
  )
}
