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

const TICKET_CAMPAIGN_SELECT = `
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
  updated_at
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
  performances (
    id,
    slug,
    title,
    poster_url,
    organization_id
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
  if (!isSupabaseConfigured) {
    return mockPerformances.filter((item) => item.is_featured);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("performances")
    .select(PERFORMANCE_SELECT)
    .eq("is_featured", true)
    .order("period_start", { ascending: true });

  if (error) {
    console.error("getFeaturedPerformances error", error);
    throw error;
  }

  return data ?? [];
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
  if (!isSupabaseConfigured) {
    const performance = mockPerformances.find((item) => item.slug === slug);
    if (!performance) return null;
    const campaigns = mockCampaigns.filter((item) => item.performance_id === performance.id);
    return { ...performance, ticket_campaigns: campaigns };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("performances")
    .select(`${PERFORMANCE_SELECT}, ticket_campaigns ( id, slug, performance_id, title, description, reward, starts_at, ends_at, form_link, created_at, updated_at )`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getPerformanceBySlug error", error);
    throw error;
  }

  return data;
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

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("ticket_campaigns")
    .select(TICKET_CAMPAIGN_WITH_PERFORMANCE_SELECT)
    .order("starts_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getTicketCampaigns error", error);
    throw error;
  }

  return data ?? [];
});
export const getTicketCampaignBySlug = cache(async (identifier: string) => {
  if (!isSupabaseConfigured) {
    const campaign = mockCampaigns.find((item) => item.slug === identifier || item.id === identifier);
    return campaign ?? null;
  }

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
    throw error;
  }

  return data ?? null;
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
  const insertPayload: Database["public"]["Tables"]["ticket_entries"]["Insert"] = {
    campaign_id: payload.campaignId,
    applicant_name: payload.applicantName,
    applicant_email: payload.applicantEmail,
    applicant_phone: payload.applicantPhone ?? null,
    answers: payload.answers ?? null,
    consent_marketing: payload.consentMarketing,
  };

  const { error } = await supabase.from("ticket_entries").insert(insertPayload);
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












