import { redirect } from "next/navigation"

// 초대 이벤트 상세는 /invites/[slug] 로 이동했습니다.
export default async function EventDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/invites/${slug}`)
}
