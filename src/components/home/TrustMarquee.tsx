type Partner = {
  name: string
  label: string
}

const defaultPartners: Partner[] = [
  { name: "국립극장", label: "공연예술" },
  { name: "국립현대미술관", label: "전시·미술" },
  { name: "롯데콘서트홀", label: "라이브 음악" },
  { name: "CJ ENM", label: "뮤지컬 파트너" },
  { name: "서울문화재단", label: "문화 네트워크" },
]

type TrustMarqueeProps = {
  partners?: Partner[]
}

export function TrustMarquee({ partners = defaultPartners }: TrustMarqueeProps) {
  if (!partners.length) return null

  return (
    <section className="border-b border-border bg-card/80 py-10">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">파트너 & 미디어</p>
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
