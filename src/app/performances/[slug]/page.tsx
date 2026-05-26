import { redirect } from "next/navigation"

export default async function PerformanceDetailRedirect({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  redirect(`/shows/${slug}`)
}
