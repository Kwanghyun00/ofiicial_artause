type CampaignWindow = {
  starts_at?: string | null
  ends_at?: string | null
  performance_id?: string | null
  slug?: string | null
}

export type CampaignLifecycleStatus = "active" | "upcoming" | "closed"

export function getCampaignLifecycleStatus(
  campaign: Pick<CampaignWindow, "starts_at" | "ends_at">,
  now = Date.now()
): CampaignLifecycleStatus {
  const startsAt = parseTimestamp(campaign.starts_at)
  const endsAt = parseTimestamp(campaign.ends_at)

  if (startsAt !== null && startsAt > now) return "upcoming"
  if (endsAt !== null && endsAt < now) return "closed"
  return "active"
}

export function isCampaignActiveNow(
  campaign: Pick<CampaignWindow, "starts_at" | "ends_at">,
  now = Date.now()
) {
  return getCampaignLifecycleStatus(campaign, now) === "active"
}

export function buildActiveCampaignSlugMap<T extends CampaignWindow>(campaigns: T[], now = Date.now()) {
  const campaignByPerformanceId: Record<string, string> = {}

  for (const campaign of campaigns) {
    if (!campaign.performance_id || !campaign.slug || !isCampaignActiveNow(campaign, now)) {
      continue
    }

    if (!campaignByPerformanceId[campaign.performance_id]) {
      campaignByPerformanceId[campaign.performance_id] = campaign.slug
    }
  }

  return campaignByPerformanceId
}

function parseTimestamp(value?: string | null) {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}
