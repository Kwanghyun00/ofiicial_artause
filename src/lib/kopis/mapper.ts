import type {
  KopisPerformanceDetail,
  KopisPerformanceItem,
  KopisRelateItem,
} from "./types";
import { parseKopisDate } from "./parser";

type KopisLink = {
  name: string;
  url: string;
};

type KopisSectionMap = Record<string, string | string[] | null>;

type Performance = {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  status?: string | null;
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
  facility_id?: string | null;
  kopis_sections?: {
    performanceList: KopisSectionMap | null;
    performanceDetail: KopisSectionMap | null;
    facilityList: KopisSectionMap | null;
    facilityDetail: KopisSectionMap | null;
    producerList: KopisSectionMap[] | null;
    awardList: KopisSectionMap[] | null;
    festivalList: KopisSectionMap[] | null;
    creatorList: KopisSectionMap | null;
  } | null;
};

const GENRE_CLASSIC = "클래식";
const GENRE_MUSICAL = "뮤지컬";
const GENRE_THEATER = "연극";
const GENRE_DANCE = "무용";
const GENRE_EXHIBITION = "전시";
const GENRE_CONCERT = "콘서트";

const REGION_NAMES = [
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
  "경기",
  "강원",
  "충북",
  "충남",
  "전북",
  "전남",
  "경북",
  "경남",
  "제주",
];

const BOOKING_SOURCE_KEYWORDS = [
  "예매",
  "티켓",
  "ticket",
  "booking",
  "인터파크",
  "yes24",
  "멜론",
  "예약",
  "네이버",
];

function normalizeGenre(kopisGenre: string): string {
  const genre = kopisGenre.toLowerCase();

  if (genre.includes("클래식") || genre.includes("서양음악") || genre.includes("국악")) {
    return GENRE_CLASSIC;
  }
  if (genre.includes("뮤지컬")) {
    return GENRE_MUSICAL;
  }
  if (genre.includes("연극")) {
    return GENRE_THEATER;
  }
  if (genre.includes("무용") || genre.includes("발레")) {
    return GENRE_DANCE;
  }
  if (genre.includes("전시") || genre.includes("미술")) {
    return GENRE_EXHIBITION;
  }
  if (genre.includes("대중음악") || genre.includes("콘서트")) {
    return GENRE_CONCERT;
  }

  return kopisGenre;
}

function mapKopisStateToStatus(rawState?: string | null): string {
  const state = (rawState ?? "").toLowerCase();

  if (state.includes("03") || state.includes("완료") || state.includes("종료")) {
    return "completed";
  }
  if (state.includes("01") || state.includes("예정")) {
    return "scheduled";
  }

  return "ongoing";
}

export function mapKopisItemToPerformance(item: KopisPerformanceItem): Performance {
  if (!item?.mt20id || !item?.prfnm) {
    throw new Error("Invalid KOPIS item: missing required fields");
  }

  const category = item.genrenm ? normalizeGenre(item.genrenm) : null;

  return {
    id: item.mt20id,
    slug: createSlug(item.prfnm, item.mt20id),
    title: item.prfnm || "제목 없음",
    category,
    status: mapKopisStateToStatus(item.prfstate),
    region: item.area || (item.fcltynm ? extractRegion(item.fcltynm) : null),
    tags: category ? [category] : null,
    period_start: item.prfpdfrom ? parseKopisDate(item.prfpdfrom) : null,
    period_end: item.prfpdto ? parseKopisDate(item.prfpdto) : null,
    poster_url: item.poster || null,
    venue: item.fcltynm || null,
    state: item.prfstate || null,
    openrun: item.openrun || null,
    kopis_sections: buildListSections(item, category),
  };
}

export function mapKopisDetailToPerformance(detail: KopisPerformanceDetail): Performance {
  if (!detail?.mt20id || !detail?.prfnm) {
    throw new Error("Invalid KOPIS detail: missing required fields");
  }

  const category = detail.genrenm ? normalizeGenre(detail.genrenm) : null;
  const images = normalizeDetailImages(detail.styurls?.styurl);
  const links = extractKopisLinks(detail.relates);

  return {
    id: detail.mt20id,
    slug: createSlug(detail.prfnm, detail.mt20id),
    title: detail.prfnm || "제목 없음",
    category,
    status: mapKopisStateToStatus(detail.prfstate),
    region: detail.area || (detail.fcltynm ? extractRegion(detail.fcltynm) : null),
    tags: category ? [category] : null,
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
    images,
    ticket_link: pickPreferredTicketLink(links),
    facility_id: detail.mt10id || null,
    kopis_sections: buildDetailSections(detail, category, images, links),
  };
}

function buildListSections(
  item: KopisPerformanceItem,
  category: string | null
): Performance["kopis_sections"] {
  return {
    performanceList: {
      공연ID: item.mt20id,
      공연명: item.prfnm || null,
      장르: category,
      지역: item.area ?? null,
      공연장: item.fcltynm || null,
      시작일: item.prfpdfrom ? parseKopisDate(item.prfpdfrom) : null,
      종료일: item.prfpdto ? parseKopisDate(item.prfpdto) : null,
      상태: item.prfstate || null,
      오픈런: item.openrun || null,
      포스터: item.poster || null,
    },
    performanceDetail: null,
    facilityList: {
      공연장명: item.fcltynm || null,
      지역: item.area ?? null,
    },
    facilityDetail: null,
    producerList: null,
    awardList: null,
    festivalList: null,
    creatorList: null,
  };
}

function buildDetailSections(
  detail: KopisPerformanceDetail,
  category: string | null,
  images: string[] | null,
  links: KopisLink[]
): Performance["kopis_sections"] {
  return {
    performanceList: {
      공연ID: detail.mt20id,
      공연명: detail.prfnm || null,
      장르: category,
      지역: detail.area ?? null,
      공연장: detail.fcltynm || null,
      시작일: detail.prfpdfrom ? parseKopisDate(detail.prfpdfrom) : null,
      종료일: detail.prfpdto ? parseKopisDate(detail.prfpdto) : null,
      상태: detail.prfstate || null,
      오픈런: detail.openrun || null,
      포스터: detail.poster || null,
    },
    performanceDetail: {
      소개: detail.sty || null,
      공연시간: detail.dtguidance || null,
      러닝타임: detail.prfruntime || null,
      관람연령: detail.prfage || null,
      가격정보: detail.pcseguidance || null,
      관련링크: links.length ? links.map((link) => `${link.name || "링크"}: ${link.url}`) : null,
      상세이미지: images,
    },
    facilityList: {
      시설ID: detail.mt10id || null,
      공연장명: detail.fcltynm || null,
      지역: detail.area ?? null,
    },
    facilityDetail: {
      시설ID: detail.mt10id || null,
      공연장명: detail.fcltynm || null,
      지역: detail.area ?? null,
    },
    producerList: detail.entrpsnm ? [{ 기획제작사: detail.entrpsnm }] : null,
    awardList: null,
    festivalList: null,
    creatorList: {
      출연진: detail.prfcast || null,
      제작진: detail.prfcrew || null,
    },
  };
}

function normalizeDetailImages(images?: string | string[] | null): string[] | null {
  if (!images) {
    return null;
  }

  const array = Array.isArray(images) ? images : [images];
  const normalized = array
    .map((image) => (typeof image === "string" ? image.trim() : ""))
    .filter(Boolean);

  return normalized.length ? normalized : null;
}

function extractKopisLinks(relates?: KopisPerformanceDetail["relates"]): KopisLink[] {
  if (!relates?.relate) {
    return [];
  }

  const entries = Array.isArray(relates.relate) ? relates.relate : [relates.relate];

  return entries
    .map((entry) => normalizeRelate(entry))
    .filter((entry): entry is KopisLink => Boolean(entry));
}

function pickPreferredTicketLink(links: KopisLink[]): string | null {
  if (!links.length) {
    return null;
  }

  const preferred = links.find((entry) =>
    BOOKING_SOURCE_KEYWORDS.some((keyword) => entry.name.toLowerCase().includes(keyword.toLowerCase()))
  );

  return preferred?.url ?? links[0].url;
}

function normalizeRelate(entry: KopisRelateItem | undefined): KopisLink | null {
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
    .replace(/[^\w\s\uac00-\ud7a3]/g, "")
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
