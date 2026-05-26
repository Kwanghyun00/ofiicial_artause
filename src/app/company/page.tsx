import type { Metadata } from "next"
import { CompanyHomePage } from "@/components/company/CompanyHomePage"

export const metadata: Metadata = {
  title: "알터즈 | 공연예술 마케팅 파트너",
  description:
    "공연예술을 세상과 잇는 마케팅 파트너, 알터즈. 초대권 이벤트 운영, SNS 콘텐츠 제작, 플랫폼 노출까지.",
  alternates: { canonical: "/company" },
}

export default function CompanyPage() {
  return <CompanyHomePage />
}
