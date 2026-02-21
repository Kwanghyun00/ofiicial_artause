import type { Metadata } from "next"
import { ServiceHero } from "@/components/services/ServiceHero"
import { LogoBar } from "@/components/services/LogoBar"
import { ServiceOverview } from "@/components/services/ServiceOverview"
import { FeatureShowcase } from "@/components/services/FeatureShowcase"
import { ComparisonSection } from "@/components/services/ComparisonSection"
import { ServiceProcess } from "@/components/services/ServiceProcess"
import { Packages } from "@/components/services/Packages"
import { ServiceTestimonials } from "@/components/services/ServiceTestimonials"
import { ServiceFAQ } from "@/components/services/ServiceFAQ"
import { ServiceCTA } from "@/components/services/ServiceCTA"

export const metadata: Metadata = {
  title: "서비스 소개 | 알터즈",
  description:
    "초대권 운영 자동화, 보상형 광고(AdGate), SNS 홍보 콘텐츠 제작, 관객 데이터 CRM까지. 공연단체를 위한 올인원 관객 관리 플랫폼, 알터즈.",
  keywords: [
    "대학로 공연 홍보",
    "초대권 이벤트 운영",
    "관객관리",
    "노쇼 방지",
    "공연단체 마케팅",
    "알터즈",
    "공연 초대권",
    "관객 데이터",
    "보상형 광고",
    "공연 CRM",
    "SNS 홍보 콘텐츠",
  ],
  openGraph: {
    title: "서비스 소개 | 알터즈",
    description:
      "초대권 운영 자동화부터 보상형 광고, SNS 콘텐츠, 관객 CRM까지. 공연단체를 위한 올인원 플랫폼.",
    url: "https://artause.co.kr/services",
    siteName: "알터즈 (Artause)",
    type: "website",
    images: [
      {
        url: "https://artause.co.kr/og-service.png",
        width: 1200,
        height: 630,
        alt: "알터즈 서비스 소개",
      },
    ],
  },
}

export default function ServicesPage() {
  return (
    <main>
      {/* Hero — 플랫폼 포지셔닝 */}
      <ServiceHero />

      {/* 파트너 로고 바 */}
      <LogoBar />

      {/* 4대 서비스 카드 개요 */}
      <ServiceOverview />

      {/* 핵심 기능 상세 — UI 목업 포함 */}
      <FeatureShowcase />

      {/* 기존 방식 vs 알터즈 비교 */}
      <ComparisonSection />

      {/* 3단계 프로세스 */}
      <ServiceProcess />

      {/* 플랜 3종 */}
      <Packages />

      {/* 파트너 후기 */}
      <ServiceTestimonials />

      {/* FAQ */}
      <ServiceFAQ />

      {/* 최종 CTA */}
      <ServiceCTA />
    </main>
  )
}
