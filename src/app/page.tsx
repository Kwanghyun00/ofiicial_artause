import Link from "next/link";
import {
  getActiveTicketCampaigns,
  getFeaturedPerformances,
  getRecentPerformances,
} from "@/lib/supabase/queries";
import { PerformanceCard } from "@/components/marketing/PerformanceCard";
import { TicketCampaignCard } from "@/components/marketing/TicketCampaignCard";

const referrerHighlights = [
  { channel: "커뮤니티 제휴", value: "38%", insight: "공동 운영 파트너 12곳" },
  { channel: "인플루언서", value: "27%", insight: "IG DM 자동 발송" },
  { channel: "스폰서 광고", value: "19%", insight: "home_hero · home_mid" },
];

const valueStacks = [
  {
    title: "투명한 추첨",
    description: "Edge Function으로 추첨 로그와 가중치를 기록해 누구나 확인할 수 있습니다.",
  },
  {
    title: "추천 루프",
    description: "친구 초대 추천 코드를 발급해 반복 유입을 만들고 추가 응모권을 부여합니다.",
  },
  {
    title: "데이터 리포트",
    description: "캠페인 종료 후 UTM·CTR·체크인 데이터를 PDF 리포트로 제공합니다.",
  },
];

const playbooks = [
  {
    title: "F1. 신규 방문 → 응모",
    description: "IG Bio, 검색, 제휴 링크로 유입된 사용자가 2단계 안에서 응모를 완료하도록 설계했습니다.",
  },
  {
    title: "F3. 추첨 → 체크인",
    description: "Edge Function 예약으로 추첨을 자동 실행하고 D+2 미체크 시 대기자를 승급합니다.",
  },
  {
    title: "F4. 추천 확장",
    description: "추천 코드를 공유한 사용자는 추가 응모권과 가중치를 받아 자연스럽게 확산합니다.",
  },
];

const personaHighlights = [
  {
    tag: "Explorer",
    title: "24~29세 공연 탐험가",
    description: "월 2회 이상 공연을 찾는 초기 고객으로, 새로운 포맷과 초대장을 중시합니다.",
    bullets: [
      "무료 응모 1회",
      "친구 동반 초대권",
      "DM · 이메일 알림",
    ],
  },
  {
    tag: "Amplifier",
    title: "커뮤니티 운영자",
    description: "SNS 팔로워 5만 명 이상의 운영자로 추천 루프와 Pro 보고서를 선호합니다.",
    bullets: [
      "Pro 추천 리포트",
      "조기 오픈 24시간",
      "캠페인 예약",
    ],
  },
  {
    tag: "Partner",
    title: "브랜드 스폰서",
    description: "CTR · 전환 데이터를 기반으로 슬롯별 효율을 확인하고 최적화합니다.",
    bullets: [
      "home_hero 슬롯",
      "CTR · 전환 리포트",
      "Edge Function 연동",
    ],
  },
];

const monetization = [
  {
    title: "멤버십",
    value: "Free · Plus · Pro",
    insight: "응모 횟수 · 조기 오픈 · 리포트 확장",
  },
  {
    title: "스폰서십",
    value: "home_hero · home_mid",
    insight: "CTR · 유입 리포트 제공",
  },
  {
    title: "어필리에이트",
    value: "UTM + 추천 코드",
    insight: "클릭 혹은 전환 기반 정산",
  },
  {
    title: "리포트 구독",
    value: "월간 PDF",
    insight: "장르 · 지역 · 반응 데이터",
  },
];

type PerformanceResult = Awaited<ReturnType<typeof getRecentPerformances>>[number];
type ValidPerformance = Extract<PerformanceResult, { id: string }>;

function isPerformance(record: PerformanceResult): record is ValidPerformance {
  return Boolean(record && typeof record === "object" && "id" in record);
}

export default async function HomePage() {
  const [featuredPerformances, recentPerformances, campaigns] = await Promise.all([
    getFeaturedPerformances(),
    getRecentPerformances(),
    getActiveTicketCampaigns(),
  ]);

  const deduped = new Map<string, ValidPerformance>();
  [...featuredPerformances, ...recentPerformances].filter(isPerformance).forEach((performance) => {
    deduped.set(performance.id, performance);
  });
  const spotlightPerformances = Array.from(deduped.values()).slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden bg-indigo-950">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 opacity-90" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 text-white sm:py-20 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-5">
            <p className="text-sm uppercase tracking-wide text-white/60">핵심 요약</p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-[42px] md:text-5xl">
              공연 · 이벤트 커뮤니티를 운영하는 가장 빠른 방법
            </h1>
            <p className="text-sm text-white/80 sm:text-base">
              Artause는 공연 정보 구조화, 티켓 추첨 자동화, 추천 루프, 스폰서십까지 하나의 반응형 웹앱으로 제공합니다. 멤버십 단계에 따라 응모 횟수와 리포트를 확장하고 Edge Function 기반 자동화로 운영 시간을 줄여 보세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shows" className="btn-primary bg-white text-indigo-950 hover:bg-white/90">
                공연 둘러보기
              </Link>
              <Link href="/events" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
                이벤트 보기
              </Link>
              <Link href="/pricing" className="btn-secondary border-white/40 text-white hover:border-white/60 hover:text-white">
                멤버십 안내
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4 rounded-3xl border border-white/15 bg-white/10 p-5 text-sm text-white/80 shadow-xl backdrop-blur lg:max-w-md">
            {referrerHighlights.map((item) => (
              <div key={item.channel} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">{item.channel}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                <p className="text-xs text-white/70">{item.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">Artause 핵심 가치</h2>
            <p className="section-subtitle">추첨 자동화 · 추천 루프 · 데이터 리포트까지 하나의 흐름으로 제공합니다.</p>
          </div>
          <Link href="/pricing" className="btn-secondary">
            멤버십 비교
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {valueStacks.map((item) => (
            <div key={item.title} className="card space-y-2 p-6">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">스포트라이트 공연</h2>
            <p className="section-subtitle">진행 중 · 예정 공연을 한 눈에 보고 JSON-LD 메타로 SEO를 강화합니다.</p>
          </div>
          <Link href="/shows" className="btn-secondary">
            공연 전체 보기
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {spotlightPerformances.length ? (
            spotlightPerformances.map((performance) => (
              <PerformanceCard key={performance.id} performance={performance} />
            ))
          ) : (
            <div className="card p-8 text-sm text-slate-500 md:col-span-3">공연 데이터가 준비 중입니다.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">티켓 캠페인</h2>
            <p className="section-subtitle">추천 코드, 추첨 자동화, 체크인 QR까지 포함한 이벤트를 운영합니다.</p>
          </div>
          <Link href="/events" className="btn-secondary">
            이벤트 허브로 이동
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {campaigns.length ? (
            campaigns.map((campaign) => <TicketCampaignCard key={campaign.id} campaign={campaign} />)
          ) : (
            <div className="card p-8 text-sm text-slate-500 md:col-span-2">준비 중인 이벤트가 없습니다.</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="card grid gap-6 bg-indigo-50 p-8 sm:p-10 md:grid-cols-3">
          {playbooks.map((playbook) => (
            <div key={playbook.title} className="space-y-2 text-indigo-900">
              <p className="text-xs uppercase tracking-wide text-indigo-500">플로우</p>
              <h3 className="text-lg font-semibold">{playbook.title}</h3>
              <p className="text-sm text-indigo-700">{playbook.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">주요 고객군</h2>
            <p className="section-subtitle">Explorer · Amplifier · Partner 세 그룹을 중심으로 전략을 설계합니다.</p>
          </div>
          <Link href="/community" className="btn-secondary">
            커뮤니티 둘러보기
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {personaHighlights.map((persona) => (
            <div key={persona.tag} className="card space-y-3 p-6">
              <p className="text-xs uppercase tracking-wide text-indigo-500">{persona.tag}</p>
              <h3 className="text-lg font-semibold text-slate-900">{persona.title}</h3>
              <p className="text-sm text-slate-600">{persona.description}</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {persona.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-2 inline-block h-2 w-2 rounded-full bg-indigo-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-heading">수익 모델</h2>
            <p className="section-subtitle">멤버십, 스폰서십, 어필리에이트, 리포트 구독으로 수익을 구성합니다.</p>
          </div>
          <Link href="/partners" className="btn-secondary">
            파트너 안내
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {monetization.map((item) => (
            <div key={item.title} className="card space-y-2 p-6">
              <p className="text-xs uppercase tracking-wide text-slate-500">{item.title}</p>
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="text-sm text-slate-600">{item.insight}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
