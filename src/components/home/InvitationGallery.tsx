import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import type { Campaign } from "./types"

type Props = {
  campaigns: Campaign[]
}

export function InvitationGallery({ campaigns }: Props) {
  if (!campaigns.length) return null

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">진행 중인 초대 이벤트</h2>
          <p className="text-sm text-muted-foreground">모집 마감 전에 원하는 공연·전시 초대권을 신청하세요.</p>
        </div>
        <Link href="/events" className="text-sm font-semibold text-primary hover:text-primary/80">
          전체 보기 →
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="flex flex-col rounded-3xl border border-border bg-card p-4 shadow">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-3 py-1 text-foreground/80">{campaign.reward ?? "초대권"}</span>
              {campaign.ends_at && <span className="font-bold text-primary">마감 {formatShortDate(campaign.ends_at)}</span>}
            </div>
            <h3 className="mt-3 line-clamp-1 text-lg font-bold text-foreground">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description ?? "파트너와 함께하는 초청 프로그램"}
            </p>

            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {campaign.ends_at ? `모집 마감 ${formatShortDate(campaign.ends_at)}` : "상시 모집"}
              </p>
              <p className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                {(campaign.entry_count ?? 0).toLocaleString()}명 신청
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                온라인 신청
              </p>
            </div>

            <Link
              href="/events"
              className="mt-4 inline-flex items-center justify-center rounded-xl border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              신청하기
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
