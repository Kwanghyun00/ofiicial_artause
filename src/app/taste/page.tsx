import type { Metadata } from "next"
import { TasteQuiz, PERSONAS } from "@/components/taste/TasteQuiz"
import { getTicketCampaigns } from "@/lib/supabase/queries"
import { isCampaignActiveNow } from "@/lib/campaigns"
import type { Campaign } from "@/components/home/types"

type PersonaKey = keyof typeof PERSONAS
type RawCampaign = Awaited<ReturnType<typeof getTicketCampaigns>>[number]

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>
}): Promise<Metadata> {
  const { result } = await searchParams
  const persona = result && result in PERSONAS ? PERSONAS[result as PersonaKey] : null

  if (persona) {
    return {
      title: `나의 공연 DNA: ${persona.name} | 알터즈`,
      description: `${persona.tagline} — 알터즈에서 나만의 공연 취향을 알아보세요.`,
    }
  }

  return {
    title: "나의 공연 취향 테스트 | 알터즈",
    description: "5가지 질문으로 당신만의 공연 취향 유형을 알아보세요. 결과에 맞는 공연 초대권도 추천해 드립니다.",
  }
}

export default async function TastePage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>
}) {
  const { result } = await searchParams
  const initialResult =
    result && result in PERSONAS ? (result as PersonaKey) : undefined

  // 퀴즈 결과 화면에 바로 보여줄 활성 캠페인 목록
  const rawCampaigns = await getTicketCampaigns()
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const campaigns: Campaign[] = rawCampaigns
    .filter((r): r is RawCampaign & { id: string; title: string } =>
      Boolean(r && typeof r === "object" && "id" in r && "title" in r)
    )
    .filter((r) => isCampaignActiveNow(r, now))
    .map((r) => {
      const c = r as RawCampaign & {
        slug?: string | null
        description?: string | null
        one_line_intro?: string | null
        poster_image?: string | null
        reward?: string | null
        starts_at?: string | null
        ends_at?: string | null
        entry_count?: number | null
      }
      return {
        id: c.id ?? "",
        slug: c.slug ?? null,
        title: c.title ?? "",
        description: c.description ?? null,
        one_line_intro: c.one_line_intro ?? null,
        poster_image: c.poster_image ?? null,
        reward: c.reward ?? null,
        starts_at: c.starts_at ?? null,
        ends_at: c.ends_at ?? null,
        entry_count: c.entry_count ?? null,
      }
    })

  return (
    <div className="pb-24 pt-12 text-foreground">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <TasteQuiz initialResult={initialResult} campaigns={campaigns} />
      </div>
    </div>
  )
}
