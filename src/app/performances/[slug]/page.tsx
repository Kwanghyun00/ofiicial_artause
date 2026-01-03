import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPerformanceBySlug } from "@/lib/supabase/queries"

type Props = {
  params: Promise<{ slug: string }>
}

const FALLBACK_DESCRIPTION =
  "아르타우스 큐레이터가 직접 선별한 프로그램으로, 캐스트 라인업부터 조명과 공간 연출까지 높은 완성도를 자랑합니다."

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)

  if (!isPerformance(performance)) {
    return { title: "공연을 찾을 수 없습니다" }
  }

  return {
    title: `${performance.title} · 공연 소개`,
    description: performance.description ?? "아르타우스가 선별한 공연 정보를 확인하세요.",
  }
}

export default async function PerformanceDetailPage({ params }: Props) {
  const { slug } = await params
  const performance = await getPerformanceBySlug(slug)

  if (!isPerformance(performance)) {
    notFound()
  }

  const galleryImages = performance.gallery_images ?? []
  const tags = performance.tags ?? []
  const description = performance.description ?? FALLBACK_DESCRIPTION

  const infoRows = [
    { label: "공연 기간", value: formatPeriod(performance.period_start ?? null, performance.period_end ?? null) },
    { label: "관람 시간", value: performance.running_time ?? "문의" },
    { label: "주최", value: performance.organization ?? performance.organization_id ?? "미정" },
  ]

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/performances" className="transition hover:text-primary">
          공연·전시
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">{performance.title}</span>
      </nav>

      <section className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-8">
          <div className="rounded-[32px] border border-border bg-card p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                  #{tag}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">{performance.title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">{performance.region ?? performance.venue ?? "장소 미정"}</p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{description}</p>
          </div>

          {galleryImages.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {galleryImages.map((src) => (
                <div key={src} className="overflow-hidden rounded-2xl border border-border">
                  <Image src={src} alt={`${performance.title} 스틸컷`} width={640} height={420} className="h-48 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <section className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-foreground">캐스트 & 제작진</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {(performance.cast ?? []).map((name) => (
                <li key={name}>{name}</li>
              ))}
              {(!performance.cast || performance.cast.length === 0) && <li>추후 공개 예정</li>}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">관람 안내</h3>
            <dl className="mt-4 space-y-3 text-sm text-muted-foreground">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4">
                  <dt className="text-foreground/80">{row.label}</dt>
                  <dd className="text-right text-foreground font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              href="/events"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              초대 이벤트 확인하기
            </Link>
          </div>

          <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-sm text-green-900">
            <p className="font-semibold">관람 팁</p>
            <p className="mt-2">
              공연 시작 20분 전 도착하면 포토존과 굿즈 부스를 여유롭게 즐길 수 있고, 좌석 배정도 더욱 안정적으로 진행됩니다.
            </p>
          </div>
        </div>
      </section>
    </article>
  )
}

function formatPeriod(start?: string | null, end?: string | null) {
  if (!start && !end) return "상시 진행"
  const startText = start ? formatDate(start) : "미정"
  const endText = end ? formatDate(end) : "미정"
  if (startText === endText) return startText
  return `${startText} ~ ${endText}`
}

function formatDate(value?: string | null) {
  if (!value) return "미정"
  return new Date(value).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  })
}

type PerformanceRecord = Awaited<ReturnType<typeof getPerformanceBySlug>>

function isPerformance(record: PerformanceRecord): record is Exclude<PerformanceRecord, null> & { title: string } {
  return Boolean(record && typeof record === "object" && "title" in record)
}
