import { NextRequest, NextResponse } from "next/server"
import {
  getReviewsByPerformance,
  getReviewsByOrganization,
  getReviewsByOrgName,
  getRecentReviews,
  incrementReviewHelpful,
} from "@/lib/supabase/queries"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const performanceId = searchParams.get("performanceId")
  const organizationId = searchParams.get("organizationId")
  const organizationName = searchParams.get("organizationName")
  const recent = searchParams.get("recent") === "true"
  const limit = parseInt(searchParams.get("limit") ?? "50", 10)
  const verifiedOnly = searchParams.get("verifiedOnly") === "true"
  const tag = searchParams.get("tag") ?? undefined

  if (organizationId) {
    const reviews = await getReviewsByOrganization(organizationId, { limit, verifiedOnly, tag })
    return NextResponse.json(reviews)
  }

  if (organizationName) {
    const reviews = await getReviewsByOrgName(decodeURIComponent(organizationName), { limit, verifiedOnly, tag })
    return NextResponse.json(reviews)
  }

  if (performanceId) {
    const reviews = await getReviewsByPerformance(performanceId, { limit, verifiedOnly, tag })
    return NextResponse.json(reviews)
  }

  if (recent) {
    const reviews = await getRecentReviews({ limit, verifiedOnly, tag })
    return NextResponse.json(reviews)
  }

  return NextResponse.json(
    { error: "performanceId, organizationId, organizationName, or recent=true required" },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const reviewId = typeof body?.reviewId === "string" ? body.reviewId.trim() : ""

  if (!reviewId) {
    return NextResponse.json({ error: "reviewId required" }, { status: 400 })
  }

  await incrementReviewHelpful(reviewId)
  return NextResponse.json({ success: true })
}
