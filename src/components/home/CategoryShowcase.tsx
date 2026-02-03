import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { posterFallbacks } from "@/constants/posters"

const categories = [
  {
    title: "공연을 더 잘 보이게",
    description: "카드뉴스/쇼츠/관람 포인트 중심의 홍보 제작으로 공연의 매력을 빠르게 전달합니다.",
    image: posterFallbacks[0],
    tags: ["카드뉴스", "쇼츠", "관람 포인트"],
    tone: "from-[#EFE6FF] to-[#F9F4FF]",
  },
  {
    title: "관객과 더 가깝게",
    description: "초대권 이벤트와 참여형 콘텐츠로 관객과의 접점을 확장합니다.",
    image: posterFallbacks[1],
    tags: ["초대권 이벤트", "참여형 콘텐츠", "커뮤니티"],
    tone: "from-[#FFEDE4] to-[#FFF7EF]",
  },
  {
    title: "운영을 더 효율적으로",
    description: "관객 관리와 전환 추적을 위한 웹서비스를 준비 중입니다.",
    image: posterFallbacks[2],
    tags: ["웹서비스", "관객 관리", "전환 추적"],
    tone: "from-[#E9F6F2] to-[#F4FFFC]",
  },
]

export function CategoryShowcase() {
  return (
    <section className="space-y-6 border-t border-border/60 py-16">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">핵심 가치</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">알터즈가 전하는 3가지 약속</h2>
          <p className="text-base text-muted-foreground md:text-lg">
            공연 홍보부터 관객 커뮤니티, 디지털 전환까지 하나의 흐름으로 연결합니다.
          </p>
        </div>
        <Button variant="outline" className="self-start rounded-full border-primary/40 px-6">
          서비스 소개
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <article key={category.title} className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${category.tone} shadow-lg`}>
            <div className="space-y-4 p-6">
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
                더 알아보기 →
              </Button>
            </div>
            <div className="relative h-56">
              <Image src={category.image} alt={category.title} fill className="object-cover" />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
