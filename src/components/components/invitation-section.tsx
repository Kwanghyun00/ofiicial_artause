import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import Image from "next/image"

const events = [
  {
    id: 1,
    title: "뮤지컬 <레미제라블> 부산 공연",
    genre: "뮤지컬",
    location: "부산 드림씨어터",
    date: "2024.03.15 - 2024.04.07",
    desc: "전 세계를 울린 위대한 감동, 한국 라이선스 10주년 기념 공연",
    benefit: "R석 초대권 10매",
    deadline: "D-3",
    image: "/musical.jpg",
    color: "bg-artause-magenta"
  },
  {
    id: 2,
    title: "데이비드 호크니 : Bigger & Closer",
    genre: "전시",
    location: "라이트룸 서울",
    date: "2024.02.01 - 2024.05.31",
    desc: "몰입형 미디어 아트로 만나는 거장의 작품 세계",
    benefit: "입장권 20매",
    deadline: "D-5",
    image: "/art-exhibition.png",
    color: "bg-artause-navy"
  },
  {
    id: 3,
    title: "연극 <행복을 찾아서>",
    genre: "연극",
    location: "대학로 TOM 2관",
    date: "2024.03.01 - 2024.04.28",
    desc: "평범한 일상 속에서 발견하는 진정한 행복의 의미",
    benefit: "S석 초대권 5쌍 (1인 2매)",
    deadline: "D-1",
    image: "/grand-theater.png",
    color: "bg-artause-violet"
  },
  {
    id: 4,
    title: "국립발레단 <백조의 호수>",
    genre: "무용",
    location: "예술의전당 오페라극장",
    date: "2024.03.27 - 2024.03.31",
    desc: "클래식 발레의 대명사, 우아하고 환상적인 무대",
    benefit: "A석 초대권 4매",
    deadline: "오늘 마감",
    image: "/ballet.jpg",
    color: "bg-artause-pastel-blue"
  }
]

export function InvitationSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">진행 중인 초대권 이벤트</h2>
            <p className="text-muted-foreground">놓치면 후회할 인기 공연·전시 초대 기회를 잡아보세요.</p>
          </div>
          <Button variant="link" className="text-primary font-semibold p-0 h-auto hover:no-underline hover:opacity-80">
            전체보기 &rarr;
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="group overflow-hidden border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card">
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute top-3 left-3 z-10 ${event.deadline === "오늘 마감" ? "bg-red-500" : "bg-artause-navy"} text-white text-xs font-bold px-2 py-1 rounded-md shadow-md`}>
                  {event.deadline}
                </div>
                <Image 
                  src={event.image || "/placeholder.svg"} 
                  alt={event.title} 
                  width={600} 
                  height={400} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-medium opacity-90 mb-1 flex items-center gap-1">
                    <span className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px]">{event.genre}</span>
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                  {event.desc}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="w-4 h-4 text-primary/60" />
                    <span className="text-xs">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Ticket className="w-4 h-4 text-primary" />
                    <span className="text-xs text-primary">{event.benefit}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-0">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors rounded-lg font-bold">
                  응모하기
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
