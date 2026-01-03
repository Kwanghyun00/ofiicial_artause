import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "김민아",
    role: "직장인",
    content: "매주 공연 초대에 신청하고 있어요. 벌써 세 번 당첨돼서 친구와 멋진 시간을 보냈습니다.",
    event: "뮤지컬 <드림라이크> 관람",
  },
  {
    name: "이주원",
    role: "대학생",
    content: "문화생활 비용이 걱정이었는데 아트하우스 덕분에 다양한 전시와 공연을 경험하고 있어요.",
    event: "몰입형 전시 관람",
  },
  {
    name: "박서윤",
    role: "프리랜서",
    content: "알림 덕분에 마감 임박 초대를 놓치지 않아요. 프리뷰 행사 참여도 정말 특별했어요.",
    event: "프리뷰 토크 참석",
  },
]

export function TestimonialsSection() {
  return (
    <section className="rounded-[32px] bg-gradient-to-br from-primary/5 to-secondary/40 p-8 md:p-12">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">멤버들이 들려주는 경험</h2>
        <p className="text-base text-muted-foreground md:text-lg">아트하우스와 함께 문화생활을 확장한 멤버들의 생생한 후기입니다.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name} className="relative flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-8 shadow hover:-translate-y-1 hover:shadow-xl">
            <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/10" />
            <div>
              <div className="mb-4 flex gap-1 text-primary">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground">{testimonial.content}</p>
            </div>
            <div className="mt-6 border-t border-border pt-4 text-sm">
              <p className="font-bold text-foreground">{testimonial.name}</p>
              <p className="text-muted-foreground">{testimonial.role}</p>
              <p className="mt-2 text-xs font-semibold text-primary">{testimonial.event}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
