"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

type FAQ = {
  q: string
  a: string
  category: string
}

const FAQS: FAQ[] = [
  {
    category: "적용 범위",
    q: "초대권이 아니라 유료 공연도 적용 가능한가요?",
    a: "네, 가능합니다. 초대권 이벤트뿐 아니라 유료 공연의 사전 신청·추첨·안내 프로세스에도 동일하게 적용할 수 있습니다. 결제 연동은 별도 상담을 통해 조율합니다.",
  },
  {
    category: "AdGate",
    q: "보상형 광고(AdGate)는 언제 시작하나요?",
    a: "현재 베타 준비 중인 기능입니다. 관객이 광고를 시청하면 응모 자격이 부여되고, 발생한 수익이 공연단체에 배분되는 구조입니다. Partner 플랜 파트너사에게 베타 출시 시 우선 적용할 예정입니다.",
  },
  {
    category: "콘텐츠",
    q: "SNS 홍보 콘텐츠는 어떤 범위까지 제작해 주나요?",
    a: "카드뉴스, 숏폼(릴스/쇼츠), 관람 포인트 큐레이션, 이벤트 당첨 공지 콘텐츠 등을 제작합니다. 공연 자료(포스터, 사진, 텍스트)를 기반으로 채널별 맞춤 포맷으로 직접 제작됩니다. Partner 플랜에서 제공됩니다.",
  },
  {
    category: "개인정보",
    q: "관객 개인정보는 어떻게 처리되나요?",
    a: "관객이 동의한 범위 내에서만 수집하며, 공연 운영 목적으로만 사용됩니다. 데이터는 암호화 저장되며 개인정보 보호법에 따라 관리됩니다. 파트너 단체에는 집계 통계만 제공되며, 개인 식별 정보는 별도 절차를 통해 처리합니다.",
  },
  {
    category: "운영 방식",
    q: "운영은 알터즈가 대행하나요, 단체가 직접 하나요?",
    a: "알터즈 담당자가 이벤트 접수, 추첨, 당첨 이메일 발송 등 핵심 운영을 대행합니다. 공연단체는 포스터와 기본 정보만 전달하시면 됩니다.",
  },
  {
    category: "비용",
    q: "비용은 어떻게 책정되나요?",
    a: "공연 규모, 이벤트 횟수, 필요한 서비스 범위에 따라 달라집니다. 상담 후 맞춤 견적을 제공합니다. AdGate 베타 출시 이후에는 수익 배분 모델로 초기 비용 부담 없이 시작할 수 있는 옵션도 제공할 예정입니다.",
  },
  {
    category: "시작하기",
    q: "시작하려면 무엇을 준비해야 하나요?",
    a: "① 공연 기본 정보(제목·장르·기간·장소) ② 포스터 또는 대표 이미지 ③ 초대권 매수와 공연 회차. 이 세 가지만 준비되면 신청서를 작성해 주세요. 신청 후 1~2영업일 내에 담당자가 연락드립니다.",
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  "적용 범위": "bg-blue-50 text-blue-600",
  "AdGate": "bg-blue-50 text-blue-700",
  "콘텐츠": "bg-green-50 text-green-700",
  "개인정보": "bg-red-50 text-red-600",
  "운영 방식": "bg-green-50 text-green-700",
  "정책 커스텀": "bg-purple-50 text-purple-700",
  "자료 준비": "bg-amber-50 text-amber-700",
  "비용": "bg-primary/10 text-primary",
  "시작하기": "bg-slate-100 text-slate-600",
}

export function ServiceFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="border-t border-border/40 bg-primary/3 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 space-y-3 text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">자주 묻는 질문</h2>
          <p className="text-muted-foreground">더 궁금한 점은 언제든지 문의해 주세요.</p>
        </div>

        {/* 아코디언 */}
        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`stage-panel overflow-hidden transition-all duration-200 ${
                  isOpen ? "border-primary/30 shadow-md" : ""
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-start gap-3 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${i}`}
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      CATEGORY_COLORS[faq.category] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {faq.category}
                  </span>

                  <span className="flex-1 text-sm font-semibold text-foreground sm:text-base">
                    {faq.q}
                  </span>

                  <ChevronDown
                    className={`mt-0.5 h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                <div
                  id={`faq-${i}`}
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-border/40 px-5 pb-5 pt-3">
                      <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
