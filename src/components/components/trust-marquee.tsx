const partners = [
  { name: "국립극장", label: "National Theater" },
  { name: "MMCA", label: "국립현대미술관" },
  { name: "롯데콘서트홀", label: "Lotte Concert Hall" },
  { name: "SJ Kunsthalle", label: "SJ 큐브" },
  { name: "CJ ENM", label: "뮤지컬 파트너" },
  { name: "서울문화재단", label: "Seoul Foundation" },
]

export function TrustMarquee() {
  return (
    <section className="border-b border-border bg-card/60 py-10">
      <div className="container mx-auto px-4 md:px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
          Partners & Press
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-muted-foreground">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex flex-col items-center gap-1 text-center text-sm font-semibold text-foreground/80"
            >
              <span className="text-lg font-semibold tracking-tight">{partner.name}</span>
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{partner.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
