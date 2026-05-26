import { redirect } from "next/navigation"

// 체험단 모집 목록은 /recruit 으로 이동했습니다. (SEO 301 처리)
export default function InvitesRedirect() {
  redirect("/recruit")
}
