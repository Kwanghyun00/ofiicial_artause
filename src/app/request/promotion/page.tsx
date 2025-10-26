import { PromotionRequestForm } from "@/components/forms/PromotionRequestForm";

type InquiryType = "invitation" | "promotion";

type PageProps = {
  searchParams?: {
    type?: string;
  };
};

const inquiryHighlights = [
  "응모부터 추첨 · 체크인까지 자동화된 초대권 운영",
  "SNS · 뉴스레터 · 스포트라이트 등 맞춤형 채널 믹스",
  "성과 리포트와 다음 액션을 제안하는 후속 프로세스",
];

const proofPoints = [
  {
    label: "초대권 회수율",
    value: "92%",
    description: "프리뷰 회차 당첨자 체크인 기준 (2024 Q3)",
  },
  {
    label: "캠페인 준비 시간",
    value: "-45%",
    description: "운영 자동화 도입 시 평균 절감 (내부 데이터)",
  },
  {
    label: "유입 전환",
    value: "3.2배",
    description: "스포트라이트 + SNS 동시 운영 캠페인 기준",
  },
];

const inquiryTypeMap: Record<string, InquiryType> = {
  invitation: "invitation",
  promotion: "promotion",
};

function resolveInquiryType(raw?: string): InquiryType {
  if (!raw) return "invitation";
  const normalized = raw.toLowerCase();
  return inquiryTypeMap[normalized] ?? "invitation";
}

export const metadata = {
  title: "아르타우스 초대권 · 홍보 문의",
  description: "초대권 이벤트와 공연 홍보 캠페인을 한 번에 상담 받아보세요.",
};

export default function PromotionRequestPage({ searchParams }: PageProps) {
  const defaultInquiryType = resolveInquiryType(searchParams?.type);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-4 pb-10 text-center">
        <p className="text-sm uppercase tracking-wide text-indigo-600">파트너 지원</p>
        <h1 className="section-heading">초대권 · 홍보 문의</h1>
        <p className="section-subtitle mx-auto max-w-3xl">
          프리뷰 초대권부터 시즌 프로모션까지 아르타우스가 운영을 도와드립니다. 문의 유형을 선택하고 공연 정보를 알려주시면
          맞춤형 제안을 준비해 드릴게요.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="card space-y-6 p-8 md:p-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">아르타우스와 진행하면</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {inquiryHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">성과 스냅샷</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.label} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-indigo-500">{point.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-indigo-700">{point.value}</p>
                  <p className="mt-1 text-xs text-indigo-600/80">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-900/90 p-6 text-sm text-white">
            <p className="font-medium">컨설팅 범위</p>
            <p className="mt-2 text-white/80">
              초대권 운영 자동화, SNS/뉴스레터 운영, PR/에디토리얼, 브랜드 제휴까지 상담 가능합니다. 필요한 범위를 적어주시면
              우선순위에 맞춰 제안서를 보내드립니다.
            </p>
          </div>
        </div>

        <PromotionRequestForm defaultInquiryType={defaultInquiryType} />
      </div>
    </div>
  );
}
