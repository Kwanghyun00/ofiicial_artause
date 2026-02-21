const PARTNERS = [
  "극단 A",
  "B 뮤지컬",
  "C 프로덕션",
  "D 무용단",
  "E 엔터테인먼트",
  "F 아트센터",
]

export function LogoBar() {
  return (
    <section className="border-y border-border/30 bg-muted/30 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          함께하고 있는 공연단체
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
          {PARTNERS.map((name) => (
            <span
              key={name}
              className="whitespace-nowrap text-base font-bold text-muted-foreground/40 transition-colors hover:text-muted-foreground/70 sm:text-lg"
            >
              {/* TODO: 실제 로고 이미지로 교체 */}
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
