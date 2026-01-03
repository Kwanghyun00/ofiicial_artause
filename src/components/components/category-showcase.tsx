import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const categories = [
  {
    title: "프리미엄 공연 라인업",
    description: "현재 예매율이 높은 뮤지컬, 연극, 콘서트까지 초청권으로 만나보세요.",
    image: "/musical.jpg",
    tags: ["뮤지컬", "연극", "콘서트"],
    tone: "from-[#EFE6FF] to-[#F9F4FF]",
  },
  {
    title: "몰입형 전시&아트페어",
    description: "아티스트 프리뷰, 큐레이터 투어 등 특별 프로그램을 함께 제공합니다.",
    image: "/art-exhibition.png",
    tags: ["전시", "페어", "프리뷰"],
    tone: "from-[#FFEDE4] to-[#FFF7EF]",
  },
  {
    title: "클래식 & 라이프스타일",
    description: "오케스트라 정기 연주, 컬처 클래스, 브랜드 컬래버레이션을 초대합니다.",
    image: "/orchestra.jpg",
    tags: ["클래식", "살롱", "라이프"],
    tone: "from-[#E9F6F2] to-[#F4FFFC]",
  },
]

export function CategoryShowcase() {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4 md:px-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Programs</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">초청 카테고리를 골라 받아보세요</h2>
            <p className="text-muted-foreground text-base md:text-lg">
              원하는 장르만 선택하면 매주 큐레이션 리포트와 함께 알림을 보내드려요.
            </p>
          </div>
          <Button variant="outline" className="self-start rounded-full border-primary/40 px-6">
            카테고리 설정
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.title}
              className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${category.tone} shadow-lg`}
            >
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap gap-2 text-xs">
                  {category.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full border border-white/60 bg-white/80 text-foreground">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{category.description}</p>
                <Button variant="link" className="p-0 text-primary/80">
                  큐레이션 보기 →
                </Button>
              </div>
              <div className="relative h-56">
                <Image src={category.image || "/placeholder.svg"} alt={category.title} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
