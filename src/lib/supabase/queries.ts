import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import {
  mockCampaigns,
  mockCommunityPosts,
  mockOrganizations,
  mockPerformances,
  mockReviews,
} from "@/lib/mocks/performances";
import {
  createAdminSupabaseClient,
  createReadOnlySupabaseClient,
  createServerSupabaseClient,
} from "./server";
import type { Database } from "./types";
import type { PromotionRequestPayload } from "@/lib/models/promotion-request";
import type { PerformanceSubmissionPayload } from "@/lib/models/performance-submission";
import type { TicketEntryPayload } from "@/lib/models/ticket-entry";
import type { ReviewRow, ReviewSummary } from "./review-types";

const PERFORMANCE_SELECT = `
  id,
  slug,
  title,
  status,
  category,
  region,
  organization,
  organization_id,
  period_start,
  period_end,
  venue,
  synopsis,
  description,
  tasks,
  poster_url,
  hero_headline,
  hero_subtitle,
  ticket_link,
  is_featured,
  kopis_id,
  source,
  last_synced_at,
  cast_info,
  crew_info,
  runtime_text,
  age_limit,
  price_info,
  schedule_info,
  detail_images,
  created_at,
  updated_at
`;

const ORGANIZATION_SELECT = `
  id,
  slug,
  name,
  tagline,
  description,
  genre_focus,
  region,
  cover_image_url,
  logo_url,
  website,
  instagram,
  youtube,
  follower_count,
  created_at,
  updated_at
`;

const COMMUNITY_POST_SELECT = `
  id,
  organization_id,
  performance_id,
  slug,
  title,
  excerpt,
  body,
  cover_image_url,
  tags,
  is_published,
  published_at,
  created_at,
  updated_at,
  organizations (
    id,
    slug,
    name,
    logo_url,
    tagline
  )
`;

// 마이그레이션 전 레거시 SELECT (performance_id, is_published 컬럼 없는 상태)
const COMMUNITY_POST_SELECT_LEGACY = `
  id,
  organization_id,
  slug,
  title,
  excerpt,
  body,
  cover_image_url,
  tags,
  published_at,
  created_at,
  updated_at,
  organizations (
    id,
    slug,
    name,
    logo_url,
    tagline
  )
`;

const PUBLIC_TICKET_CAMPAIGN_SELECT = `
  id,
  slug,
  performance_id,
  title,
  description,
  reward,
  starts_at,
  ends_at,
  form_link,
  created_at,
  updated_at,
  status,
  allocation,
  last_draw_at,
  ticket_purchase_url,
  available_dates,
  performance_period_start,
  performance_period_end,
  one_line_intro,
  poster_image,
  still_images,
  venue_name,
  venue_address,
  sessions_per_week,
  running_time,
  age_rating,
  sns_instagram,
  sns_youtube,
  sns_tiktok,
  hashtags,
  production_team,
  ticket_allocations,
  kopis_id,
  entry_count
`;

const TICKET_ENTRY_SELECT = `
  id,
  campaign_id,
  applicant_name,
  applicant_email,
  applicant_phone,
  answers,
  consent_marketing,
  submitted_at,
  selection_status,
  attendance_status,
  selected_at,
  checked_in_at
`;

const TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT = `
  id,
  slug,
  performance_id,
  title,
  description,
  reward,
  starts_at,
  ends_at,
  form_link,
  created_at,
  updated_at,
  status,
  allocation,
  algorithm_version,
  config,
  snapshot_seed,
  last_draw_at,
  ticket_purchase_url,
  partner_name,
  partner_email,
  partner_phone,
  approved_at,
  approved_by,
  available_dates,
  performance_period_start,
  performance_period_end,
  entry_count,
  poster_image,
  still_images,
  venue_name,
  one_line_intro,
  performances (
    id,
    slug,
    title,
    poster_url,
    region,
    organization_id,
    period_start,
    period_end
  )
`;


function readPositiveIntEnv(key: string, fallback: number) {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export const getOrganizations = cache(async () => {
  if (!isSupabaseConfigured) {
    return [...mockOrganizations].sort((a, b) => b.follower_count - a.follower_count);
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_SELECT)
    .order("follower_count", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("getOrganizations error", error);
    throw error;
  }

  return data ?? [];
});

export const getOrganizationBySlug = cache(async (slug: string) => {
  if (!slug) {
    return null;
  }

  // URL 인코딩된 슬러그 디코딩
  const decodedSlug = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()

  if (!isSupabaseConfigured) {
    return mockOrganizations.find((organization) => organization.slug === decodedSlug) ?? null;
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_SELECT)
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error) {
    console.error("getOrganizationBySlug error", error);
    throw error;
  }

  return data ?? null;
});

export const getOrganizationById = cache(async (id: string) => {
  if (!id) return null;

  if (!isSupabaseConfigured) {
    return mockOrganizations.find((org) => org.id === id) ?? null;
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getOrganizationById error", error);
    return null;
  }

  return data ?? null;
});

export const getCommunityPosts = cache(async ({ limit }: { limit?: number } = {}) => {
  if (!isSupabaseConfigured) {
    const sorted = [...mockCommunityPosts]
      .filter((p) => p.is_published)
      .sort((a, b) => {
        const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
        const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
        return bTime - aTime;
      });
    return limit ? sorted.slice(0, limit) : sorted;
  }

  const supabase = createReadOnlySupabaseClient();

  // 신규 컬럼(is_published, performance_id)을 포함한 쿼리 시도
  let query = supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    // 컬럼이 아직 없는 경우 (마이그레이션 미적용) — 레거시 쿼리로 fallback
    if (error.code === "42703") {
      console.warn("getCommunityPosts: new columns not found, using legacy select");
      let legacyQuery = supabase
        .from("community_posts")
        .select(COMMUNITY_POST_SELECT_LEGACY)
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false });
      if (limit) legacyQuery = legacyQuery.limit(limit);
      const { data: legacyData, error: legacyError } = await legacyQuery;
      if (legacyError) { console.error("getCommunityPosts legacy error", legacyError); return []; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (legacyData ?? []).map((p: any) => ({ ...p, is_published: true, performance_id: null }));
    }
    console.error("getCommunityPosts error", error);
    return [];
  }

  return data ?? [];
});

export const getCommunityPostsByPerformance = cache(async (performanceId: string) => {
  if (!isSupabaseConfigured) {
    return mockCommunityPosts.filter(
      (p) => p.is_published && p.performance_id === performanceId
    ).slice(0, 2);
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("is_published", true)
    .eq("performance_id", performanceId)
    .order("published_at", { ascending: false })
    .limit(2);

  if (error) {
    console.error("getCommunityPostsByPerformance error", error);
    return [];
  }

  return data ?? [];
});

export const getCommunityPostBySlug = cache(async (slug: string) => {
  const decodedSlug = (() => { try { return decodeURIComponent(slug) } catch { return slug } })()

  if (!isSupabaseConfigured) {
    return mockCommunityPosts.find((post) => post.slug === decodedSlug) ?? null;
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("slug", decodedSlug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    // 마이그레이션 미적용 fallback
    if (error.code === "42703") {
      console.warn("getCommunityPostBySlug: new columns not found, using legacy select");
      const { data: legacyData } = await supabase
        .from("community_posts")
        .select(COMMUNITY_POST_SELECT_LEGACY)
        .eq("slug", decodedSlug)
        .maybeSingle();
      if (!legacyData) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...(legacyData as any), is_published: true, performance_id: null };
    }
    console.error("getCommunityPostBySlug error", error);
    return null;
  }

  return data;
});

export const getPerformancesByOrganization = cache(async (organizationId: string) => {
  if (!isSupabaseConfigured) {
    return mockPerformances.filter((item) => item.organization_id === organizationId);
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("performances")
    .select(PERFORMANCE_SELECT)
    .eq("organization_id", organizationId)
    .order("period_start", { ascending: true });

  if (error) {
    console.error("getPerformancesByOrganization error", error);
    throw error;
  }

  return data ?? [];
});

export const getFeaturedPerformances = cache(async () => {
  if (!isSupabaseConfigured) {
    return mockPerformances.filter((item) => item.is_featured);
  }

  try {
    const supabase = createReadOnlySupabaseClient();
    const { data, error } = await supabase
      .from("performances")
      .select(PERFORMANCE_SELECT)
      .eq("is_featured", true)
      .order("period_start", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("getFeaturedPerformances exception", err);
    return mockPerformances.filter((item) => item.is_featured);
  }
});

export const getShowsPerformances = cache(async () => {
  return getAllPerformances();
});

export const getRecentPerformances = cache(async () => {
  if (!isSupabaseConfigured) {
    return mockPerformances;
  }

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("performances")
    .select(PERFORMANCE_SELECT)
    .limit(12)
    .order("period_start", { ascending: false });

  if (error) {
    console.error("getRecentPerformances error", error);
    throw error;
  }

  return data ?? [];
});

export const getPerformanceBySlug = cache(async (slug: string) => {
  // Next.js App Router에서 한글 슬러그가 URL 인코딩된 채로 전달되는 경우 디코딩
  const decodedSlug = (() => {
    try { return decodeURIComponent(slug) } catch { return slug }
  })()

  // 1. Supabase에서 조회
  if (isSupabaseConfigured) {
    try {
      const supabase = createReadOnlySupabaseClient();
      const { data: performance, error } = await supabase
        .from("performances")
        .select(PERFORMANCE_SELECT)
        .eq("slug", decodedSlug)
        .maybeSingle();

      if (!error && performance) {
        const { data: campaigns, error: campaignsError } = await supabase
          .from("public_ticket_campaigns")
          .select(PUBLIC_TICKET_CAMPAIGN_SELECT)
          .eq("performance_id", performance.id)
          .order("starts_at", { ascending: false });

        if (campaignsError) {
          console.error("getPerformanceBySlug campaigns error", campaignsError);
        }

        return {
          ...performance,
          ticket_campaigns: campaigns ?? [],
        };
      }
    } catch (err) {
      console.error("getPerformanceBySlug Supabase error", err);
    }
  }

  // 2. Mock 데이터 fallback
  const performance = mockPerformances.find((item) => item.slug === decodedSlug);
  if (!performance) return null;
  const campaigns = mockCampaigns.filter((item) => item.performance_id === performance.id);
  return { ...performance, ticket_campaigns: campaigns };
});

export const getActiveTicketCampaigns = cache(async () => {
  if (!isSupabaseConfigured) {
    return mockCampaigns;
  }

  const supabase = createReadOnlySupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("public_ticket_campaigns")
    .select(PUBLIC_TICKET_CAMPAIGN_SELECT)
    .eq("status", "approved")  // 승인된 것만
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("ends_at", { ascending: true });

  if (error) {
    console.error("getActiveTicketCampaigns error", error);
    throw error;
  }

  return data ?? [];
});

export const getTicketCampaigns = cache(async () => {
  if (!isSupabaseConfigured) {
    const toTimestamp = (value?: string | null) => (value ? new Date(value).getTime() : 0);
    return [...mockCampaigns].sort((a, b) => {
      const aKey = a.starts_at ?? a.created_at ?? null;
      const bKey = b.starts_at ?? b.created_at ?? null;
      return toTimestamp(bKey) - toTimestamp(aKey);
    });
  }

  try {
    const supabase = createReadOnlySupabaseClient();

    const { data, error } = await supabase
      .from("public_ticket_campaigns")
      .select(PUBLIC_TICKET_CAMPAIGN_SELECT)
      .order("starts_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      const errorDetails = {
        message: (error as { message?: string }).message,
        details: (error as { details?: string }).details,
        hint: (error as { hint?: string }).hint,
        code: (error as { code?: string }).code,
        stringified: JSON.stringify(error, Object.getOwnPropertyNames(error)),
        asString: String(error),
      };
      const hasDetails = Boolean(
        errorDetails.message || errorDetails.details || errorDetails.hint || errorDetails.code ||
        (errorDetails.stringified && errorDetails.stringified !== "{}")
      );
      if (hasDetails) {
        console.error("getTicketCampaigns error", errorDetails);
      } else {
        console.warn("getTicketCampaigns warning: Supabase error with empty details. Falling back to mock data.");
      }
      // Fallback to mock data on error
      const toTimestamp = (value?: string | null) => (value ? new Date(value).getTime() : 0);
      return [...mockCampaigns].sort((a, b) => {
        const aKey = a.starts_at ?? a.created_at ?? null;
        const bKey = b.starts_at ?? b.created_at ?? null;
        return toTimestamp(bKey) - toTimestamp(aKey);
      });
    }

    return data ?? [];
  } catch (err) {
    console.error("getTicketCampaigns exception", err);
    // Fallback to mock data on exception
    const toTimestamp = (value?: string | null) => (value ? new Date(value).getTime() : 0);
    return [...mockCampaigns].sort((a, b) => {
      const aKey = a.starts_at ?? a.created_at ?? null;
      const bKey = b.starts_at ?? b.created_at ?? null;
      return toTimestamp(bKey) - toTimestamp(aKey);
    });
  }
});
export const getTicketCampaignBySlug = cache(async (identifier: string) => {
  // URL 인코딩된 슬러그 디코딩
  const decodedIdentifier = (() => { try { return decodeURIComponent(identifier) } catch { return identifier } })()

  if (!isSupabaseConfigured) {
    const campaign = mockCampaigns.find((item) => item.slug === decodedIdentifier || item.id === decodedIdentifier);
    return campaign ?? null;
  }

  try {
    const supabase = createReadOnlySupabaseClient();
    const fetchCampaign = (field: "id" | "slug", value: string) =>
      supabase
        .from("public_ticket_campaigns")
        .select(PUBLIC_TICKET_CAMPAIGN_SELECT)
        .eq(field, value)
        .maybeSingle();

    const identifierIsUuid = isUuid(decodedIdentifier);

    let { data, error } = await fetchCampaign(identifierIsUuid ? "id" : "slug", decodedIdentifier);

    if (!data && !error && !identifierIsUuid) {
      const fallback = await fetchCampaign("id", decodedIdentifier);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("getTicketCampaignBySlug error", error);
      // Fallback to mock data on error
      const campaign = mockCampaigns.find((item) => item.slug === decodedIdentifier || item.id === decodedIdentifier);
      return campaign ?? null;
    }

    return data ?? null;
  } catch (err) {
    console.error("getTicketCampaignBySlug exception", err);
    // Fallback to mock data on exception
    const campaign = mockCampaigns.find((item) => item.slug === decodedIdentifier || item.id === decodedIdentifier);
    return campaign ?? null;
  }
});

export async function submitPerformanceSubmission(payload: PerformanceSubmissionPayload) {
  if (!isSupabaseConfigured) {
    console.info("Performance submission received (mock mode):", payload);
    return;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();
  const insertPayload: Database["public"]["Tables"]["performance_submissions"]["Insert"] = {
    submission_type: payload.submissionType,
    organization_name: payload.organizationName,
    organization_slug: payload.organizationSlug ?? null,
    organization_website: payload.organizationWebsite ?? null,
    contact_name: payload.contactName,
    contact_email: payload.contactEmail,
    contact_phone: payload.contactPhone ?? null,
    performance_title: payload.performanceTitle,
    performance_slug: payload.performanceSlug ?? null,
    performance_category: payload.performanceCategory ?? null,
    performance_region: payload.performanceRegion ?? null,
    performance_tags: payload.performanceTags ?? null,
    period_start: payload.periodStart ?? null,
    period_end: payload.periodEnd ?? null,
    venue: payload.venue ?? null,
    synopsis: payload.synopsis ?? null,
    assets_url: payload.assetsUrl ?? null,
    additional_notes: payload.additionalNotes ?? null,
  };

  const { error } = await supabase.from("performance_submissions").insert(insertPayload);
  if (error) {
    console.error("submitPerformanceSubmission error", error);
    throw error;
  }
}
/**
 * 초대권 신청 저장 — Supabase 직접 insert (Edge Function 제거)
 * 중복 신청 시 PostgreSQL unique violation(23505) 에러가 발생하며
 * 호출 측에서 error.code === "23505" 여부로 사용자 메시지를 분기한다.
 */
export async function submitTicketEntry(payload: TicketEntryPayload) {
  if (!isSupabaseConfigured) {
    console.info("Ticket entry received (mock mode):", payload);
    return;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();

  const metadata = (payload.metadata ?? {}) as Record<string, unknown>;
  const applicantName = typeof metadata.applicantName === "string" ? metadata.applicantName : "익명";
  const applicantEmail = typeof metadata.email === "string" ? metadata.email : "";
  const applicantPhone = typeof metadata.phone === "string" ? metadata.phone : null;
  const answers =
    typeof metadata.answers === "object" && metadata.answers
      ? (metadata.answers as Database["public"]["Tables"]["ticket_entries"]["Insert"]["answers"])
      : null;
  const consentMarketing = Boolean(metadata.consentMarketing);

  const { error: insertError } = await supabase.from("ticket_entries").insert({
    campaign_id: payload.campaignId,
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    applicant_phone: applicantPhone,
    answers,
    consent_marketing: consentMarketing,
  });

  if (insertError) {
    console.error("submitTicketEntry error", insertError);
    throw insertError;
  }
}
export async function submitPromotionRequest(payload: PromotionRequestPayload) {
  if (!isSupabaseConfigured) {
    console.info("Promotion request received (mock mode):", payload);
    return;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();
  const insertPayload: Database["public"]["Tables"]["promotion_requests"]["Insert"] = {
    status: payload.status,
    organization_name: payload.organizationName,
    contact_name: payload.contactName,
    contact_email: payload.contactEmail,
    contact_phone: payload.contactPhone,
    performance_title: payload.performanceTitle,
    performance_category: payload.performanceCategory ?? null,
    performance_region: payload.performanceRegion ?? null,
    performance_dates: payload.performanceDates ?? null,
    performance_venue: payload.performanceVenue ?? null,
    performance_synopsis: payload.performanceSynopsis ?? null,
    marketing_goals: payload.marketingGoals ?? null,
    marketing_channels: payload.marketingChannels ?? null,
    assets_url: payload.assetsUrl ?? null,
    additional_notes: payload.additionalNotes ?? null,
  };

  const { error } = await supabase.from("promotion_requests").insert(insertPayload);
  if (error) {
    console.error("submitPromotionRequest error", error);
    throw error;
  }
}

/**
 * 공연 종사자의 이벤트 목록 조회 (본인이 등록한 것만)
 */
export const getPartnerCampaigns = cache(async (partnerEmail: string) => {
  if (!isSupabaseConfigured) {
    console.info('[Mock] getPartnerCampaigns:', partnerEmail);
    return mockCampaigns;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ticket_campaigns")
    .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
    .or(`partner_email.eq.${partnerEmail},partner_email.is.null`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPartnerCampaigns error", error);
    throw error;
  }

  return data ?? [];
});

/**
 * 특정 캠페인의 응모자 목록 조회 (권한 검증 포함)
 */
export const getCampaignEntries = cache(async (campaignId: string, partnerEmail: string) => {
  if (!isSupabaseConfigured) {
    console.info('[Mock] getCampaignEntries:', campaignId, partnerEmail);
    return [];
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();

  // 1. 권한 확인: 이 캠페인이 해당 공연 종사자의 것인지 검증
  const { data: campaign } = await supabase
    .from("ticket_campaigns")
    .select("partner_email")
    .eq("id", campaignId)
    .single();

  // partner_email이 null인 캠페인은 관리자가 직접 등록한 것으로 간주 → 모든 파트너 접근 허용
  if (!campaign || (campaign.partner_email !== null && campaign.partner_email !== partnerEmail)) {
    throw new Error("권한이 없습니다.");
  }

  // 2. 응모자 목록 조회
  const { data, error } = await supabase
    .from("ticket_entries")
    .select(TICKET_ENTRY_SELECT)
    .eq("campaign_id", campaignId)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("getCampaignEntries error", error);
    throw error;
  }

  return data ?? [];
});

/**
 * 승인 대기 중인 캠페인 목록 (관리자용)
 */
export const getPendingCampaigns = cache(async () => {
  if (!isSupabaseConfigured) {
    console.info('[Mock] getPendingCampaigns');
    return [];
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ticket_campaigns")
    .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
    .eq("status", "pending_approval")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPendingCampaigns error", error);
    throw error;
  }

  return data ?? [];
});

// ============================================================
// KOPIS DB 조회 (배치 동기화된 데이터만 사용)
// 실시간 KOPIS API 호출 없음 — /api/kopis-sync 배치가 매일 갱신
// ============================================================

/**
 * 전체 공연 목록 (Supabase DB만 조회)
 * KOPIS 공연은 배치 동기화(/api/kopis-sync)로 performances 테이블에 저장됨
 */
export const getAllPerformances = cache(async () => {
  if (!isSupabaseConfigured) {
    return mockPerformances;
  }

  try {
    const supabase = createReadOnlySupabaseClient();
    const { data, error } = await supabase
      .from("performances")
      .select(PERFORMANCE_SELECT)
      .order("period_start", { ascending: false });

    if (error) throw error;
    return data && data.length > 0 ? data : mockPerformances;
  } catch (err) {
    console.error("getAllPerformances error:", err);
    return mockPerformances;
  }
});

/**
 * 장르별 공연 목록 조회
 * /shows/genre/[genre] 큐레이션 페이지에서 사용
 */
export const getPerformancesByGenre = cache(async (categoryValue: string) => {
  if (!isSupabaseConfigured) {
    return mockPerformances.filter((p) => p.category === categoryValue);
  }

  try {
    const supabase = createReadOnlySupabaseClient();
    const { data, error } = await supabase
      .from("performances")
      .select(PERFORMANCE_SELECT)
      .ilike("category", categoryValue)
      .order("is_featured", { ascending: false })
      .order("period_start", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("getPerformancesByGenre error:", err);
    return mockPerformances.filter((p) => p.category === categoryValue);
  }
});

/**
 * 지역별 공연 목록 조회
 * /shows/region/[region] 큐레이션 페이지에서 사용
 */
export const getPerformancesByRegion = cache(async (regionValue: string) => {
  if (!isSupabaseConfigured) {
    return mockPerformances.filter((p) => p.region === regionValue);
  }

  try {
    const supabase = createReadOnlySupabaseClient();
    const { data, error } = await supabase
      .from("performances")
      .select(PERFORMANCE_SELECT)
      .ilike("region", `%${regionValue}%`)
      .order("is_featured", { ascending: false })
      .order("period_start", { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error("getPerformancesByRegion error:", err);
    return mockPerformances.filter((p) => p.region === regionValue);
  }
});

/**
 * KOPIS ID로 공연 상세 조회 (DB에서)
 * events/[slug]/page.tsx 에서 kopis_id로 공연 정보 표시에 사용
 */
export const getPerformanceByKopisId = cache(async (kopisId: string) => {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = createReadOnlySupabaseClient();
    const { data, error } = await supabase
      .from("performances")
      .select(PERFORMANCE_SELECT)
      .eq("kopis_id", kopisId)
      .maybeSingle();

    if (error || !data) return null;

    // events/[slug]/page.tsx의 kopis 객체 형태로 매핑
    return {
      period_start: (data as Record<string, unknown>).period_start as string | null ?? null,
      period_end: (data as Record<string, unknown>).period_end as string | null ?? null,
      venue: (data as Record<string, unknown>).venue as string | null ?? null,
      poster_url: (data as Record<string, unknown>).poster_url as string | null ?? null,
      runtime: (data as Record<string, unknown>).runtime_text as string | null ?? null,
      age_limit: (data as Record<string, unknown>).age_limit as string | null ?? null,
      schedule: (data as Record<string, unknown>).schedule_info as string | null ?? null,
      cast: (data as Record<string, unknown>).cast_info as string | null ?? null,
      crew: (data as Record<string, unknown>).crew_info as string | null ?? null,
      organization: (data as Record<string, unknown>).organization as string | null ?? null,
      price: (data as Record<string, unknown>).price_info as string | null ?? null,
      ticket_link: (data as Record<string, unknown>).ticket_link as string | null ?? null,
      description: (data as Record<string, unknown>).description as string | null ?? null,
    };
  } catch (err) {
    console.error(`getPerformanceByKopisId error (${kopisId}):`, err);
    return null;
  }
});

// ============================================================
// Review queries
// ============================================================

function computeReviewSummary(
  rows: Array<{ rating_overall: number; verified_attendance: boolean; tags: string[] | null }>
): ReviewSummary {
  const total = rows.length;
  if (total === 0) {
    return { avgRating: 0, totalCount: 0, verifiedCount: 0, tagFrequency: {} };
  }
  const avgRating =
    Math.round((rows.reduce((sum, r) => sum + r.rating_overall, 0) / total) * 10) / 10;
  const verifiedCount = rows.filter((r) => r.verified_attendance).length;
  const tagFrequency: Record<string, number> = {};
  for (const row of rows) {
    for (const tag of row.tags ?? []) {
      tagFrequency[tag] = (tagFrequency[tag] ?? 0) + 1;
    }
  }
  return { avgRating, totalCount: total, verifiedCount, tagFrequency };
}

export const getReviewsByPerformance = cache(
  async (
    performanceId: string,
    opts?: { limit?: number; verifiedOnly?: boolean }
  ): Promise<ReviewRow[]> => {
    const limit = opts?.limit ?? 20;
    const verifiedOnly = opts?.verifiedOnly ?? false;

    if (!isSupabaseConfigured) {
      let results = mockReviews.filter(
        (r) => r.performance_id === performanceId && r.status === "published"
      );
      if (verifiedOnly) results = results.filter((r) => r.verified_attendance);
      results = [...results].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return results.slice(0, limit);
    }

    if (!isUuid(performanceId)) {
      let results = mockReviews.filter(
        (r) => r.performance_id === performanceId && r.status === "published"
      );
      if (verifiedOnly) results = results.filter((r) => r.verified_attendance);
      results = [...results].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return results.slice(0, limit);
    }

    try {
      const supabase = createReadOnlySupabaseClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("reviews")
        .select("*")
        .eq("performance_id", performanceId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (verifiedOnly) {
        query = query.eq("verified_attendance", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("getReviewsByPerformance error", error);
        return mockReviews
          .filter((r) => r.performance_id === performanceId && r.status === "published")
          .slice(0, limit);
      }
      return (data as ReviewRow[]) ?? [];
    } catch (err) {
      console.error("getReviewsByPerformance exception", err);
      return [];
    }
  }
);

export const getReviewSummary = cache(async (performanceId: string): Promise<ReviewSummary> => {
  if (!isSupabaseConfigured) {
    const relevant = mockReviews.filter(
      (r) => r.performance_id === performanceId && r.status === "published"
    );
    return computeReviewSummary(relevant);
  }

  if (!isUuid(performanceId)) {
    const relevant = mockReviews.filter(
      (r) => r.performance_id === performanceId && r.status === "published"
    );
    return computeReviewSummary(relevant);
  }

  try {
    const supabase = createReadOnlySupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("reviews")
      .select("rating_overall, verified_attendance, tags")
      .eq("performance_id", performanceId)
      .eq("status", "published");

    if (error) {
      console.error("getReviewSummary error", error);
      const relevant = mockReviews.filter(
        (r) => r.performance_id === performanceId && r.status === "published"
      );
      return computeReviewSummary(relevant);
    }
    return computeReviewSummary(
      (data as Array<{ rating_overall: number; verified_attendance: boolean; tags: string[] | null }>) ?? []
    );
  } catch (err) {
    console.error("getReviewSummary exception", err);
    return { avgRating: 0, totalCount: 0, verifiedCount: 0, tagFrequency: {} };
  }
});

export async function checkReservationForVerification(
  email: string,
  performanceId: string
): Promise<{ verified: boolean; reservationId: string | null }> {
  if (!isSupabaseConfigured) {
    // Mock 모드: @example.com 이메일은 인증된 것으로 처리
    const isVerified = email.endsWith("@example.com");
    return { verified: isVerified, reservationId: isVerified ? "mock-reservation-id" : null };
  }

  try {
    const supabase = await createServerSupabaseClient();
    // ticket_entries → ticket_campaigns JOIN으로 performance_id 매칭
    // 1단계: 해당 performance의 campaign id 목록 조회
    const { data: campaigns, error: campaignError } = await supabase
      .from("ticket_campaigns")
      .select("id")
      .eq("performance_id", performanceId);

    if (campaignError || !campaigns || campaigns.length === 0) {
      return { verified: false, reservationId: null };
    }

    const campaignIds = campaigns.map((c) => c.id);

    // 2단계: 해당 캠페인에 이메일로 응모한 ticket_entries 조회
    const { data: entry, error: entryError } = await supabase
      .from("ticket_entries")
      .select("id")
      .eq("applicant_email", email.trim().toLowerCase())
      .in("campaign_id", campaignIds)
      .maybeSingle();

    if (entryError) {
      console.error("checkReservationForVerification entry error", entryError);
      return { verified: false, reservationId: null };
    }

    if (entry) {
      return { verified: true, reservationId: entry.id };
    }
    return { verified: false, reservationId: null };
  } catch (err) {
    console.error("checkReservationForVerification exception", err);
    return { verified: false, reservationId: null };
  }
}

export const getRecentReviews = cache(
  async (opts?: { limit?: number; verifiedOnly?: boolean }): Promise<ReviewRow[]> => {
    const limit = opts?.limit ?? 20
    const verifiedOnly = opts?.verifiedOnly ?? false

    if (!isSupabaseConfigured) {
      let results = [...mockReviews].filter((r) => r.status === "published")
      if (verifiedOnly) results = results.filter((r) => r.verified_attendance)
      return results
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit)
    }

    try {
      const supabase = createReadOnlySupabaseClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("reviews")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (verifiedOnly) query = query.eq("verified_attendance", true)

      const { data, error } = await query
      if (error) {
        console.error("getRecentReviews error", error)
        return mockReviews.filter((r) => r.status === "published").slice(0, limit)
      }
      return (data as ReviewRow[]) ?? []
    } catch (err) {
      console.error("getRecentReviews exception", err)
      return []
    }
  }
)

export type CampaignSummary = {
  id: string
  slug: string
  title: string
  description: string | null
  reward: string | null
  ends_at: string | null
}

export const getCampaignByPerformanceId = cache(
  async (performanceId: string): Promise<CampaignSummary | null> => {
    if (!isSupabaseConfigured) {
      const found = mockCampaigns.find(
        (c) => (c as unknown as { performance_id?: string }).performance_id === performanceId
      )
      if (!found) return null
      return {
        id: found.id,
        slug: found.slug,
        title: found.title,
        description: found.description ?? null,
        reward: found.reward ?? null,
        ends_at: found.ends_at ?? null,
      }
    }

    if (!isUuid(performanceId)) {
      const found = mockCampaigns.find(
        (c) => (c as unknown as { performance_id?: string }).performance_id === performanceId
      )
      if (!found) return null
      return {
        id: found.id,
        slug: found.slug,
        title: found.title,
        description: found.description ?? null,
        reward: found.reward ?? null,
        ends_at: found.ends_at ?? null,
      }
    }

    try {
      const supabase = createReadOnlySupabaseClient()
      const { data, error } = await supabase
        .from("ticket_campaigns")
        .select("id, slug, title, description, reward, ends_at")
        .eq("performance_id", performanceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error || !data) return null
      return data as CampaignSummary
    } catch (err) {
      console.error("getCampaignByPerformanceId exception", err)
      return null
    }
  }
)

export async function incrementReviewHelpful(reviewId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    const supabase = await createServerSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).rpc("increment_review_helpful", {
      review_id: reviewId,
    });
    if (error) {
      console.error("incrementReviewHelpful error", error);
    }
  } catch (err) {
    console.error("incrementReviewHelpful exception", err);
  }
}

/**
 * KOPIS `entrpsnm`(제작사) 텍스트로 reviews 조회
 * performances.organization 컬럼이 entrpsnm을 저장함
 */
export const getReviewsByOrgName = cache(
  async (
    orgName: string,
    opts?: { limit?: number; verifiedOnly?: boolean }
  ): Promise<ReviewRow[]> => {
    const limit = opts?.limit ?? 50;
    const verifiedOnly = opts?.verifiedOnly ?? false;

    if (!isSupabaseConfigured) {
      // mock: performances.organization 텍스트 매칭
      const perfIds = mockPerformances
        .filter((p) => p.organization === orgName)
        .map((p) => p.id);
      let results = mockReviews.filter(
        (r) => perfIds.includes(r.performance_id) && r.status === "published"
      );
      if (verifiedOnly) results = results.filter((r) => r.verified_attendance);
      results = [...results].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return results.slice(0, limit);
    }

    try {
      const supabase = createReadOnlySupabaseClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("reviews")
        .select("*, performances!inner(organization)")
        .eq("performances.organization", orgName)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (verifiedOnly) {
        query = query.eq("verified_attendance", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("getReviewsByOrgName error", error);
        return [];
      }
      return ((data as ReviewRow[]) ?? []).map((row) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { performances: _p, ...reviewOnly } = row as any;
        return reviewOnly as ReviewRow;
      });
    } catch (err) {
      console.error("getReviewsByOrgName exception", err);
      return [];
    }
  }
);

export const getReviewsByOrganization = cache(
  async (
    organizationId: string,
    opts?: { limit?: number; verifiedOnly?: boolean }
  ): Promise<ReviewRow[]> => {
    const limit = opts?.limit ?? 50;
    const verifiedOnly = opts?.verifiedOnly ?? false;

    if (!isSupabaseConfigured) {
      // 해당 단체의 공연 id 목록 추출
      const perfIds = mockPerformances
        .filter((p) => p.organization_id === organizationId)
        .map((p) => p.id);
      let results = mockReviews.filter(
        (r) => perfIds.includes(r.performance_id) && r.status === "published"
      );
      if (verifiedOnly) results = results.filter((r) => r.verified_attendance);
      results = [...results].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      return results.slice(0, limit);
    }

    try {
      const supabase = createReadOnlySupabaseClient();
      // performances.organization_id 기준으로 reviews를 조인 조회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("reviews")
        .select("*, performances!inner(organization_id)")
        .eq("performances.organization_id", organizationId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (verifiedOnly) {
        query = query.eq("verified_attendance", true);
      }

      const { data, error } = await query;
      if (error) {
        console.error("getReviewsByOrganization error", error);
        return [];
      }
      // 조인 필드 제거하고 ReviewRow만 반환
      return ((data as ReviewRow[]) ?? []).map(({ ...row }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { performances: _p, ...reviewOnly } = row as any;
        return reviewOnly as ReviewRow;
      });
    } catch (err) {
      console.error("getReviewsByOrganization exception", err);
      return [];
    }
  }
);

// ─── SNS 에디터 픽 ────────────────────────────────────────────────────────────

export type SnsPickWithPerformance = {
  id: string
  performance_id: string
  caption: string | null
  channel: string
  display_order: number
  promo_end: string | null
  performance: {
    id: string
    title: string
    slug: string | null
    poster_url: string | null
    region: string | null
    period_start: string | null
    period_end: string | null
    tags: string[] | null
  } | null
}

const SNS_PICK_SELECT = `
  id,
  performance_id,
  caption,
  channel,
  display_order,
  promo_end,
  performances (
    id,
    title,
    slug,
    poster_url,
    region,
    period_start,
    period_end,
    tags
  )
`;

export const getActiveSnsPicksWithPerformances = cache(async (): Promise<SnsPickWithPerformance[]> => {
  if (!isSupabaseConfigured) return [];

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("sns_picks")
    .select(SNS_PICK_SELECT)
    .eq("is_active", true)
    .or("promo_end.is.null,promo_end.gt." + new Date().toISOString())
    .order("display_order", { ascending: true })
    .limit(20);

  if (error) {
    // 테이블이 아직 없는 경우 graceful 처리
    if (error.code === "42P01" || error.code === "42703") {
      console.warn("sns_picks table not found, migration not applied yet");
      return [];
    }
    console.error("getActiveSnsPicksWithPerformances error", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((item: any) => ({
    id: item.id,
    performance_id: item.performance_id,
    caption: item.caption,
    channel: item.channel,
    display_order: item.display_order,
    promo_end: item.promo_end,
    performance: Array.isArray(item.performances) ? item.performances[0] ?? null : item.performances ?? null,
  }));
});

/** 특정 공연의 활성 SNS 픽 1건 조회 — 공연 상세 뱃지 표시용 */
export const getSnsPickForPerformance = cache(async (performanceId: string): Promise<SnsPickWithPerformance | null> => {
  if (!isSupabaseConfigured) return null;

  const supabase = createReadOnlySupabaseClient();
  const { data, error } = await supabase
    .from("sns_picks")
    .select("id, performance_id, caption, channel, display_order, promo_end")
    .eq("performance_id", performanceId)
    .eq("is_active", true)
    .or("promo_end.is.null,promo_end.gt." + new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.code === "42703") return null;
    return null;
  }

  if (!data) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = data as any;
  return {
    id: item.id,
    performance_id: item.performance_id,
    caption: item.caption,
    channel: item.channel,
    display_order: item.display_order,
    promo_end: item.promo_end,
    performance: null,
  };
});











