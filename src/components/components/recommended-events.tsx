import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, MapPin, Calendar, Heart } from "lucide-react"
import Image from "next/image"

const recommendedEvents = [
  {
    id: 1,
    title: "뮤지컬 레미제라블",
    subtitle: "한국 라이선스 10주년 기념",
    location: "부산 드림씨어터",
    date: "2025.03.15 - 04.07",
    genre: "뮤지컬",
    image: "/musical.jpg",
    matchScore: 95,
    reason: "최근 관람한 공연과 유사",
  },
  {
    id: 2,
    title: "데이비드 호크니 전시",
    subtitle: "Bigger & Closer",
    location: "라이트룸 서울",
    date: "2025.02.01 - 05.31",
    genre: "전시",
    image: "/art-exhibition.png",
    matchScore: 88,
    reason: "회원님이 좋아하는 현대미술",
  },
  {
    id: 3,
    title: "국립발레단 백조의 호수",
    subtitle: "클래식 발레의 대명사",
    location: "예술의전당",
    date: "2025.03.27 - 03.31",
    genre: "무용",
    image: "/ballet.jpg",
    matchScore: 82,
    reason: "고전 공연을 선호하시는 회원님께",
  },
]

export function RecommendedEvents() {
  return (
    <section className="py-12 bg-gradient-to-b from-secondary/20 to-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">회원님을 위한 추천</h2>
            <p className="text-sm text-muted-foreground">취향 분석 기반 맞춤 이벤트</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recommendedEvents.map((event) => (
            <Card
              key={event.id}
              className="group overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-xl"
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                  <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-0 font-bold">
                    {event.genre}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white h-8 w-8 rounded-full"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>

                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {event.matchScore}% 매치
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-lg mb-0.5">{event.title}</h3>
                  <p className="text-sm text-white/90">{event.subtitle}</p>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="text-xs text-primary font-medium bg-primary/5 px-2 py-1 rounded inline-block">
                  {event.reason}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                  </div>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold">
                  초대권 응모하기
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
