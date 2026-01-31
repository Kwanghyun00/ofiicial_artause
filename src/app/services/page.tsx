import { services } from "@/constants/company"

export default function ServicesPage() {
  return (
    <div className="bg-[#f6f4ee] pb-20 pt-10 text-foreground">
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">해결 방식</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">서비스</h1>
        <p className="text-base text-muted-foreground">공연 단체의 문제를 해결하는 방식으로 서비스를 설계합니다.</p>
      </section>

      <section className="mx-auto mt-10 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="rounded-2xl border border-black/10 bg-white p-5">
              <h2 className="text-lg font-semibold">{service.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                {service.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
