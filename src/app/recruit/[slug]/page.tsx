import { redirect } from "next/navigation"

// Phase 2에서 전용 체험단 상세 페이지로 교체 예정
// 현재는 기존 invites 상세 페이지로 임시 연결
export default async function RecruitDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/invites/${slug}`)
}
