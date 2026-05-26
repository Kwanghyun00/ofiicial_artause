export function LogoBar() {
  return (
    <section className="border-y border-border/30 bg-muted/30 py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          함께할 공연단체를 찾고 있습니다
        </p>
        <p className="text-sm text-muted-foreground">
          현재 초기 파트너 공연단체를 모집 중입니다.{" "}
          <a
            href="#cta"
            className="font-semibold text-primary hover:underline"
          >
            지금 신청하면 무료로 시작할 수 있어요 →
          </a>
        </p>
      </div>
    </section>
  )
}
