"use client"

import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Users } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

type Campaign = {
  id: string
  slug?: string | null
  title: string
  description?: string | null
  starts_at?: string | null
  ends_at?: string | null
  reward?: string | null
  entry_count?: number | null
  poster_image?: string | null
  performances?: {
    region?: string | null
    title?: string | null
  } | null
}

type Props = {
  campaigns: Campaign[]
}

export function EventsGrid({ campaigns }: Props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const now = useMemo(() => Date.now(), [])

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground">전체 초대 프로그램</h3>
        <p className="mt-1 text-sm text-muted-foreground">현재 {campaigns.length}개의 초대가 진행 중입니다.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => {
          const isClosed = campaign.ends_at ? new Date(campaign.ends_at).getTime() < now : false
          const href = campaign.slug ? `/events/${campaign.slug}` : `/events/${campaign.id}`
          return (
            <article
              key={campaign.id}
              className={`spotlight-card group h-full ${isClosed ? "opacity-60 grayscale" : ""}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,210,140,0.12),_transparent_60%)]" />
              {campaign.poster_image && (
                <div className="relative h-44 w-full overflow-hidden rounded-t-2xl">
                  <Image
                    src={campaign.poster_image}
                    alt={campaign.title}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    unoptimized={campaign.poster_image.startsWith("http://www.kopis.or.kr")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                  {isClosed ? (
                    <span className="absolute right-3 top-3 rounded-full bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      마감
                    </span>
                  ) : (
                    <span className="absolute right-3 top-3">
                      <UrgencyBadge endsAt={campaign.ends_at} now={now} />
                    </span>
                  )}
                </div>
              )}
              <div className="relative p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-foreground/80">
                    {campaign.reward ?? "체험형 초대"}
                  </span>
                  {!campaign.poster_image && (
                    isClosed ? (
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500">
                        마감
                      </span>
                    ) : (
                      <UrgencyBadge endsAt={campaign.ends_at} now={now} />
                    )
                  )}
                </div>
                <h3 className="mt-3 text-xl font-bold text-foreground">{campaign.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {campaign.description ?? "특별 관람권과 오리지널 굿즈까지 함께 제공되는 초대 프로그램입니다."}
                </p>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {campaign.performances?.region ?? "전국 신청"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {campaign.ends_at ? `신청 마감 ${formatDate(campaign.ends_at)}` : "상시 진행"}
                  </p>
                  <p className="flex items-center gap-2 text-primary">
                    <Users className="h-4 w-4" />
                    {(campaign.entry_count ?? 0).toLocaleString()}명 신청 중
                  </p>
                </div>

                <div className="mt-5">
                  <Link
                    href={href}
                    onClick={() => trackEvent("event_card_click", { id: campaign.id, title: campaign.title })}
                    className="block w-full rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    상세 보기
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function UrgencyBadge({ endsAt, now }: { endsAt?: string | null; now: number }) {
  if (!endsAt) return null
  const end = new Date(endsAt).getTime()
  if (end <= now) return null

  const diffMs = end - now
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours <= 72) {
    return (
      <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
        🔥 마감임박
      </span>
    )
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return (
    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
      D-{diffDays}
    </span>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}
