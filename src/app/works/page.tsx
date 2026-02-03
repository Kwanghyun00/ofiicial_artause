import Image from "next/image"
import Link from "next/link"
import { Reveal } from "@/components/motion/Reveal"
import { portfolioItems } from "@/constants/company"

const categories = ["공연 홍보 제작", "초대권 이벤트 운영", "사회적 프로젝트"]

export default function WorksPage() {
  return (
    <div className="bg-gradient-to-b from-[#F6F4EE] via-[#FBF8F2] to-white pb-24 pt-12 text-foreground">
      <Reveal>
        <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Portfolio</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">포트폴리오</h1>
          <p className="text-base text-muted-foreground">
            알터즈가 제작/운영한 결과물과 성과를 카테고리별로 정리했습니다.
          </p>
        </section>
      </Reveal>

      <section className="mx-auto mt-12 max-w-6xl space-y-12 px-4 sm:px-6 lg:px-8">
        {categories.map((category, categoryIndex) => {
          const items = portfolioItems.filter((item) => item.category === category)
          if (!items.length) return null

          return (
            <Reveal key={category} delay={categoryIndex * 0.05}>
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">{category}</h2>
                    <p className="text-sm text-muted-foreground">알터즈의 역할과 성과를 확인해 보세요.</p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <article
                      key={item.title}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative w-full overflow-hidden rounded-b-none">
                        <div className="relative w-full aspect-[4/5]">
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">
                            {item.category}
                          </span>
                          <span className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">
                            {item.role}
                          </span>
                          {item.genre && (
                            <span className="rounded-full bg-[#f2efe7] px-3 py-1 text-foreground/80">
                              {item.genre}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 space-y-2">
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{item.highlight}</p>
                        </div>
                        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                          {item.period && <p>기간: {item.period}</p>}
                          {item.venue && <p>장소: {item.venue}</p>}
                          {item.format && <p>콘텐츠: {item.format}</p>}
                        </div>
                        {item.keywords?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.keywords.map((keyword) => (
                              <span key={keyword} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-4">
                          <Link
                            href={item.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-black/20 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
                          >
                            결과물 보기 (Instagram)
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </Reveal>
          )
        })}
      </section>
    </div>
  )
}
