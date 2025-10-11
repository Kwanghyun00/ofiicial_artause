import { redirect } from "next/navigation";

export const metadata = {
  title: "이벤트 페이지 이동",
  description: "티켓 이벤트 목록은 /events 경로로 이동했습니다.",
};

export default function LegacyTicketEventsPage() {
  redirect("/events");
}
