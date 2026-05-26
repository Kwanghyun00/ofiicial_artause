"use client"

import { useReducer, useEffect, useMemo } from "react"
import { ExternalLink } from "lucide-react"
import { ReviewCard } from "./ReviewCard"
import { WriteReviewFlow } from "./WriteReviewFlow"
import type { Review } from "@/lib/supabase/review-types"

/**
 * queryType:
 *   'orgId'         — Supabase organizations 테이블 (organization_id FK 기반)
 *   'orgName'       — KOPIS entrpsnm 텍스트 기반 (performances.organization 컬럼 매칭)
 *   'performanceId' — 개별 공연 UUID 기반 (포트폴리오 공연 등)
 */
export interface OrgOption {
  id: string          // Supabase: org UUID  /  KOPIS: entrpsnm 문자열  /  포트폴리오: UUID
  slug: string        // URL 파라미터용 식별자
  name: string        // 드롭다운 표시 이름
  queryType: "orgId" | "orgName" | "performanceId"
  queryValue: string  // API 요청 시 실제 쿼리 값
}

interface ReviewsListingClientProps {
  organizations: OrgOption[]
  initialOrganizationSlug: string | null
}

const TAG_FILTER_OPTIONS = [
  { value: "감동",         label: "🥹 감동적" },
  { value: "몰입감",       label: "🔮 몰입감" },
  { value: "연기력",       label: "🌟 연기력" },
  { value: "음악",         label: "🎵 음악" },
  { value: "연인추천",     label: "💑 연인 추천" },
  { value: "친구추천",     label: "👫 친구 추천" },
  { value: "울고싶을때",   label: "😢 울고 싶을 때" },
  { value: "기분전환",     label: "😄 기분 전환" },
  { value: "첫관람자추천", label: "🎓 첫 관람자" },
] as const

type State = {
  selectedOrg: OrgOption | null
  selectedTag: string | null
  verifiedOnly: boolean
  reviews: Review[]
  loading: boolean
  reloadKey: number
}

type Action =
  | { type: "select_org"; org: OrgOption | null }
  | { type: "select_tag"; tag: string | null }
  | { type: "toggle_verified"; value: boolean }
  | { type: "fetch_success"; reviews: Review[] }
  | { type: "fetch_error" }
  | { type: "reload" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select_org":
      return { ...state, selectedOrg: action.org, reviews: [], loading: true }
    case "select_tag":
      return { ...state, selectedTag: action.tag, reviews: [], loading: true }
    case "toggle_verified":
      return { ...state, verifiedOnly: action.value, reviews: [], loading: true }
    case "fetch_success":
      return { ...state, loading: false, reviews: action.reviews }
    case "fetch_error":
      return { ...state, loading: false, reviews: [] }
    case "reload":
      return { ...state, reviews: [], loading: true, reloadKey: state.reloadKey + 1 }
    default:
      return state
  }
}

export function ReviewsListingClient({
  organizations,
  initialOrganizationSlug,
}: ReviewsListingClientProps) {
  const initialOrg =
    organizations.find((o) => o.slug === initialOrganizationSlug) ?? null

  const [state, dispatch] = useReducer(reducer, {
    selectedOrg: initialOrg,
    selectedTag: null,
    verifiedOnly: false,
    reviews: [],
    loading: true,
    reloadKey: 0,
  })

  // queryType별로 그룹 분리 (드롭다운 그룹핑용)
  const supabaseOrgs = organizations.filter((o) => o.queryType === "orgId")
  const kopisOrgs = organizations.filter((o) => o.queryType === "orgName")
  const portfolioOrgs = organizations.filter((o) => o.queryType === "performanceId")

  // performanceId → 공연명 맵 (ReviewCard에 공연명 표시용)
  const performanceNameById = useMemo(
    () =>
      Object.fromEntries(
        portfolioOrgs.map((o) => [o.queryValue, o.name])
      ) as Record<string, string>,
    [portfolioOrgs]
  )

  // 선택된 공연이 직접 후기 작성 가능한지 (performanceId 타입만 가능)
  const writablePerformance =
    state.selectedOrg?.queryType === "performanceId" ? state.selectedOrg : null

  useEffect(() => {
    const params = new URLSearchParams({
      limit: "30",
      verifiedOnly: String(state.verifiedOnly),
    })

    if (state.selectedOrg) {
      if (state.selectedOrg.queryType === "orgId") {
        params.set("organizationId", state.selectedOrg.queryValue)
      } else if (state.selectedOrg.queryType === "performanceId") {
        params.set("performanceId", state.selectedOrg.queryValue)
      } else {
        params.set("organizationName", encodeURIComponent(state.selectedOrg.queryValue))
      }
    } else {
      params.set("recent", "true")
    }

    if (state.selectedTag) {
      params.set("tag", state.selectedTag)
    }

    fetch(`/api/reviews?${params.toString()}`)
      .then((res) => res.json())
      .then((data: Review[]) => dispatch({ type: "fetch_success", reviews: data }))
      .catch((err) => {
        console.error("Failed to fetch reviews", err)
        dispatch({ type: "fetch_error" })
      })
  }, [state.selectedOrg, state.selectedTag, state.verifiedOnly, state.reloadKey])

  const { selectedOrg, selectedTag, verifiedOnly, reviews, loading } = state

  return (
    <div className="space-y-6">
      {/* 태그 필터 칩 */}
      <div className="flex flex-wrap gap-2">
        {TAG_FILTER_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              dispatch({ type: "select_tag", tag: selectedTag === value ? null : value })
            }
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
              selectedTag === value
                ? "border-primary bg-primary/10 text-primary shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 공연/제작사 필터 + 컨텍스트 액션 */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedOrg?.slug ?? ""}
          onChange={(e) => {
            const slug = e.target.value
            dispatch({
              type: "select_org",
              org: organizations.find((o) => o.slug === slug) ?? null,
            })
          }}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="">전체 최신 후기</option>
          {portfolioOrgs.length > 0 && (
            <optgroup label="✏️ 후기 작성 가능한 공연">
              {portfolioOrgs.map((o) => (
                <option key={o.id} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
          )}
          {supabaseOrgs.length > 0 && (
            <optgroup label="파트너 단체">
              {supabaseOrgs.map((o) => (
                <option key={o.id} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
          )}
          {kopisOrgs.length > 0 && (
            <optgroup label="KOPIS 제작사">
              {kopisOrgs.map((o) => (
                <option key={o.id} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => dispatch({ type: "toggle_verified", value: e.target.checked })}
            className="h-4 w-4 accent-primary rounded"
          />
          인증 관람만 보기
        </label>

        {/* 후기 작성 버튼: 포트폴리오 공연 선택 시에만 표시 */}
        {writablePerformance && (
          <WriteReviewFlow
            label="이 공연 후기 쓰기"
            preselectedPerformance={{
              id: writablePerformance.queryValue,
              slug: writablePerformance.slug,
              title: writablePerformance.name,
            }}
            onSuccess={() => dispatch({ type: "reload" })}
          />
        )}

        {/* 단체/제작사 선택 시: 공연 목록으로 안내 */}
        {selectedOrg && !writablePerformance && (
          <a
            href="/shows"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition"
          >
            <ExternalLink className="h-3 w-3" />
            공연 상세 페이지에서 후기 작성
          </a>
        )}
      </div>

      {/* 결과 */}
      {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

      {!loading && reviews.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {selectedTag
              ? `"${TAG_FILTER_OPTIONS.find((t) => t.value === selectedTag)?.label}" 태그가 달린 후기가 없습니다.`
              : verifiedOnly
                ? "인증 관람 후기가 없습니다."
                : "아직 등록된 후기가 없습니다."}
          </p>
          {writablePerformance && (
            <WriteReviewFlow
              label="첫 번째 후기 남기기"
              preselectedPerformance={{
                id: writablePerformance.queryValue,
                slug: writablePerformance.slug,
                title: writablePerformance.name,
              }}
              onSuccess={() => dispatch({ type: "reload" })}
            />
          )}
        </div>
      )}

      {!loading && reviews.length > 0 && (
        <>
          {!selectedOrg && (
            <p className="text-xs text-muted-foreground">
              최신 후기 {reviews.length}개 · 위에서 공연을 선택하면 해당 공연 후기만 볼 수 있습니다.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                performanceName={performanceNameById[review.performance_id]}
              />
            ))}
          </div>
        </>
      )}

    </div>
  )
}
