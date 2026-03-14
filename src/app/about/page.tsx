import Link from "next/link"
import { ArrowRight, Heart, Target, Users, Zap } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "공연 중심 사고",
    description: "모든 결정의 중심에는 공연과 예술가가 있습니다. 작품의 본질을 이해하고, 그 가치를 관객에게 제대로 전달하는 것이 우리의 첫 번째 원칙입니다.",
    emoji: "🎭",
  },
  {
    icon: Users,
    title: "관객과의 진심",
    description: "관객은 단순한 소비자가 아닌, 공연을 완성하는 동료 예술가입니다. 진심 어린 소통과 참여로 함께 성장하는 커뮤니티를 만듭니다.",
    emoji: "✨",
  },
  {
    icon: Zap,
    title: "빠른 실행력",
    description: "스타트업의 속도로 움직입니다. 완벽을 추구하되 빠르게 시작하고, 피드백을 받아 계속 개선해나갑니다.",
    emoji: "⚡",
  },
  {
    icon: Target,
    title: "데이터 기반 운영",
    description: "감이 아닌 데이터로 말합니다. 모든 캠페인의 성과를 측정하고, 인사이트를 다음 프로젝트에 반영합니다.",
    emoji: "📊",
  },
]

const achievements = [
  { label: "누적 프로젝트", value: "50+", unit: "건", emoji: "🎪" },
  { label: "협력 공연단체", value: "30+", unit: "팀", emoji: "🤝" },
  { label: "누적 관객", value: "10K+", unit: "명", emoji: "👥" },
  { label: "평균 만족도", value: "4.8", unit: "/5.0", emoji: "⭐" },
]

const culture = [
  {
    title: "현장을 최우선으로",
    description: "사무실보다 공연장에서 더 많은 시간을 보냅니다. 직접 보고, 느끼고, 경험해야 제대로 전달할 수 있다고 믿습니다.",
    icon: "🎬",
  },
  {
    title: "투명한 소통",
    description: "모든 의사결정 과정을 공유하고, 피드백을 환영합니다. 좋은 아이디어는 누구에게서든 나올 수 있습니다.",
    icon: "💬",
  },
  {
    title: "지속 가능한 성장",
    description: "단기 성과보다 장기적 관계를 중요하게 생각합니다. 함께 성장하는 파트너가 되고자 합니다.",
    icon: "🌱",
  },
]

const team = [
  {
    name: "김광현",
    role: "Founder & CEO",
    description: "공연을 사랑하는 개발자이자 기획자. 기술과 예술의 접점에서 새로운 가능성을 찾습니다.",
    emoji: "🚀",
    tags: ["기획", "개발", "운영"],
  },
  // 팀원이 더 있다면 여기에 추가하세요
]

export default function AboutPage() {
  return (
    <div className="space-y-20 pb-24 pt-12 md:space-y-24 lg:space-y-32">
      {/* Hero Section - 비전 선언 */}
      <section className="relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[800px] w-[1000px] -translate-x-1/2 rounded-[100%] bg-gradient-radial from-primary/15 via-primary/5 to-transparent blur-3xl" />
          <div className="absolute right-0 bottom-0 h-[600px] w-[600px] rounded-full bg-gradient-radial from-accent/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            <div className="inline-block">
              <span className="cue">About Us 🎭</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              좋은 공연이
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                더 많은 관객과 만나도록
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
              알터즈는 공연 홍보와 관객 모집을 혁신하는 스타트업입니다.
              <br className="hidden sm:block" />
              초대권 이벤트와 디지털 마케팅으로 공연과 관객을 연결합니다.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/contact"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                함께 시작하기
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/works"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 text-lg font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                포트폴리오 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - 시작 스토리 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="cue">Our Story 📖</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              왜 시작했나요?
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                좋은 공연을 만드는 것만큼, 그 공연을 알리는 것도 어렵습니다. 예산은 부족하고, 홍보 채널은 한정적이며, 관객을 모으는 건 더욱 막막합니다.
              </p>
              <p>
                저희는 이 문제를 기술과 마케팅으로 해결하고 싶었습니다. <span className="font-bold text-foreground">초대권 이벤트</span>라는 친근한 방식으로 관객의 문턱을 낮추고, <span className="font-bold text-foreground">데이터 기반 운영</span>으로 성과를 극대화합니다.
              </p>
              <p className="font-bold text-primary">
                알터즈는 공연과 관객 사이의 다리가 되어, 더 많은 박수가 울려퍼지는 세상을 만들어갑니다.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="spotlight-card space-y-6 p-8 sm:p-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🎯</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">미션</h3>
                    <p className="text-sm text-muted-foreground">우리의 존재 이유</p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-foreground">
                  모든 예술가가 박수를 받고, 모든 관객이 감동을 경험하는 세상을 만듭니다.
                </p>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🚀</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">비전</h3>
                    <p className="text-sm text-muted-foreground">우리가 가는 곳</p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-foreground">
                  공연 마케팅의 표준이 되어, 대한민국 공연 생태계를 더 건강하게 만듭니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - 핵심 가치 */}
      <section className="relative border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4 text-center">
            <div className="inline-block">
              <span className="cue">Our Values 💎</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              우리가 믿는 것들
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              이 가치들이 모든 의사결정의 기준이 됩니다.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {values.map((value, index) => (
              <article
                key={value.title}
                className="spotlight-card group relative overflow-hidden p-6 sm:p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative flex items-start gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 transition-all group-hover:scale-110">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="text-4xl transition-transform group-hover:scale-110 group-hover:rotate-12">
                    {value.emoji}
                  </span>
                </div>

                <div className="relative mt-6 space-y-3">
                  <h3 className="text-xl font-bold text-foreground sm:text-2xl">
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section - 수치로 보는 성과 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <div className="inline-block">
            <span className="cue">Achievements 🏆</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            숫자로 보는 알터즈
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            지금까지의 여정을 데이터로 보여드립니다.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {achievements.map((item, index) => (
            <div
              key={item.label}
              className="spotlight-card group relative overflow-hidden p-6 text-center sm:p-8"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 text-5xl transition-transform group-hover:scale-125">
                {item.emoji}
              </div>
              <div className="mb-2 text-4xl font-bold text-primary sm:text-5xl">
                {item.value}
                <span className="text-2xl text-muted-foreground">{item.unit}</span>
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section - 팀 소개 */}
      <section className="relative border-t border-border/40 bg-gradient-to-b from-background to-muted/20 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 space-y-4 text-center">
            <div className="inline-block">
              <span className="cue">Our Team 👥</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
              함께하는 사람들
            </h2>
            <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
              공연과 기술, 그리고 사람을 사랑하는 팀입니다.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {team.map((member, index) => (
              <article
                key={member.name}
                className="spotlight-card group relative overflow-hidden p-8"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 text-4xl transition-all group-hover:scale-110">
                      {member.emoji}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{member.name}</h3>
                      <p className="text-sm font-semibold text-primary">{member.role}</p>
                    </div>
                  </div>
                </div>

                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {member.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {member.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section - 일하는 방식 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 space-y-4 text-center">
          <div className="inline-block">
            <span className="cue">Our Culture 🌟</span>
          </div>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            이렇게 일해요
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            알터즈만의 일하는 방식과 문화를 소개합니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {culture.map((item, index) => (
            <article
              key={item.title}
              className="stage-panel group p-8 text-center transition-all hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6 text-6xl transition-transform group-hover:scale-125 group-hover:rotate-12">
                {item.icon}
              </div>
              <h3 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
                {item.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border/40 bg-gradient-to-b from-muted/20 to-background py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-primary/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-block">
            <span className="cue">Join Us 🚀</span>
          </div>
          <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
            함께 성장할 준비가 되셨나요?
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            알터즈와 함께 공연 홍보의 새로운 기준을 만들어가세요.
            <br className="hidden sm:block" />
            파트너십, 프로젝트 문의, 팀 합류 모두 환영합니다.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              프로젝트 문의하기
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/works"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 text-lg font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              포트폴리오 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
