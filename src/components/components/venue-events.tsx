import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users, ArrowRight } from "lucide-react"

const events = [
  {
    id: 1,
    title: "현대미술 특별전: 빛과 그림자의 대화",
    period: "2025.02.01 - 04.30",
    applicants: "1,247 / 2,000",
    category: "전시",
    image: "/art-exhibition.png",
  },
  {
    id: 2,
    title: "청년 작가 초대전",
    period: "2025.03.15 - 05.31",
    applicants: "543 / 1,500",
    category: "전시",
    image: "/musical.jpg",
  },
  {
    id: 3,
    title: "큐레이터와 함께하는 작품 해설",
    period: "2025.02.20 (토) 14:00",
    applicants: "89 / 100",
    category: "프로그램",
    image: "/art-exhibition.png",
  },
]

export function VenueEvents() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">진행 중인 이벤트</h2>
              <p className="text-muted-foreground">이 공연장에서 열리는 특별한 기회들</p>
            </div>
            <Button variant="ghost" className="hidden md:flex items-center gap-2">
              전체보기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.id}/apply`}>
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background">
                      {event.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.period}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{event.applicants} 응모</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-transparent" variant="outline">
                      응모하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <Button variant="ghost" className="md:hidden w-full mt-6 flex items-center gap-2">
            전체보기
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
