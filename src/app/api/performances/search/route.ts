import { NextRequest, NextResponse } from "next/server"
import { isSupabaseConfigured } from "@/lib/config"
import { createReadOnlySupabaseClient } from "@/lib/supabase/server"
import { mockPerformances } from "@/lib/mocks/performances"

export interface PerformanceSearchResult {
  id: string
  title: string
  slug: string
  category: string | null
  poster_url: string | null
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  if (!isSupabaseConfigured) {
    const lower = q.toLowerCase()
    const results = mockPerformances
      .filter((p) => p.title.toLowerCase().includes(lower))
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category ?? null,
        poster_url: p.poster_url ?? null,
      }))
    return NextResponse.json(results)
  }

  try {
    const supabase = createReadOnlySupabaseClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("performances")
      .select("id, title, slug, category, poster_url")
      .ilike("title", `%${q}%`)
      .in("status", ["scheduled", "ongoing", "completed", "draft"])
      .order("period_start", { ascending: false })
      .limit(10)

    if (error) {
      console.error("performances search error", error)
      return NextResponse.json([])
    }

    return NextResponse.json((data ?? []) as PerformanceSearchResult[])
  } catch (err) {
    console.error("performances search exception", err)
    return NextResponse.json([])
  }
}
