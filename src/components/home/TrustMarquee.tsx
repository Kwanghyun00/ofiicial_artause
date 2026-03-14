type Partner = {
  name: string
  label: string
}

const defaultPartners: Partner[] = [
  { name: "@artause_official", label: "큐레이션 · 이벤트" },
  { name: "@spotlight_performance", label: "공연 홍보 포트폴리오" },
  { name: "공연 제작사", label: "홍보 협업" },
  { name: "지역 극장", label: "운영 파트너" },
  { name: "프로젝트 단체", label: "콘텐츠 협업" },
]

type TrustMarqueeProps = {
  partners?: Partner[]
}

export function TrustMarquee({ partners = defaultPartners }: TrustMarqueeProps) {
  if (!partners.length) return null

  return (
    <section className="border-y border-border/60 bg-background/60 py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          Partner Credits
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {partners.map((partner) => (
            <div key={partner.name} className="text-center text-sm font-semibold text-foreground/80">
              <div className="text-lg">{partner.name}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{partner.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
