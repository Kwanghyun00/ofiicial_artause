import { redirect } from "next/navigation"

// /webservice → /services 로 영구 이전
export default function WebServiceRedirect() {
  redirect("/services")
}
