import { works } from "@/constants/company"

export default function WorksPage() {
  return (
    <div className="bg-[#f6f4ee] pb-20 pt-10 text-foreground">
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">포트폴리오</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">작업</h1>
        <p className="text-base text-muted-foreground">알터즈가 홍보 기획으로 참여한 작품을 정리했습니다.</p>
      </section>

      <section className="mx-auto mt-10 max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        {works.map((work) => (
          <article
            key={work.title}
            className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 md:grid-cols-[120px,1fr]"
          >
            <div className="flex h-24 items-center justify-center rounded-xl bg-[#efece4] text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Works
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {work.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#f2efe7] px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{work.title}</h2>
                <p className="text-sm text-muted-foreground">{work.description}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
