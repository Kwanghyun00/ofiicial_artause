import { NextRequest, NextResponse } from "next/server"
import { sendEntryConfirmation } from "@/lib/email/templates/entry-confirmation"

// Supabase Database Webhook (pg_net) 또는 Edge Function에서 호출되는 엔드포인트
// POST body: { record: { applicant_name, applicant_email, submitted_at, campaign_id }, performance_name? }
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET
  if (webhookSecret) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const record = (body as Record<string, unknown>)?.record as Record<string, unknown> | undefined
  if (!record) {
    return NextResponse.json({ error: "Missing record" }, { status: 400 })
  }

  const applicantName =
    typeof record.applicant_name === "string" && record.applicant_name
      ? record.applicant_name
      : "신청자"
  const applicantEmail =
    typeof record.applicant_email === "string" && record.applicant_email
      ? record.applicant_email
      : null
  const submittedAt =
    typeof record.submitted_at === "string" && record.submitted_at
      ? record.submitted_at
      : new Date().toISOString()
  const performanceName =
    typeof (body as Record<string, unknown>).performance_name === "string"
      ? ((body as Record<string, unknown>).performance_name as string)
      : "공연"

  if (!applicantEmail) {
    return NextResponse.json({ skipped: true, reason: "no email" })
  }

  await sendEntryConfirmation({
    applicantName,
    applicantEmail,
    performanceName,
    appliedAt: submittedAt,
  } as Parameters<typeof sendEntryConfirmation>[0])

  return NextResponse.json({ ok: true })
}
