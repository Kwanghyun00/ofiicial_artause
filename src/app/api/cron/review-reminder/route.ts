import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config"
import { createAdminSupabaseClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/index"

const CRON_SECRET = process.env.CRON_SECRET
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://artause.co.kr"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReminderTarget {
  email: string
  name: string
  performanceTitle: string
  performanceSlug: string
  checkedInAt: string
}

// ─── Query: ticket_entries where checked_in and no review ────────────────────
//
// 조건:
//   1. selection_status = 'selected'
//   2. attendance_status = 'checked_in'
//   3. review_submitted = false
//   4. checked_in_at is not null
//   5. 체크인 후 경과일이 D+1 ~ D+7 사이 (리마인더 발송 윈도우)

async function getReminderTargets(): Promise<ReminderTarget[]> {
  if (!isSupabaseConfigured) {
    console.info("[review-reminder] Supabase not configured — skipping")
    return []
  }

  const supabase = createAdminSupabaseClient()

  // 리마인더 발송 윈도우: 체크인 후 1일~7일 이내
  const now = new Date()
  const windowEnd = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)   // 24시간 전
  const windowStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7일 전

  const { data, error } = await supabase
    .from("ticket_entries")
    .select(`
      id,
      applicant_name,
      applicant_email,
      checked_in_at,
      ticket_campaigns (
        title,
        slug,
        performances (
          title,
          slug
        )
      )
    `)
    .eq("attendance_status", "checked_in")
    .eq("review_submitted", false)
    .not("applicant_email", "is", null)
    .not("checked_in_at", "is", null)
    .gte("checked_in_at", windowStart.toISOString())
    .lte("checked_in_at", windowEnd.toISOString())
    .order("checked_in_at", { ascending: false })

  if (error) {
    console.error("[review-reminder] query error", error)
    return []
  }

  if (!data || data.length === 0) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row: any) => {
    const campaign = row.ticket_campaigns
    const performance = campaign?.performances
    const performanceTitle =
      performance?.title ?? campaign?.title ?? "공연"
    const performanceSlug =
      performance?.slug ?? campaign?.slug ?? ""

    return {
      email: row.applicant_email as string,
      name: (row.applicant_name as string) ?? "관객",
      performanceTitle,
      performanceSlug,
      checkedInAt: row.checked_in_at as string,
    }
  })
}

// ─── Email template ───────────────────────────────────────────────────────────

function buildReminderHtml(target: ReminderTarget): string {
  const reviewUrl = `${SITE_URL}/reviews/${encodeURIComponent(target.performanceSlug)}`

  const checkedInDate = target.checkedInAt
    ? new Date(target.checkedInAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>관람 후기를 남겨주세요</title>
</head>
<body style="margin:0;padding:0;background:#f8f7f4;font-family:'Noto Sans KR',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1a1a2e;padding:28px 40px;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">알터즈</p>
              <p style="margin:4px 0 0;color:#a0a0c0;font-size:12px;">Artause — 공연과 관객을 잇다</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 20px;">
              <p style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;">관람은 즐거우셨나요? ✦</p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">
                안녕하세요, <strong>${target.name}</strong>님!<br />
                소중한 관람 경험을 후기로 남겨 다른 관객들과 나눠보세요.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">공연명</p>
                    <p style="margin:0 0 12px;color:#1a1a2e;font-size:17px;font-weight:700;">${target.performanceTitle}</p>
                    ${checkedInDate ? `<p style="margin:0 0 4px;color:#888;font-size:12px;font-weight:600;">관람일</p><p style="margin:0;color:#555;font-size:14px;">${checkedInDate}</p>` : ""}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;color:#555;font-size:14px;line-height:1.7;">
                후기 작성에는 1~2분밖에 걸리지 않아요.<br />
                인증 관람 배지도 받을 수 있습니다!
              </p>
              <a href="${reviewUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;">후기 남기기 →</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #eee;">
              <p style="margin:0;color:#aaa;font-size:12px;line-height:1.6;">
                본 메일은 알터즈 관람 후기 안내를 위해 발송되었습니다.<br />
                문의: <a href="mailto:hello@artause.co.kr" style="color:#888;">hello@artause.co.kr</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Route handler ────────────────────────────────────────────────────────────

async function handleReviewReminder() {
  const targets = await getReminderTargets()

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, failed: 0, total: 0, message: "발송 대상 없음" })
  }

  let sent = 0
  let failed = 0

  for (const target of targets) {
    try {
      await sendEmail(
        target.email,
        `[알터즈] ${target.performanceTitle} 관람 후기를 남겨주세요`,
        buildReminderHtml(target),
      )
      sent++
    } catch (err) {
      console.error(`[review-reminder] email failed to=${target.email}`, err)
      failed++
    }
  }

  console.log(`[review-reminder] done: sent=${sent} failed=${failed} total=${targets.length}`)
  return NextResponse.json({ ok: true, sent, failed, total: targets.length })
}

export async function POST() {
  const headersList = await headers()
  const authHeader = headersList.get("authorization")

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    return await handleReviewReminder()
  } catch (err) {
    console.error("[review-reminder] unexpected error", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Vercel Cron은 GET 메서드로 호출
export { POST as GET }
