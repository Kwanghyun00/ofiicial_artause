import { redirect } from "next/navigation"

// 초대 이벤트 목록은 /invites 로 이동했습니다.
export default function EventsListRedirect() {
  redirect("/invites")
}
