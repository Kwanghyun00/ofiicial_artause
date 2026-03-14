"use client"

import { useReducer, useEffect, useMemo, useState } from "react"
import { PenLine } from "lucide-react"
import { ReviewCard } from "./ReviewCard"
import { ReviewWriteModal } from "./ReviewWriteModal"
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

type State = {
  selectedOrg: OrgOption | null
  verifiedOnly: boolean
  reviews: Review[]
  loading: boolean
  reloadKey: number
}

type Action =
  | { type: "select_org"; org: OrgOption | null }
  | { type: "toggle_verified"; value: boolean }
  | { type: "fetch_success"; reviews: Review[] }
  | { type: "fetch_error" }
  | { type: "reload" }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select_org":
      return { ...state, selectedOrg: action.org, reviews: [], loading: true }
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
    verifiedOnly: false,
    reviews: [],
    loading: true,   // 항상 로딩으로 시작 (기본 최신 후기 로드)
    reloadKey: 0,
  })

  // 후기 작성 모달 상태 (로컬)
  const [writeTargetSlug, setWriteTargetSlug] = useState("")
  const [writeOpen, setWriteOpen] = useState(false)

  // queryType별로 그룹 분리
  const supabaseOrgs = organizations.filter((o) => o.queryType === "orgId")
  const kopisOrgs = organizations.filter((o) => o.queryType === "orgName")
  const portfolioOrgs = organizations.filter((o) => o.queryType === "performanceId")

  // 후기 작성 대상: 포트폴리오 공연만 (performanceId + slug 있음)
  const writeTargets = portfolioOrgs

  // performanceId → 공연명 맵
  const performanceNameById = useMemo(
    () =>
      Object.fromEntries(
        portfolioOrgs.map((o) => [o.queryValue, o.name])
      ) as Record<string, string>,
    [portfolioOrgs]
  )

  const selectedWriteTarget = writeTargets.find((o) => o.slug === writeTargetSlug) ?? null

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
      // 필터 없음 → 최신 후기 전체
      params.set("recent", "true")
    }

    fetch(`/api/reviews?${params.toString()}`)
      .then((res) => res.json())
      .then((data: Review[]) => dispatch({ type: "fetch_success", reviews: data }))
      .catch((err) => {
        console.error("Failed to fetch reviews", err)
        dispatch({ type: "fetch_error" })
      })
  }, [state.selectedOrg, state.verifiedOnly, state.reloadKey])

  const { selectedOrg, verifiedOnly, reviews, loading } = state

  return (
    <div className="space-y-6">
      {/* 필터 */}
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
            <optgroup label="포트폴리오 공연">
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
      </div>

      {/* 후기 작성 섹션 */}
      {writeTargets.length > 0 && (
        <div className="stage-panel p-5 space-y-3">
          <p className="text-sm font-semibold text-foreground">후기 작성하기</p>
          <p className="text-xs text-muted-foreground">
            직접 관람하신 공연이 있다면 후기를 남겨 다른 관객에게 도움을 주세요.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={writeTargetSlug}
              onChange={(e) => setWriteTargetSlug(e.target.value)}
              className="rounded-2xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              <option value="">공연 선택</option>
              {writeTargets.map((o) => (
                <option key={o.id} value={o.slug}>
                  {o.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={!selectedWriteTarget}
              onClick={() => setWriteOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PenLine className="h-4 w-4" />
              후기 작성하기
            </button>
          </div>
        </div>
      )}

      {/* 결과 */}
      {loading && <p className="text-sm text-muted-foreground">불러오는 중...</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {verifiedOnly ? "인증 관람 후기가 없습니다." : "아직 등록된 후기가 없습니다."}
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <>
          {!selectedOrg && (
            <p className="text-xs text-muted-foreground">
              최신 후기 {reviews.length}개 · 공연을 선택하면 해당 공연 후기만 볼 수 있습니다.
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

      {/* 후기 작성 모달 */}
      {writeOpen && selectedWriteTarget && (
        <ReviewWriteModal
          performanceId={selectedWriteTarget.queryValue}
          performanceSlug={selectedWriteTarget.slug}
          onClose={() => {
            setWriteOpen(false)
            dispatch({ type: "reload" })
          }}
        />
      )}
    </div>
  )
}
