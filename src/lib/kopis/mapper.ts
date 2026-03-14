/**
 * KOPIS API data mapper
 *
 * Maps KOPIS responses to app-friendly performance objects.
 */

import type { KopisPerformanceItem, KopisPerformanceDetail, KopisRelateItem } from "./types";
import { parseKopisDate } from "./parser";

type Performance = {
  id: string;
  slug: string;
  title: string;
  region?: string | null;
  tags?: string[] | null;
  period_start?: string | null;
  period_end?: string | null;
  poster_url?: string | null;
  venue?: string | null;
  description?: string | null;
  runtime?: string | null;
  age_limit?: string | null;
  price?: string | null;
  cast?: string | null;
  crew?: string | null;
  schedule?: string | null;
  state?: string | null;
  openrun?: string | null;
  organization?: string | null;
  images?: string[] | null;
  ticket_link?: string | null;
};

const GENRE_CLASSIC = "\uD074\uB798\uC2DD";
const GENRE_MUSICAL = "\uBBA4\uC9C0\uCEE8";
const GENRE_THEATER = "\uC5F0\uADF9";
const GENRE_DANCE = "\uBB34\uC6A9";
const GENRE_EXHIBITION = "\uC804\uC2DC";
const GENRE_CONCERT = "\uCF58\uC11C\uD2B8";

const REGION_NAMES = [
  "\uC11C\uC6B8",
  "\uBD80\uC0B0",
  "\uB300\uAD6C",
  "\uC778\uCC9C",
  "\uAD11\uC8FC",
  "\uB300\uC804",
  "\uC6B8\uC0B0",
  "\uC138\uC885",
  "\uACBD\uAE30",
  "\uAC15\uC6D0",
  "\uCDA9\uBD81",
  "\uCDA9\uB0A8",
  "\uC804\uBD81",
  "\uC804\uB0A8",
  "\uACBD\uBD81",
  "\uACBD\uB0A8",
  "\uC81C\uC8FC",
];

const BOOKING_SOURCE_KEYWORDS = [
  "예매",
  "티켓",
  "ticket",
  "booking",
  "인터파크",
  "yes24",
  "멜론",
  "티켓링크",
  "네이버",
];

function normalizeGenre(kopisGenre: string): string {
  const genre = kopisGenre.toLowerCase();

  if (genre.includes("\uD074\uB798\uC2DD") || genre.includes("\uC11C\uC591\uC74C\uC545") || genre.includes("\uAD6D\uC545")) {
    return GENRE_CLASSIC;
  }
  if (genre.includes("\uBBA4\uC9C0\uCEE8")) {
    return GENRE_MUSICAL;
  }
  if (genre.includes("\uC5F0\uADF9")) {
    return GENRE_THEATER;
  }
  if (genre.includes("\uBB34\uC6A9") || genre.includes("\uBC1C\uB808")) {
    return GENRE_DANCE;
  }
  if (genre.includes("\uC804\uC2DC") || genre.includes("\uBBF8\uC220")) {
    return GENRE_EXHIBITION;
  }
  if (genre.includes("\uB300\uC911\uC74C\uC545") || genre.includes("\uCF58\uC11C\uD2B8")) {
    return GENRE_CONCERT;
  }

  return kopisGenre;
}

export function mapKopisItemToPerformance(item: KopisPerformanceItem): Performance {
  if (!item?.mt20id || !item?.prfnm) {
    throw new Error("Invalid KOPIS item: missing required fields");
  }

  return {
    id: item.mt20id,
    slug: createSlug(item.prfnm, item.mt20id),
    title: item.prfnm || "\uC81C\uBAA9 \uC5C6\uC74C",
    region: item.area || (item.fcltynm ? extractRegion(item.fcltynm) : null),
    tags: item.genrenm ? [normalizeGenre(item.genrenm)] : null,
    period_start: item.prfpdfrom ? parseKopisDate(item.prfpdfrom) : null,
    period_end: item.prfpdto ? parseKopisDate(item.prfpdto) : null,
    poster_url: item.poster || null,
    venue: item.fcltynm || null,
    state: item.prfstate || null,
    openrun: item.openrun || null,
  };
}

export function mapKopisDetailToPerformance(detail: KopisPerformanceDetail): Performance {
  if (!detail?.mt20id || !detail?.prfnm) {
    throw new Error("Invalid KOPIS detail: missing required fields");
  }

  return {
    id: detail.mt20id,
    slug: createSlug(detail.prfnm, detail.mt20id),
    title: detail.prfnm || "\uC81C\uBAA9 \uC5C6\uC74C",
    region: detail.area || (detail.fcltynm ? extractRegion(detail.fcltynm) : null),
    tags: detail.genrenm ? [normalizeGenre(detail.genrenm)] : null,
    period_start: detail.prfpdfrom ? parseKopisDate(detail.prfpdfrom) : null,
    period_end: detail.prfpdto ? parseKopisDate(detail.prfpdto) : null,
    poster_url: detail.poster || null,
    venue: detail.fcltynm || null,
    description: detail.sty || null,
    runtime: detail.prfruntime || null,
    age_limit: detail.prfage || null,
    price: detail.pcseguidance || null,
    cast: detail.prfcast || null,
    crew: detail.prfcrew || null,
    schedule: detail.dtguidance || null,
    state: detail.prfstate || null,
    openrun: detail.openrun || null,
    organization: detail.entrpsnm || null,
    images: detail.styurls?.styurl
      ? Array.isArray(detail.styurls.styurl)
        ? detail.styurls.styurl
        : [detail.styurls.styurl]
      : null,
    ticket_link: extractKopisTicketLink(detail.relates),
  };
}

function extractKopisTicketLink(relates?: KopisPerformanceDetail["relates"]): string | null {
  if (!relates?.relate) {
    return null;
  }

  const entries = Array.isArray(relates.relate) ? relates.relate : [relates.relate];
  const links = entries
    .map((entry) => normalizeRelate(entry))
    .filter((entry): entry is { name: string; url: string } => Boolean(entry && entry.url));

  if (!links.length) {
    return null;
  }

  const preferred = links.find((entry) =>
    BOOKING_SOURCE_KEYWORDS.some((keyword) => entry.name.toLowerCase().includes(keyword.toLowerCase()))
  );

  return preferred?.url ?? links[0].url;
}

function normalizeRelate(entry: KopisRelateItem | undefined): { name: string; url: string } | null {
  if (!entry) {
    return null;
  }

  const name = typeof entry.relatenm === "string" ? entry.relatenm.trim() : "";
  const url = typeof entry.relateurl === "string" ? entry.relateurl.trim() : "";
  if (!/^https?:\/\//i.test(url)) {
    return null;
  }

  return { name, url };
}

function createSlug(title: string, id: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s\uAC00-\uD7A3]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);

  return `${titleSlug}-${id}`;
}

function extractRegion(facilityName: string | null | undefined): string | null {
  if (!facilityName || typeof facilityName !== "string") {
    return null;
  }

  const regionMatch = facilityName.match(/\[(.*?)\]/);
  if (regionMatch && regionMatch[1]) {
    const parts = regionMatch[1].split(" ");
    return parts[0] || null;
  }

  for (const region of REGION_NAMES) {
    if (facilityName.includes(region)) {
      return region;
    }
  }

  return null;
}

export function mapKopisListToPerformances(items: KopisPerformanceItem[]): Performance[] {
  if (!Array.isArray(items)) {
    console.warn("mapKopisListToPerformances: items is not an array");
    return [];
  }

  return items
    .filter((item) => {
      if (!item?.mt20id || !item?.prfnm) {
        console.warn("Skipping invalid KOPIS item:", item);
        return false;
      }
      return true;
    })
    .map((item) => {
      try {
        return mapKopisItemToPerformance(item);
      } catch (error) {
        console.error("Error mapping KOPIS item:", error, item);
        return null;
      }
    })
    .filter((item): item is Performance => item !== null);
}
