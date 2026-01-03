import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/config";
import {
  mockCampaigns,
  mockCommunityPosts,
  mockOrganizations,
  mockPerformances,
} from "@/lib/mocks/performances";
import { createServerSupabaseClient } from "./server";
import type { Database } from "./types";
import type { PromotionRequestPayload } from "@/lib/models/promotion-request";
import type { PerformanceSubmissionPayload } from "@/lib/models/performance-submission";
import type { TicketEntryPayload } from "@/lib/models/ticket-entry";

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
  tags,
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
      const { data, error } = await supabase
        .from("performances")
        .select(`${PERFORMANCE_SELECT}, ticket_campaigns ( id, slug, performance_id, title, description, reward, starts_at, ends_at, form_link, created_at, updated_at )`)
        .eq("slug", slug)
        .maybeSingle();

      if (!error && data) {
        return data;
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

  const supabase = await createServerSupabaseClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ticket_campaigns")
    .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
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
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("ticket_campaigns")
      .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
      .order("starts_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getTicketCampaigns error", error);
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
    const supabase = await createServerSupabaseClient();
    const fetchCampaign = (field: "id" | "slug", value: string) =>
      supabase
        .from("ticket_campaigns")
        .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
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

  const supabase = await createServerSupabaseClient();
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

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.functions.invoke("campaign-entry-submit", {
    body: payload,
  });

  if (error) {
    console.error("submitTicketEntry error", error);
    throw error;
  }
}
export async function submitPromotionRequest(payload: PromotionRequestPayload) {
  if (!isSupabaseConfigured) {
    console.info("Promotion request received (mock mode):", payload);
    return;
  }

  const supabase = await createServerSupabaseClient();
  const insertPayload: Database["public"]["Tables"]["promotion_requests"]["Insert"] = {
    status: payload.status,
    inquiry_type: payload.inquiryType,
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

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ticket_campaigns")
    .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
    .eq("partner_email", partnerEmail)
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

  const supabase = await createServerSupabaseClient();

  // 1. 권한 확인: 이 캠페인이 해당 공연 종사자의 것인지 검증
  const { data: campaign } = await supabase
    .from("ticket_campaigns")
    .select("partner_email")
    .eq("id", campaignId)
    .single();

  if (!campaign || campaign.partner_email !== partnerEmail) {
    throw new Error("권한이 없습니다.");
  }

  // 2. 응모자 목록 조회
  const { data, error } = await supabase
    .from("ticket_entries")
    .select("*")
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

  const supabase = await createServerSupabaseClient();
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
  fetchRecentPerformances as fetchKopisPerformances,
  fetchPerformanceDetail as fetchKopisDetail,
  mapKopisListToPerformances,
  mapKopisDetailToPerformance,
} from '@/lib/kopis';

/**
 * KOPIS API와 Supabase 데이터를 병합하여 공연 목록 조회
 *
 * KOPIS API가 설정되어 있으면 실시간 공연 데이터를 가져와서
 * Supabase 데이터와 병합합니다.
 */
export const getAllPerformances = cache(async () => {
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
      const kopisData = await fetchAllUpcomingPerformances(10); // 최대 1000개 (10페이지 × 100)
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










