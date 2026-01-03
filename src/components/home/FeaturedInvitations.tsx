import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import type { Campaign } from "./types"

type Props = {
  campaigns: Campaign[]
}

export function FeaturedInvitations({ campaigns }: Props) {
  if (!campaigns.length) return null

  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">이번 주 추천</span>
        <h2 className="text-3xl font-bold text-foreground">지금 바로 신청 가능한 초대</h2>
        <p className="text-base text-muted-foreground">신청이 몰리는 인기 프로그램을 놓치지 마세요.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="group relative overflow-hidden rounded-[28px] border border-border bg-card shadow hover:-translate-y-1 hover:shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary/15 via-transparent to-secondary/30" />
            <div className="relative flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <span className="rounded-full bg-white/80 px-3 py-1">모집 중</span>
                  {campaign.reward && <span className="text-primary/80">{campaign.reward}</span>}
                </div>
                <h3 className="text-2xl font-bold text-foreground">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {campaign.description ?? "파트너와 함께하는 특별 초대 프로그램입니다."}
                </p>
              </div>

              <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>온라인 신청 · 현장 수령</span>
                </p>
                {campaign.ends_at && (
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>마감 {formatDate(campaign.ends_at)}</span>
                  </p>
                )}
                <p className="flex items-center gap-2 text-primary">
                  <Users className="h-4 w-4" />
                  <span>{(campaign.entry_count ?? 0).toLocaleString()}명 신청 중</span>
                </p>
              </div>

              <Link
                href="/events"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                초대 신청하기
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
  })
}
