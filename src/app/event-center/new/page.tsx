import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EnhancedEventCreationWizard } from "@/components/event-center";
import { getPartnerSession } from "@/lib/auth/partner-session";

export const metadata = {
  title: "공연 정보 등록 | 이벤트 운영 허브",
  description: "공연 정보와 초대권 이벤트를 등록하세요.",
};

export default async function NewEventPage() {
  const partnerEmail = await getPartnerSession();
  if (!partnerEmail) {
    redirect("/partner/login");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* 뒤로 가기 */}
      <div className="mb-8">
        <Link
          href="/event-center"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          이벤트 운영 허브로 돌아가기
        </Link>
      </div>

      {/* 페이지 헤더 */}
      <div className="mb-10 border-l-4 border-primary pl-5">
        <span className="cue mb-3">New Event</span>
        <h1 className="mt-2 text-3xl font-bold text-foreground">공연 정보 등록</h1>
        <p className="mt-2 text-muted-foreground">
          공연의 상세 정보와 초대권 이벤트 일정을 등록하면 관리자 검토 후 공개됩니다.
        </p>
      </div>

      <EnhancedEventCreationWizard partnerEmail={partnerEmail} />
    </div>
  );
}
