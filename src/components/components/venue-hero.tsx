import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Heart } from "lucide-react"

export function VenueHero() {
  return (
    <section className="relative">
      <div className="relative h-[60vh] min-h-[400px] w-full">
        <Image src="/art-exhibition.png" alt="국립현대미술관" fill className="object-cover brightness-75" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative -mt-32">
        <div className="max-w-4xl">
          <div className="bg-background/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-border">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20">미술관</Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">4.8</span>
                    <span className="text-muted-foreground">(1,247)</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-tight">국립현대미술관</h1>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm md:text-base">서울특별시 종로구 삼청로 30</p>
                </div>
              </div>
              <Button variant="outline" size="icon" className="flex-shrink-0 bg-transparent">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              한국 현대미술의 흐름을 한눈에 볼 수 있는 국내 최대 규모의 현대미술관입니다. 연간 50여 개의 전시와 다양한
              교육 프로그램을 운영하고 있습니다.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-primary hover:bg-primary/90 rounded-full">진행 중인 이벤트 보기</Button>
              <Button variant="outline" className="rounded-full bg-transparent">
                공유하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
