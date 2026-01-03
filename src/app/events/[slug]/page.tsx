import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react"
import { EventApplicationForm } from "@/components/event-application-form"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { Badge } from "@/components/ui/badge"

const mockEvent = {
  id: "1",
  title: "프리미엄 미술 초대",
  genre: "전시",
  location: "서울 성수 갤러리",
  period: "2025.02.01 - 2025.04.30",
  time: "10:00 - 18:00 (월요일 휴관)",
  applicants: "1,247명 / 2,000명",
  deadline: "D-5",
  image: "/art-exhibition.png",
  description:
    "몰입형 미디어아트와 큐레이터 해설이 결합된 특별 초대 프로그램입니다. 오프닝 리셉션과 아티스트 토크 세션이 함께 제공됩니다.",
  benefits: ["1인 2매 초대권", "오디오 가이드 & 리셉션 초대", "카페 10% 할인권"],
}

export default function EventApplyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/events" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            초대 목록으로 돌아가기
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="space-y-6 rounded-[32px] border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="space-y-3">
                <Badge className="bg-primary/10 text-primary">{mockEvent.genre}</Badge>
                <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{mockEvent.title}</h1>
                <p className="text-sm text-muted-foreground">{mockEvent.description}</p>
              </div>

              <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
                <Image src={mockEvent.image} alt={mockEvent.title} fill className="object-cover" priority />
              </div>

              <div className="rounded-3xl border border-border bg-white px-6 py-5 text-sm text-muted-foreground">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {mockEvent.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    {mockEvent.period}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    관람 시간: {mockEvent.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    {mockEvent.applicants}
                  </div>
                </div>
                <p className="mt-4 text-sm font-semibold text-primary">마감 {mockEvent.deadline}</p>
              </div>

              <div className="rounded-3xl border border-border bg-secondary/40 px-6 py-5">
                <h3 className="text-base font-bold text-foreground">초대 혜택</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {mockEvent.benefits.map((benefit) => (
                    <li key={benefit}>· {benefit}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-[32px] border border-border bg-card p-6 shadow-lg sm:p-8">
              <h2 className="text-xl font-semibold text-foreground">신청 폼</h2>
              <p className="mt-1 text-sm text-muted-foreground">로그인 없이 기본 정보만 입력하면 신청이 완료됩니다.</p>
              <div className="mt-6">
                <EventApplicationForm />
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
