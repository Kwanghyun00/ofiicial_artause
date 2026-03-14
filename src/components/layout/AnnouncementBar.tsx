import Link from "next/link"

export function AnnouncementBar() {
  return (
    <div className="border-b border-primary/20 bg-primary/10 text-sm text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">★</span>
          <div>
            <p className="font-semibold leading-tight">
              2025 S/S 초청 프로그램이 공개되었습니다.
              <span className="ml-2 text-xs font-normal text-muted-foreground">신규 구성 18건 · 6개 도시</span>
            </p>
            <p className="text-xs text-muted-foreground">멤버십 회원은 사전 신청 기간에 우선 초대받을 수 있어요.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow">만족도 4.9 / 5.0</span>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
          >
            브리핑 확인 →
          </Link>
        </div>
      </div>
    </div>
  )
}
