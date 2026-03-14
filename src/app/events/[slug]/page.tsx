import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, BadgeCheck, Calendar, Clock, MapPin, MessageSquarePlus, Mic2, Tag, Ticket, Users } from "lucide-react"
import { TicketEntryForm } from "@/components/forms/TicketEntryForm"
import { WinnerCheckSection } from "@/components/events/WinnerCheckSection"
import { Badge } from "@/components/ui/badge"
import { getTicketCampaignBySlug, getPerformanceByKopisId } from "@/lib/supabase/queries"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EventApplyPage({ params }: Props) {
  const { slug } = await params
  const campaign = await getTicketCampaignBySlug(slug)

  if (!campaign) notFound()

  const c = campaign as typeof campaign & {
    title: string
    description?: string | null
    one_line_intro?: string | null
    venue_name?: string | null
    venue_address?: string | null
    performance_period_start?: string | null
    performance_period_end?: string | null
    ends_at?: string | null
    poster_image?: string | null
    reward?: string | null
    age_rating?: string | null
    running_time?: string | null
    allocation?: number | null
    hashtags?: string[] | null
    sessions_per_week?: string | null
    ticket_purchase_url?: string | null
    kopis_id?: string | null
  }

  // KOPIS 공식 데이터 — 배치 동기화된 DB 데이터에서 조회 (실시간 API 호출 없음)
  const kopis = c.kopis_id ? await getPerformanceByKopisId(c.kopis_id) : null

  const deadline = c.ends_at ? calcDeadline(c.ends_at) : null
  // eslint-disable-next-line react-compiler/react-compiler
  const isClosed = c.ends_at ? new Date(c.ends_at).getTime() < Date.now() : false

  // 공연 기간: KOPIS > 캠페인 필드 순으로 우선
  const period = kopis
    ? formatPeriod(kopis.period_start, kopis.period_end)
    : formatPeriod(c.performance_period_start, c.performance_period_end)

  // 공연장: KOPIS > 캠페인 필드 순으로 우선
  const venueName = kopis?.venue ?? c.venue_name ?? null
  const location = [venueName, c.venue_address].filter(Boolean).join(" · ") || null

  // 포스터: 캠페인 > KOPIS 순 (캠페인 직접 설정 포스터가 있으면 우선)
  const posterSrc = c.poster_image ?? kopis?.poster_url ?? null

  const benefits = c.reward ? c.reward.split(/[,，\n]/).map((s: string) => s.trim()).filter(Boolean) : []
  const tags = Array.isArray(c.hashtags) ? (c.hashtags as string[]).slice(0, 4) : []

  // 러닝타임/관람연령: KOPIS > 캠페인 필드
  const runningTime = kopis?.runtime ?? c.running_time ?? null
  const ageRating = kopis?.age_limit ?? c.age_rating ?? null

  // 티켓 구매 링크: 캠페인 > KOPIS relates
  const ticketPurchaseUrl = c.ticket_purchase_url ?? kopis?.ticket_link ?? null

  // 당첨자 발표 여부: 마감 여부로 간이 표시 (TODO: 추후 쿼리로 교체)
  const hasWinnersSelected = isClosed

  return (
    <div className="pb-24 pt-12 text-foreground">
      {/* 모바일 하단 고정 CTA */}
      {!isClosed && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <a
            href="#entry-form"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90"
          >
            ✨ 초대권 응모하기
          </a>
        </div>
      )}
      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            초대 목록으로 돌아가기
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            {/* 왼쪽: 공연 정보 */}
            <section className="spotlight-card space-y-6 p-6 sm:p-8">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag: string) => (
                    <Badge key={tag} className="bg-primary/10 text-primary">
                      {tag}
                    </Badge>
                  ))}
                  {kopis && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      KOPIS 공식 정보
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{c.title}</h1>
                {(c.one_line_intro || c.description) && (
                  <p className="text-sm text-muted-foreground">
                    {c.one_line_intro ?? c.description}
                  </p>
                )}
              </div>

              {posterSrc && (
                <div className="relative aspect-[3/4] max-h-[480px] overflow-hidden rounded-3xl">
                  <Image
                    src={posterSrc}
                    alt={c.title}
                    fill
                    className="object-cover object-top"
                    priority
                    unoptimized={posterSrc.startsWith("http://www.kopis.or.kr")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                </div>
              )}

              <div className="rounded-3xl border border-border bg-background/60 px-6 py-5 text-sm text-muted-foreground">
                <div className="grid gap-3 md:grid-cols-2">
                  {location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      {location}
                    </div>
                  )}
                  {period && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {period}
                    </div>
                  )}
                  {runningTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      러닝타임 {runningTime}
                    </div>
                  )}
                  {ageRating && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {ageRating}
                    </div>
                  )}
                  {c.allocation && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      총 {c.allocation.toLocaleString()}매 초대
                    </div>
                  )}
                  {kopis?.schedule && (
                    <div className="col-span-full flex items-start gap-2">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{kopis.schedule}</span>
                    </div>
                  )}
                </div>
                {deadline && (
                  <p className="mt-4 text-sm font-semibold text-primary">
                    응모 마감 {deadline}
                  </p>
                )}
              </div>

              {/* KOPIS 출연진/제작진 */}
              {kopis && (kopis.cast || kopis.crew || kopis.organization) && (
                <div className="rounded-3xl border border-border bg-background/40 px-6 py-5 space-y-3">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Mic2 className="h-4 w-4 text-primary" />
                    공연 정보
                  </h3>
                  <dl className="space-y-2 text-sm text-muted-foreground">
                    {kopis.cast && (
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-medium text-foreground w-14">출연</dt>
                        <dd>{kopis.cast}</dd>
                      </div>
                    )}
                    {kopis.crew && (
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-medium text-foreground w-14">제작</dt>
                        <dd>{kopis.crew}</dd>
                      </div>
                    )}
                    {kopis.organization && (
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-medium text-foreground w-14">기획</dt>
                        <dd>{kopis.organization}</dd>
                      </div>
                    )}
                    {kopis.price && (
                      <div className="flex gap-2">
                        <dt className="shrink-0 font-medium text-foreground w-14">티켓</dt>
                        <dd>{kopis.price}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {benefits.length > 0 && (
                <div className="rounded-3xl border border-border bg-background/40 px-6 py-5">
                  <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                    <Ticket className="h-4 w-4 text-primary" />
                    초대 혜택
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {benefits.map((benefit: string) => (
                      <li key={benefit}>· {benefit}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {ticketPurchaseUrl && (
                  <Link
                    href={ticketPurchaseUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center justify-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                  >
                    티켓 예매 링크
                  </Link>
                )}
                {c.kopis_id && (
                  <Link
                    href={`http://www.kopis.or.kr/por/db/pblprfr/pblprfrView.do?menuId=MNU_00010&mt20id=${c.kopis_id}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <BadgeCheck className="h-4 w-4" />
                    KOPIS에서 확인
                  </Link>
                )}
              </div>
            </section>

            {/* 오른쪽: 응모 폼 + 당첨 확인 */}
            <div className="space-y-6">
              {!isClosed ? (
                <section id="entry-form" className="spotlight-card p-6 sm:p-8">
                  <TicketEntryForm
                    campaignId={c.id}
                    slug={slug}
                    campaignTitle={c.title}
                    availableDates={Array.isArray(c.available_dates) ? c.available_dates as string[] : null}
                  />
                </section>
              ) : (
                <section className="spotlight-card flex items-center justify-center p-8 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-rose-500">응모 마감</p>
                    <p className="text-base text-slate-600">이 이벤트의 응모 기간이 종료되었습니다.</p>
                  </div>
                </section>
              )}

              {/* 당첨 확인 섹션 */}
              <WinnerCheckSection
                campaignId={c.id}
                performanceId={c.performance_id ?? null}
                hasWinnersSelected={hasWinnersSelected}
              />

              {/* 후기 CTA — 이벤트 마감 후 노출 */}
              {isClosed && (
                <section className="rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
                  <div className="flex items-start gap-3">
                    <MessageSquarePlus className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                    <div className="space-y-2">
                      <p className="font-semibold text-indigo-900">공연을 관람하셨나요?</p>
                      <p className="text-sm text-indigo-700">
                        솔직한 후기를 남겨주시면 다른 관객에게 큰 도움이 됩니다.
                      </p>
                      <Link
                        href={c.performance_id ? `/reviews?performance=${c.performance_id}` : "/reviews"}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                      >
                        후기 남기기 →
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function calcDeadline(endsAt: string): string {
  const now = Date.now()
  const end = new Date(endsAt).getTime()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  if (diff < 0) return "마감됨"
  if (diff === 0) return "오늘 마감"
  return `D-${diff}`
}

function formatPeriod(start?: string | null, end?: string | null): string | null {
  if (!start && !end) return null
  const fmt = (v: string) =>
    new Date(v).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
  if (start && end) return `${fmt(start)} ~ ${fmt(end)}`
  if (start) return `${fmt(start)} ~`
  if (end) return `~ ${fmt(end!)}`
  return null
}
