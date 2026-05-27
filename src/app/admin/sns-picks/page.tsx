import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"
import SnsPicksManager from "@/components/admin/SnsPicksManager"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "SNS 에디터 픽 관리 — Admin",
}

type PickRow = {
  id: string
  performance_id: string
  caption: string | null
  channel: "instagram" | "youtube" | "tiktok" | "all"
  display_order: number
  promo_start: string | null
  promo_end: string | null
  is_active: boolean
  performance: {
    title: string
    slug: string
    poster_url: string | null
    category: string | null
  } | null
}

export default async function AdminSnsPicksPage() {
  let picks: PickRow[] = []

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("sns_picks")
      .select(`
        id,
        performance_id,
        caption,
        channel,
        display_order,
        promo_start,
        promo_end,
        is_active,
        performance:performances!performance_id (
          title,
          slug,
          poster_url,
          category
        )
      `)
      .order("display_order", { ascending: true })

    if (error) {
      // 테이블이 아직 없는 경우 (migration not applied)
      if (error.code !== "42P01" && error.code !== "42703") {
        console.error("sns_picks fetch error", error)
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      picks = (data ?? []).map((item: any) => ({
        id: item.id,
        performance_id: item.performance_id,
        caption: item.caption,
        channel: item.channel,
        display_order: item.display_order,
        promo_start: item.promo_start,
        promo_end: item.promo_end,
        is_active: item.is_active,
        performance: Array.isArray(item.performance) ? item.performance[0] ?? null : item.performance ?? null,
      }))
    }
  }

  const activeCount = picks.filter((p) => p.is_active).length

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SNS 에디터 픽 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전체 {picks.length}개 · 활성 {activeCount}개 — 홈페이지 캐러셀에 표시됩니다.
        </p>
      </div>

      <SnsPicksManager initialPicks={picks} />
    </div>
  )
}
