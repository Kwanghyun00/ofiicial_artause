import Link from "next/link"
import { CalendarDays, MapPin, Ticket } from "lucide-react"
import type { Campaign } from "./types"

type Props = {
  campaigns: Campaign[]
}

export function InvitationGallery({ campaigns }: Props) {
  if (!campaigns.length) return null

  return (
    <section className="space-y-6 border-t border-border/60 pt-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="cue">Archive</span>
          <h2 className="text-2xl font-semibold text-foreground">이벤트 아카이브</h2>
          <p className="text-sm text-muted-foreground">알터즈가 운영한 이벤트를 한눈에 확인하세요.</p>
        </div>
        <Link href="/works" className="text-sm font-semibold text-primary hover:text-primary/80">
          전체 보기 →
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="spotlight-card flex flex-col p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-foreground/80">
                {campaign.reward ?? "이벤트"}
              </span>
              {campaign.ends_at && (
                <span className="font-semibold text-primary">마감 {formatShortDate(campaign.ends_at)}</span>
              )}
            </div>
            <h3 className="mt-3 line-clamp-1 text-lg font-semibold text-foreground">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.description ?? "관객 참여를 확장하기 위한 이벤트입니다."}
            </p>

            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {campaign.ends_at ? `모집 마감 ${formatShortDate(campaign.ends_at)}` : "상시 진행"}
              </p>
              <p className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                참여 인원 {(campaign.entry_count ?? 0).toLocaleString()}명
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                온라인 이벤트
              </p>
            </div>

            <Link
              href="/contact"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10"
            >
              이벤트 문의
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
