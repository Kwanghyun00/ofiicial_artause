import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar } from 'lucide-react'
import Image from "next/image"

const performances = [
  {
    id: 1,
    title: "뮤지컬 <헤드윅>",
    location: "샤롯데씨어터",
    date: "2024.03.22 - 2024.06.23",
    genre: "뮤지컬",
    rating: "9.8",
    image: "/hedwig.jpg"
  },
  {
    id: 2,
    title: "연극 <아트>",
    location: "링크아트센터",
    date: "2024.02.13 - 2024.05.12",
    genre: "연극",
    rating: "9.6",
    image: "/abstract-fluid-art.png"
  },
  {
    id: 3,
    title: "마리 로랑생 전",
    location: "예술의전당 한가람미술관",
    date: "2024.01.20 - 2024.04.15",
    genre: "전시",
    rating: "9.2",
    image: "/marie.jpg"
  },
  {
    id: 4,
    title: "서울시향 2024 정기공연",
    location: "롯데콘서트홀",
    date: "2024.04.05 - 2024.04.06",
    genre: "클래식",
    rating: "9.9",
    image: "/orchestra.jpg"
  },
  {
    id: 5,
    title: "태양의서커스 <루치아>",
    location: "잠실종합운동장 내 빅탑",
    date: "2023.10.25 - 2024.03.24",
    genre: "퍼포먼스",
    rating: "9.7",
    image: "/circus.jpg"
  },
  {
    id: 6,
    title: "뮤지컬 <노트르담 드 파리>",
    location: "세종문화회관 대극장",
    date: "2024.01.24 - 2024.03.24",
    genre: "뮤지컬",
    rating: "9.5",
    image: "/notre.jpg"
  }
]

export function PerformanceSection() {
  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
          <h2 className="text-3xl font-bold text-foreground">공연 · 전시 정보</h2>
          
          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto no-scrollbar">
            {["이번 주", "이번 달", "서울", "수도권", "기타 지역"].map((filter, i) => (
              <button 
                key={filter}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  i === 0 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-card text-foreground border border-border hover:bg-background"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {performances.map((item) => (
            <div key={item.id} className="flex bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border h-40">
              <div className="w-28 relative shrink-0">
                <Image 
                  src={item.image || "/placeholder.svg"} 
                  alt={item.title} 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-1.5 py-0 h-5">
                      {item.genre}
                    </Badge>
                    <div className="flex items-center text-amber-500 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current mr-0.5" />
                      {item.rating}
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground line-clamp-1 mb-1">{item.title}</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs border-border text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                    자세히 보기
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-10 text-center">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 px-8 rounded-full">
            더 많은 공연 보기
          </Button>
        </div>
      </div>
    </section>
  )
}
