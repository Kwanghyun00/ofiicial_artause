import { notFound } from "next/navigation"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { ConfirmAttendanceClient } from "@/components/recruit/ConfirmAttendanceClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "참석 확정",
  robots: { index: false },
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function ConfirmPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-2xl font-bold">링크가 유효하지 않습니다</p>
          <p className="mt-3 text-muted-foreground">
            이메일에서 받은 확정 링크를 사용해 주세요.<br />
            링크는 발송 후 24시간 이내에만 유효합니다.
          </p>
        </div>
      </div>
    )
  }

  const supabase = createAdminSupabaseClient()

  // token 검증
  const { data: entry } = await supabase
    .from("ticket_entries")
    .select(`
      id,
      applicant_name,
      applicant_email,
      selection_status,
      confirm_token_exp,
      confirmed_at,
      declined_at,
      qr_token,
      campaign_id,
      ticket_campaigns (
        id,
        title,
        slug,
        experience_dates,
        required_review_platforms,
        review_deadline_days,
        venue_name,
        venue_address
      )
    `)
    .eq("confirm_token", token)
    .maybeSingle()

  if (!entry) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-2xl font-bold">링크를 찾을 수 없습니다</p>
          <p className="mt-3 text-muted-foreground">
            유효하지 않거나 이미 처리된 링크입니다.
          </p>
        </div>
      </div>
    )
  }

  // 만료 확인
  const isExpired = entry.confirm_token_exp
    ? new Date(entry.confirm_token_exp) < new Date()
    : true

  if (isExpired && !entry.confirmed_at && !entry.declined_at) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-2xl font-bold">링크가 만료되었습니다</p>
          <p className="mt-3 text-muted-foreground">
            확정 링크는 24시간 이내에만 유효합니다.<br />
            파트너에게 문의하거나 다음 기회를 노려보세요.
          </p>
        </div>
      </div>
    )
  }

  const campaign = Array.isArray(entry.ticket_campaigns)
    ? entry.ticket_campaigns[0]
    : entry.ticket_campaigns

  if (!campaign) notFound()

  // 이미 확정/불참 처리된 경우
  if (entry.confirmed_at) {
    return (
      <AlreadyConfirmed
        name={entry.applicant_name}
        qrToken={entry.qr_token ?? ""}
        campaignTitle={campaign.title}
      />
    )
  }

  if (entry.declined_at) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-2xl font-bold">이미 불참 처리되었습니다</p>
          <p className="mt-3 text-muted-foreground">
            다음 체험단 모집에서 다시 만나요.
          </p>
        </div>
      </div>
    )
  }

  const experienceDates = Array.isArray(campaign.experience_dates)
    ? (campaign.experience_dates as Array<{ date: string; time: string; slots: number }>)
    : []

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <ConfirmAttendanceClient
        entryId={entry.id}
        token={token}
        applicantName={entry.applicant_name}
        campaignTitle={campaign.title}
        campaignSlug={campaign.slug ?? slug}
        experienceDates={experienceDates}
        requiredPlatforms={(campaign.required_review_platforms as string[]) ?? ["instagram"]}
        reviewDeadlineDays={campaign.review_deadline_days ?? 7}
        venueName={campaign.venue_name ?? ""}
        venueAddress={campaign.venue_address ?? ""}
      />
    </div>
  )
}

function AlreadyConfirmed({
  name,
  qrToken,
  campaignTitle,
}: {
  name: string
  qrToken: string
  campaignTitle: string
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="stage-panel p-8 text-center">
        <div className="mb-6 text-4xl">✓</div>
        <h1 className="text-2xl font-bold text-foreground">이미 참석이 확정되었습니다</h1>
        <p className="mt-3 text-muted-foreground">
          {name}님, <strong>{campaignTitle}</strong> 관람이 확정되어 있습니다.
        </p>
        <div className="mt-8 border border-border bg-muted/20 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            입장 QR 코드
          </p>
          <p className="mt-3 font-mono text-2xl font-bold tracking-widest text-primary">
            {qrToken.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">관람 당일 입구에서 제시하세요</p>
        </div>
      </div>
    </div>
  )
}
