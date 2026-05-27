import Link from "next/link"
import { Star } from "lucide-react"
import type { ReviewRow } from "@/lib/supabase/review-types"

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
  {
    name: "공연러버",
    tag: "무용 관람",
    content: "SNS에서 알터즈를 팔로우했는데, 소개해준 공연이 너무 좋았어요. 이런 큐레이션 서비스가 필요했어요.",
    show: "컨템포러리 댄스 공연",
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

type Props = { reviews?: ReviewRow[] }

export function TestimonialsSection({ reviews }: Props) {
  const dbReviews = (reviews ?? [])
    .filter((r) => r.review_text || r.review_headline)
    .slice(0, 3)

  const testimonials: DisplayReview[] =
    dbReviews.length >= 2 ? dbReviews.map(fromReviewRow) : fallbackTestimonials

  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              — 04 · 관람 후기
            </p>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              공연을 경험한 관객들
            </h2>
          </div>
          <Link
            href="/reviews"
            className="shrink-0 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            후기 더보기 →
          </Link>
        </div>

        {/* 후기 카드 */}
        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((t, idx) => (
            <article
              key={idx}
              className="flex flex-col justify-between border border-border bg-background p-5 sm:p-6"
            >
              {/* 별점 */}
              <div>
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>

                {/* 후기 내용 */}
                <p className="font-serif text-[15px] leading-relaxed text-foreground">
                  "{t.content}"
                </p>
              </div>

              {/* 작성자 */}
              <div className="mt-5 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.tag}</p>
                  </div>
                  {t.verified && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                      인증 ✓
                    </span>
                  )}
                </div>
                {t.show && (
                  <p className="mt-1.5 text-[11px] font-semibold text-primary/70 line-clamp-1">
                    {t.show}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
