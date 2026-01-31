import Link from "next/link"
import { shows } from "@/constants/company"

export default function ShowsPage() {
  return (
    <div className="bg-[#f6f4ee] pb-20 pt-10 text-foreground">
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">공연 리스트</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">진행/준비 중</h1>
        <p className="text-base text-muted-foreground">알터즈가 홍보 기획으로 참여한 작품을 확인하세요.</p>
      </section>

      <section className="mx-auto mt-10 max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        {shows.map((show) => (
          <article
            key={show.title}
            className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-[120px,1fr]"
          >
            <div className="flex h-24 items-center justify-center rounded-xl bg-[#efece4] text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Poster
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {show.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f2efe7] px-3 py-1">
                    {tag}
                  </span>
                ))}
                <span className="rounded-full bg-black/5 px-3 py-1 text-foreground">{show.status}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{show.title}</h2>
                <p className="text-sm text-muted-foreground">{show.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={show.ctaHref}
                  className="rounded-full bg-black px-4 py-2 font-semibold text-[#f6f4ee] transition hover:opacity-90"
                >
                  {show.ctaLabel}
                </Link>
                <a
                  href={show.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-black/20 px-4 py-2 font-semibold transition hover:border-black/60"
                >
                  인스타 보기
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
