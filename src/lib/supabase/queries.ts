import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import {
  mockCampaigns,
  mockCommunityPosts,
  mockOrganizations,
  mockPerformances,
  mockReviews,
} from "@/lib/mocks/performances";
import { createAdminSupabaseClient, createServerSupabaseClient } from "./server";
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
  algorithm_version,
  config,
  snapshot_seed,
  last_draw_at,
  ticket_purchase_url,
  approved_at,
  approved_by,
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
  approved_at,
  approved_by,
  available_dates,
  performance_period_start,
  performance_period_end,
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

const SHOWS_KOPIS_LINK_ENRICH_LIMIT = readPositiveIntEnv("SHOWS_KOPIS_LINK_ENRICH_LIMIT", 120);
const KOPIS_DETAIL_BATCH_SIZE = readPositiveIntEnv("SHOWS_KOPIS_DETAIL_BATCH_SIZE", 5);

function readPositiveIntEnv(key: string, fallback: number) {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

export const getOrganizations = cache(async () => {
  if (!isSupabaseConfigured) {
    return [...mockOrganizations].sort((a, b) => b.follower_count - a.follower_count);
  }

  const supabase = await createServerSupabaseClient();
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

  if (!isSupabaseConfigured) {
    return mockOrganizations.find((organization) => organization.slug === slug) ?? null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .select(ORGANIZATION_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getOrganizationBySlug error", error);
    throw error;
  }

  return data ?? null;
});


export const getCommunityPosts = cache(async () => {
  if (!isSupabaseConfigured) {
    return [...mockCommunityPosts].sort((a, b) => {
      const aTime = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bTime = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bTime - aTime;
    });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCommunityPosts error", error);
    throw error;
  }

  return data ?? [];
});

export const getCommunityPostBySlug = cache(async (slug: string) => {
  if (!isSupabaseConfigured) {
    return mockCommunityPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("community_posts")
    .select(COMMUNITY_POST_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getCommunityPostBySlug error", error);
    throw error;
  }

  return data;
});

export const getPerformancesByOrganization = cache(async (organizationId: string) => {
  if (!isSupabaseConfigured) {
    return mockPerformances.filter((item) => item.organization_id === organizationId);
  }

  const supabase = await createServerSupabaseClient();
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performances: any[] = [];

  // 1. Supabase featured performances
  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("performances")
        .select(PERFORMANCE_SELECT)
        .eq("is_featured", true)
        .order("period_start", { ascending: true });

      if (!error && data) {
        performances.push(...data);
      }
    } catch (err) {
      console.error("getFeaturedPerformances exception", err);
    }
  }

  // 2. KOPIS 최신 공연 추가 (featured가 부족한 경우)
  if (performances.length < 12 && isKopisConfigured()) {
    try {
      const { fetchRecentPerformances: fetchKopisPerformances, mapKopisListToPerformances } = await import('@/lib/kopis');
      const kopisData = await fetchKopisPerformances(20);
      const mappedKopis = mapKopisListToPerformances(kopisData);

      const existingIds = new Set(performances.map(p => p.id));
      const newKopisPerformances = mappedKopis
        .filter(p => !existingIds.has(p.id))
        .slice(0, 12 - performances.length);

      performances.push(...newKopisPerformances);

      console.log(`✅ getFeaturedPerformances: Added ${newKopisPerformances.length} KOPIS performances`);
    } catch (err) {
      console.error("Failed to fetch KOPIS performances:", err);
    }
  }

  // 3. Mock fallback
  if (performances.length === 0) {
    return mockPerformances.filter((item) => item.is_featured);
  }

  return performances;
});

type PerformanceWithOptionalTicketLink = {
  id?: string | null;
  ticket_link?: string | null;
};

const isKopisPerformanceId = (value: unknown): value is string =>
  typeof value === "string" && value.startsWith("PF");

async function enrichKopisTicketLinks<T extends PerformanceWithOptionalTicketLink>(performances: T[]): Promise<T[]> {
  if (!isKopisConfigured() || performances.length === 0) {
    return performances;
  }

  const targets = performances
    .filter((performance) => isKopisPerformanceId(performance.id) && !performance.ticket_link)
    .slice(0, SHOWS_KOPIS_LINK_ENRICH_LIMIT);

  if (targets.length === 0) {
    return performances;
  }

  const ticketLinks = new Map<string, string>();
  const [firstTarget, ...restTargets] = targets;

  if (isKopisPerformanceId(firstTarget.id)) {
    try {
      const detail = await fetchKopisDetail(firstTarget.id);
      const mapped = mapKopisDetailToPerformance(detail) as { ticket_link?: string | null };
      if (mapped.ticket_link) {
        ticketLinks.set(firstTarget.id, mapped.ticket_link);
      }
    } catch {
      return performances;
    }
  }

  for (let i = 0; i < restTargets.length; i += KOPIS_DETAIL_BATCH_SIZE) {
    const batch = restTargets.slice(i, i + KOPIS_DETAIL_BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (performance) => {
        if (!isKopisPerformanceId(performance.id)) {
          return null;
        }

        try {
          const detail = await fetchKopisDetail(performance.id);
          const mapped = mapKopisDetailToPerformance(detail) as { ticket_link?: string | null };
          return mapped.ticket_link ? { id: performance.id, link: mapped.ticket_link } : null;
        } catch {
          return null;
        }
      }),
    );

    for (const result of results) {
      if (result) {
        ticketLinks.set(result.id, result.link);
      }
    }
  }

  if (ticketLinks.size === 0) {
    return performances;
  }

  return performances.map((performance) => {
    if (!isKopisPerformanceId(performance.id)) {
      return performance;
    }
    const ticketLink = ticketLinks.get(performance.id);
    if (!ticketLink) {
      return performance;
    }
    return { ...performance, ticket_link: ticketLink };
  });
}

export const getShowsPerformances = cache(async () => {
  const performances = await getAllPerformances();
  const head = performances.slice(0, SHOWS_KOPIS_LINK_ENRICH_LIMIT);
  const tail = performances.slice(SHOWS_KOPIS_LINK_ENRICH_LIMIT);
  const enrichedHead = await enrichKopisTicketLinks(head);
  return [...enrichedHead, ...tail];
});

export const getRecentPerformances = cache(async () => {
  if (!isSupabaseConfigured) {
    return mockPerformances;
  }

  const supabase = await createServerSupabaseClient();
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
  // 1. Supabase에서 조회
  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: performance, error } = await supabase
        .from("performances")
        .select(PERFORMANCE_SELECT)
        .eq("slug", slug)
        .maybeSingle();

      if (!error && performance) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: campaigns, error: campaignsError } = await (supabase as any)
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

  // 2. KOPIS 데이터에서 조회 (slug 형식: "title-mt20id")
  if (isKopisConfigured()) {
    try {
      // slug에서 KOPIS ID 추출
      const kopisId = slug.split('-').pop();
      if (kopisId && kopisId.startsWith('PF')) {
        const { fetchPerformanceDetail, mapKopisDetailToPerformance } = await import('@/lib/kopis');
        const kopisDetail = await fetchPerformanceDetail(kopisId);
        const mapped = mapKopisDetailToPerformance(kopisDetail);

        console.log(`✅ Found KOPIS performance: ${mapped.title} (${kopisId})`);

        return {
          ...mapped,
          ticket_campaigns: [], // KOPIS 공연은 초대권 캠페인 없음
        };
      }
    } catch (err) {
      console.error("getPerformanceBySlug KOPIS error", err);
    }
  }

  // 3. Mock 데이터 fallback
  const performance = mockPerformances.find((item) => item.slug === slug);
  if (!performance) return null;
  const campaigns = mockCampaigns.filter((item) => item.performance_id === performance.id);
  return { ...performance, ticket_campaigns: campaigns };
});

export const getActiveTicketCampaigns = cache(async () => {
  if (!isSupabaseConfigured) {
    return mockCampaigns;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();
  const now = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
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
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminSupabaseClient()
      : await createServerSupabaseClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
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
  if (!isSupabaseConfigured) {
    const campaign = mockCampaigns.find((item) => item.slug === identifier || item.id === identifier);
    return campaign ?? null;
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminSupabaseClient()
      : await createServerSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCampaign = (field: "id" | "slug", value: string) =>
      (supabase as any)
        .from("public_ticket_campaigns")
        .select(PUBLIC_TICKET_CAMPAIGN_SELECT)
        .eq(field, value)
        .maybeSingle();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let { data, error } = await fetchCampaign(isUuid ? "id" : "slug", identifier);

    if (!data && !error && !isUuid) {
      const fallback = await fetchCampaign("id", identifier);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("getTicketCampaignBySlug error", error);
      // Fallback to mock data on error
      const campaign = mockCampaigns.find((item) => item.slug === identifier || item.id === identifier);
      return campaign ?? null;
    }

    return data ?? null;
  } catch (err) {
    console.error("getTicketCampaignBySlug exception", err);
    // Fallback to mock data on exception
    const campaign = mockCampaigns.find((item) => item.slug === identifier || item.id === identifier);
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
export async function submitTicketEntry(payload: TicketEntryPayload) {
  if (!isSupabaseConfigured) {
    console.info("Ticket entry received (mock mode):", payload);
    return;
  }

  const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createAdminSupabaseClient()
    : await createServerSupabaseClient();

  let edgeFnError: unknown = null;
  try {
    const { error } = await supabase.functions.invoke("campaign-entry-submit", {
      body: payload,
    });
    if (!error) return;
    edgeFnError = error;
  } catch (invokeErr) {
    edgeFnError = invokeErr;
  }

  console.warn("campaign-entry-submit edge function unavailable, falling back to direct insert:", edgeFnError);

  // Fallback: store minimal entry data when the edge function is unavailable or not authorized.
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
    console.error("submitTicketEntry error", edgeFnError, insertError);
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
// KOPIS API 통합 (공연예술통합전산망)
// ============================================================

import {
  isKopisConfigured,
  fetchPerformanceDetail as fetchKopisDetail,
  mapKopisDetailToPerformance,
} from '@/lib/kopis';

/**
 * KOPIS API와 Supabase 데이터를 병합하여 공연 목록 조회
 *
 * KOPIS API가 설정되어 있으면 실시간 공연 데이터를 가져와서
 * Supabase 데이터와 병합합니다.
 */
export const getAllPerformances = cache(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const performances: any[] = [];

  // 1. Supabase 데이터 가져오기
  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data, error } = await supabase
        .from("performances")
        .select(PERFORMANCE_SELECT)
        .order("period_start", { ascending: false });

      if (!error && data) {
        performances.push(...data);
      }
    } catch (err) {
      console.error("Failed to fetch Supabase performances:", err);
    }
  }

  // 2. KOPIS API 데이터 가져오기 (모든 공연)
  if (isKopisConfigured()) {
    try {
      const { fetchAllUpcomingPerformances, mapKopisListToPerformances } = await import('@/lib/kopis');
      const [theaterData, musicalData] = await Promise.all([
        fetchAllUpcomingPerformances(5, 'AAAA'), // 연극
        fetchAllUpcomingPerformances(5, 'BBBC'), // 뮤지컬
      ]);
      const kopisData = [...theaterData, ...musicalData];
      const mappedKopis = mapKopisListToPerformances(kopisData);

      // KOPIS 데이터를 Supabase 데이터와 병합 (중복 제거)
      const existingIds = new Set(performances.map(p => p.id));
      const newKopisPerformances = mappedKopis.filter(p => !existingIds.has(p.id));

      performances.push(...newKopisPerformances);

      console.log(`✅ getAllPerformances: Merged ${newKopisPerformances.length} KOPIS performances with ${performances.length - newKopisPerformances.length} Supabase performances`);
    } catch (err) {
      console.error("Failed to fetch KOPIS performances:", err);
    }
  }

  // 3. Mock 데이터 fallback
  if (performances.length === 0) {
    return mockPerformances;
  }

  return performances;
});

/**
 * KOPIS API에서 공연 상세 정보 조회 (KOPIS ID로)
 *
 * @param kopisId - KOPIS 공연 ID (mt20id)
 */
export const getPerformanceFromKopis = cache(async (kopisId: string) => {
  if (!isKopisConfigured()) {
    console.warn("KOPIS API is not configured");
    return null;
  }

  try {
    const kopisDetail = await fetchKopisDetail(kopisId);
    return mapKopisDetailToPerformance(kopisDetail);
  } catch (err) {
    console.error(`Failed to fetch KOPIS performance ${kopisId}:`, err);
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

    try {
      const supabase = await createServerSupabaseClient();
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

  try {
    const supabase = await createServerSupabaseClient();
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
      const supabase = await createServerSupabaseClient()
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

    try {
      const supabase = await createServerSupabaseClient()
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
      const supabase = await createServerSupabaseClient();
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
      const supabase = await createServerSupabaseClient();
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











