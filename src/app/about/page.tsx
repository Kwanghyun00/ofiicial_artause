export default function AboutPage() {
  return (
    <div className="bg-[#f6f4ee] pb-20 pt-10 text-foreground">
      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">알터즈</p>
        <h1 className="text-3xl font-semibold sm:text-4xl">소개</h1>
        <p className="text-base text-muted-foreground">
          공연 홍보와 관객 커뮤니티, 디지털 전환을 연결하는 알터즈의 비전과 운영 원칙을 소개합니다.
        </p>
      </section>

      <section className="mx-auto mt-10 max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold">비전</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              모든 예술가들이 박수를 받고 존중받을 수 있는 환경을 만듭니다.
            </p>
          </article>
          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold">커뮤니티 관점</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              관객도 예술가라는 시선으로 공연 경험을 연결합니다.
            </p>
          </article>
          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold">운영 원칙</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>공연 시작 최소 2주 전 접수 권장</li>
              <li>제작 후 수정 요청은 제한적으로 반영</li>
              <li>저작권/자료 제공 원칙 준수</li>
            </ul>
          </article>
          <article className="rounded-2xl border border-black/10 bg-white p-6">
            <h2 className="text-lg font-semibold">팀 소개</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              홍보·콘텐츠·이벤트 운영 경험을 갖춘 팀이 함께합니다.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
