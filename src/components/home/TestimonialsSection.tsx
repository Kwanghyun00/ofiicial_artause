import { Quote, Star } from "lucide-react"

const testimonials = [
  {
    name: "정민서",
    role: "제작사 대표",
    content: "관람 포인트 정리가 확실해져서 홍보 메시지가 훨씬 명확해졌습니다.",
    event: "연극 홍보 캠페인",
  },
  {
    name: "한지훈",
    role: "공연 기획자",
    content: "이벤트 운영 덕분에 관객과의 접점이 눈에 띄게 늘어났어요.",
    event: "초대권 이벤트 운영",
  },
  {
    name: "서은정",
    role: "마케팅 담당",
    content: "콘텐츠 제작과 업로드가 빠르게 진행되어 일정 운영이 편해졌습니다.",
    event: "SNS 콘텐츠 제작",
  },
]

export function TestimonialsSection() {
  return (
    <section className="border-t border-border/60 bg-gradient-to-br from-primary/5 to-secondary/40 py-16">
      <div className="space-y-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">협업 파트너의 후기</h2>
        <p className="text-base text-muted-foreground md:text-lg">알터즈와 함께한 제작사의 목소리입니다.</p>
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
