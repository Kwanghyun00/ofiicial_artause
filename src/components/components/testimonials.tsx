import { Card } from "@/components/ui/card"
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: "김민지",
    role: "직장인",
    content: "매주 새로운 공연 초대권에 응모하고 있어요. 벌써 3번이나 당첨되어서 정말 좋은 공연들을 무료로 볼 수 있었어요!",
    rating: 5,
    event: "뮤지컬 <헤드윅> 관람"
  },
  {
    name: "이준호",
    role: "대학생",
    content: "학생이라 문화생활 비용이 부담스러웠는데, Artause 덕분에 다양한 전시와 공연을 경험할 수 있게 됐어요.",
    rating: 5,
    event: "데이비드 호크니 전시 관람"
  },
  {
    name: "박서연",
    role: "프리랜서",
    content: "알림 서비스가 정말 편해요. 관심 있는 장르의 새 이벤트가 올라오면 바로 알려줘서 놓치지 않고 응모할 수 있어요.",
    rating: 5,
    event: "연극 <아트> 관람"
  }
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            이미 많은 분들이 경험하고 있어요
          </h2>
          <p className="text-muted-foreground text-lg">
            Artause와 함께 특별한 문화생활을 즐기는 회원들의 이야기
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 bg-card border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 w-12 h-12 text-primary/10" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 relative z-10">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="border-t border-border pt-4">
                <div className="font-bold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                <div className="text-xs text-primary mt-2 font-medium">{testimonial.event}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
