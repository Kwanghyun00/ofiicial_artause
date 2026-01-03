import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Sparkles, Filter } from "lucide-react"

const highlights = [
  { label: "이번 주 신규", value: "18건" },
  { label: "마감 임박", value: "6건" },
  { label: "평균 당첨률", value: "23%" },
]

const quickFilters = ["오늘 마감", "프리뷰 오픈", "프리미엄 좌석", "주말 낮 타임", "전시/페어"]

export function EventsHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/10 to-secondary/20 py-16 md:py-24">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Sparkles className="mr-1 h-4 w-4" />
            매주 월·목 업데이트
          </Badge>
          <h1 className="text-4xl font-bold text-foreground md:text-5xl">
            지금 바로 신청 가능한 <span className="text-primary">프리미엄 초대</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            장르, 도시, 동반인 수까지 설정하고 보고 싶은 프로그램을 찾아보세요. 실시간으로 업데이트되는 초대 수량과
            당첨률 정보를 함께 제공해요.
          </p>

          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="공연명, 장소, 아티스트 검색"
                className="h-14 rounded-full border-2 border-border bg-background pl-12 text-base focus:border-primary"
              />
            </div>
            <Button
              size="lg"
              className="h-14 rounded-full bg-primary px-8 text-base font-semibold shadow-primary/30 hover:bg-primary/90"
            >
              검색
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                className="rounded-full border border-border/80 px-4 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {filter}
              </button>
            ))}
            <button className="inline-flex items-center gap-2 rounded-full border border-border/80 px-4 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary">
              <Filter className="h-4 w-4" />
              고급 필터
            </button>
          </div>

          <div className="grid gap-4 pt-8 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/60 bg-white/80 p-4 text-center shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
