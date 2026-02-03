import Link from "next/link"
import { companyMeta, contactCards } from "@/constants/company"

export default function ContactPage() {
  return (
    <div className="bg-[#f6f4ee] pb-20 pt-10 text-foreground">
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Contact</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">문의/신청</h1>
        <p className="text-base text-muted-foreground">목적에 맞는 문의 채널을 선택해 주세요.</p>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {contactCards.map((card) => (
            <article key={card.title} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-lg font-semibold">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              <Link
                href={card.href}
                className={`mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold transition ${
                  card.variant === "primary"
                    ? "bg-black text-[#f6f4ee]"
                    : "border border-black/20 text-foreground hover:border-black/60"
                }`}
              >
                {card.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <h2 className="text-lg font-semibold">SNS 허브</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-black/10 bg-white p-5">
            <h3 className="text-base font-semibold">@artause_official</h3>
            <p className="mt-2 text-sm text-muted-foreground">큐레이션/이벤트/채널 활동을 확인할 수 있습니다.</p>
            <Link
              href={companyMeta.instagramMain}
              className="mt-4 inline-flex rounded-full border border-black/20 px-4 py-2 text-sm font-semibold text-foreground hover:border-black/60"
            >
              인스타그램 보기
            </Link>
          </article>
          <article className="rounded-2xl border border-black/10 bg-white p-5">
            <h3 className="text-base font-semibold">@spotlight_performance</h3>
            <p className="mt-2 text-sm text-muted-foreground">제작사형 홍보/콘텐츠 제작 포트폴리오입니다.</p>
            <Link
              href={companyMeta.instagramSpotlight}
              className="mt-4 inline-flex rounded-full border border-black/20 px-4 py-2 text-sm font-semibold text-foreground hover:border-black/60"
            >
              인스타그램 보기
            </Link>
          </article>
        </div>
      </section>
    </div>
  )
}
