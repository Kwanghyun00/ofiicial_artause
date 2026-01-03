import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, Bell, Zap } from "lucide-react"

const stats = [
  { label: "이번 주 초대", value: "12개 프로그램", caption: "뮤지컬 4 · 전시 5 · 클래식 3" },
  { label: "멤버 만족도", value: "4.9 / 5.0", caption: "2024 Member Survey" },
  { label: "즉시 초대 비율", value: "82%", caption: "추첨 당일 안내" },
]

const timeline = [
  { title: "취향 등록", description: "장르 · 시간대 · 동반인 등 나만의 조건 저장" },
  { title: "초대 신청", description: "주간 캘린더에서 원하는 프로그램 선택" },
  { title: "디지털 티켓", description: "평균 3시간 내 모바일 티켓 전송" },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(139,123,168,0.08),_transparent_55%)]" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div className="space-y-8">
            <Badge className="border-primary/30 bg-primary/10 text-primary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Members Only Invitations
            </Badge>

            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                원하는 순간에 도착하는
                <br />
                <span className="text-primary">프리미엄 문화 초대</span>
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
                뮤지컬, 전시, 클래식 공연까지. 보고 싶었던 프로그램을 아트하우스 멤버 전용 초청으로 경험하세요. 회원
                설정 기반으로 꼭 맞는 알림만 선별해드립니다.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5">
                이번 주 초대 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-2 border-border px-8 text-base font-semibold hover:border-primary hover:bg-primary/5"
              >
                맞춤 큐레이션 받기
                <Bell className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/80 bg-white/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[32px] border border-white/40 bg-white/80 p-6 shadow-2xl backdrop-blur">
              <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-white p-6 text-foreground shadow-inner">
                <div className="mb-5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 px-3 py-1 text-primary">
                    <Zap className="h-3.5 w-3.5" />
                    라이브 초대
                  </span>
                  <span className="text-primary">D-3</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-primary/80">뮤지컬</p>
                  <h3 className="text-2xl font-bold leading-tight">데스노트 : 더 뮤지컬</h3>
                  <p className="text-sm text-muted-foreground">부산시민회관 대극장 · 3월 15일 (토) 19:30</p>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/80 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Seats</p>
                    <p className="text-xl font-bold text-primary">R석 20매</p>
                  </div>
                  <Button size="sm" className="rounded-full px-4">
                    즉시 신청
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Member Journey</p>
                <div className="mt-4 space-y-4">
                  {timeline.map((item, idx) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-sm font-semibold text-primary">
                        0{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 rounded-3xl border border-border bg-background/80 p-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">Live applicants</p>
                  <p className="text-3xl font-bold text-primary">1,942명</p>
                  <p className="text-xs text-muted-foreground">지난주 대비 +12%</p>
                </div>
                <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                  <p className="font-semibold">Curator Tip</p>
                  <p>평일 낮 타임을 선택하면 당첨률이 1.8배 높아져요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
