import Link from "next/link";

type InquiryCard = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
  cta: {
    href: string;
    label: string;
  };
  helpText?: string;
};

type SupportChannel = {
  label: string;
  value: string;
  description: string;
};

const inquiryCards: InquiryCard[] = [
  {
    id: "invitation",
    title: "초대권 문의",
    description: "프리뷰 · 프레스 · 프리미어 회차 운영을 아르타우스 팀과 함께 설계해 보세요.",
    highlights: [
      "응모 폼 제작과 추첨 자동화 세팅",
      "SNS · 뉴스레터 노출 및 추천 코드 운영",
      "현장 체크인 로그와 사후 리포트 제공",
    ],
    cta: {
      href: "/request/promotion?type=invitation",
      label: "초대권 상담 신청",
    },
    helpText: "폼 제출 후 24시간 이내 담당 매니저가 연락드립니다.",
  },
  {
    id: "promotion",
    title: "홍보 문의",
    description: "신작 론칭과 시즌 캠페인을 위한 통합 홍보 플랜을 제안드립니다.",
    highlights: [
      "채널 믹스와 예상 KPI 설계",
      "콘텐츠 제작 및 크리에이티브 브리프",
      "예산 · 일정 맞춤 실행 시트 공유",
    ],
    cta: {
      href: "/request/promotion?type=promotion",
      label: "홍보 상담 신청",
    },
  },
];

const supportChannels: SupportChannel[] = [
  {
    label: "제휴 전용 메일",
    value: "partners@artause.com",
    description: "캠페인 견적, API 연동 문의",
  },
  {
    label: "긴급 운영 지원",
    value: "010-1234-5678",
    description: "행사 당일 현장 대응 · 체크인 지원",
  },
];

export const metadata = {
  title: "아르타우스 파트너 지원",
  description: "초대권 이벤트와 홍보 캠페인을 전담 매니저와 함께 빠르게 상담하세요.",
};

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-14">
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-1 text-xs font-semibold text-emerald-200">
            파트너 문의 센터
          </div>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">초대권 · 홍보 상담</h1>
          <p className="text-sm text-white/80 md:text-base">
            공연 종사자는 누구나 아르타우스 팀에게 초대권 이벤트와 홍보 캠페인을 의뢰할 수 있습니다.
            필요한 정보를 보내 주시면 24시간 이내에 담당 매니저가 연락드려요.
          </p>
        </header>

        <section className="space-y-8" id="inquiries">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left text-sm text-white/70">
            <p>
              초대권 문의는 프리뷰·프레스 회차 중심의 응모·추첨 플로우에 초점을 맞추고, 홍보 문의는 온·오프라인 채널을
              아우르는 통합 캠페인 기획을 함께 진행합니다.
            </p>
          </div>
          <div className="space-y-6">
            {inquiryCards.map((card) => (
              <article
                key={card.id}
                id={card.id}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-4 md:max-w-lg">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/80">
                        {card.id === "invitation" ? "Invitation" : "Promotion"}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{card.title}</h2>
                      <p className="mt-2 text-sm text-white/70">{card.description}</p>
                    </div>
                    <ul className="space-y-2 text-sm text-white/80">
                      {card.highlights.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-300/80" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    {card.helpText ? (
                      <p className="text-xs text-emerald-200/80">{card.helpText}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-3">
                    <Link
                      href={card.cta.href}
                      className="btn-primary bg-white text-slate-950 hover:bg-white/90"
                    >
                      {card.cta.label}
                    </Link>
                    <span className="text-xs text-white/60">
                      제출된 정보는 상담 외 목적으로 사용하지 않습니다.
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6" id="support">
          <h2 className="text-2xl font-semibold text-white">추가 지원 채널</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {supportChannels.map((channel) => (
              <div
                key={channel.value}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80"
              >
                <p className="text-xs uppercase tracking-wide text-emerald-200/80">{channel.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{channel.value}</p>
                <p className="mt-2 text-xs text-white/60">{channel.description}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-xs text-white/60">
            <p>
              폼 작성이 어려운 경우 <Link href="mailto:partners@artause.com" className="text-emerald-200 hover:text-emerald-100">partners@artause.com</Link>{" "}
              또는 카카오톡 채널 @artause 로 메시지를 보내 주세요.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
