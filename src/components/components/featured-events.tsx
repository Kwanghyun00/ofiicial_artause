import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import Image from "next/image"

const featuredEvents = [
  {
    id: 1,
    title: "뮤지컬 <레미제라블>",
    subtitle: "전 세계를 울린 위대한 감동",
    location: "부산 드림씨어터",
    date: "2024.03.15 - 04.07",
    time: "화-금 19:30 / 토-일 14:00, 18:30",
    genre: "뮤지컬",
    participants: "1,247명 응모",
    image: "/musical.jpg",
    featured: true
  },
  {
    id: 2,
    title: "데이비드 호크니 전시",
    subtitle: "Bigger & Closer",
    location: "라이트룸 서울",
    date: "2024.02.01 - 05.31",
    time: "매일 10:00 - 20:00",
    genre: "전시",
    participants: "892명 응모",
    image: "/art-exhibition.png",
    featured: true
  }
]

export function FeaturedEvents() {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            이번 주 인기
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            지금 가장 핫한 초대권
          </h2>
          <p className="text-muted-foreground text-lg">
            많은 분들이 응모하고 있는 인기 이벤트를 놓치지 마세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {featuredEvents.map((event) => (
            <div 
              key={event.id} 
              className="group relative bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border hover:border-primary/30"
            >
              <div className="relative h-80 overflow-hidden">
                <Image 
                  src={event.image || "/placeholder.svg"} 
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-0">
                    {event.genre}
                  </Badge>
                  <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
                    마감 임박
                  </Badge>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-1 text-balance">{event.title}</h3>
                  <p className="text-white/90 mb-4">{event.subtitle}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">{event.participants}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    당첨 확률 <span className="font-bold text-foreground">8.2%</span>
                  </div>
                </div>
                
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  지금 응모하기
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
