import { PromotionRequestForm } from "@/components/forms/PromotionRequestForm";

const partnerHighlights = [
  "응모·추첨·대기열 플로우 자동화",
  "CTR·전환 지표와 추천 랭킹 리포트 다운로드",
  "광고·어필리에이트 슬롯 번들로 도달 확장",
];

const proofPoints = [
  {
    label: "평균 응모 전환율",
    value: "32%",
    description: "Spotlight 노출 대비 응모 완료 기준 (베타)",
  },
  {
    label: "운영 시간 절감",
    value: "-45%",
    description: "추첨·알림 자동화 도입 파트너 평균",
  },
  {
    label: "재방문 비율",
    value: "68%",
    description: "이벤트 종료 후 30일 이내 재응모",
  },
];

export const metadata = {
  title: "Artause 파트너십 문의",
  description:
    "응모부터 성과 리포트까지 자동화된 공연 초대 캠페인을 운영하세요. 폼을 제출하면 24시간 이내 담당자가 연락드립니다.",
};

export default function PromotionRequestPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="space-y-4 pb-10 text-center">
        <p className="text-sm uppercase tracking-wide text-indigo-600">공연 파트너 전용</p>
        <h1 className="section-heading">데이터로 증명하는 Artause 파트너십</h1>
        <p className="section-subtitle mx-auto max-w-3xl">
          응모·추천·추첨·체크인까지 이어지는 팬 경험을 자동화하고, CTR과 전환 리포트로 결과를 보고하세요.
          아래 폼을 작성해 주시면 24시간 내에 담당자가 연락드립니다.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="card space-y-6 p-8 md:p-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Artause 파트너만의 장점</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {partnerHighlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-600">베타 운영 지표</h3>
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
            <p className="font-medium">운영팀 지원 범위</p>
            <p className="mt-2 text-white/80">
              블랙리스트 관리, 추첨 로그, DM/SMS 템플릿, 체크인 리포트까지 제공하여 운영 시간을 절감해 드립니다.
              필요하면 커스텀 워크플로 컨설팅도 함께 진행해 드려요.
            </p>
          </div>
        </div>

        <PromotionRequestForm />
      </div>
    </div>
  );
}
