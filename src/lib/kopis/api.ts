import {
  formatDateForKopis,
  parsePerformanceDetail,
  parsePerformanceList,
} from './parser';
import type {
  KopisListParams,
  KopisPerformanceDetail,
  KopisPerformanceItem,
} from './types';

const KOPIS_BASE_URL = 'http://www.kopis.or.kr/openApi/restful';
const KOPIS_MAX_ROWS_PER_PAGE = 100;
const KOPIS_REVALIDATE_SECONDS = readPositiveIntEnv('KOPIS_REVALIDATE_SECONDS', 120);

function readPositiveIntEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

function getDefaultUpcomingMaxPages(): number {
  return readPositiveIntEnv('KOPIS_MAX_UPCOMING_PAGES', 30);
}

function normalizePositiveInt(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isFinite(value)) return undefined;

  return Math.max(0, Math.floor(value));
}

function getServiceKey(): string {
  const key = process.env.KOPIS_SERVICE_KEY;
  if (!key) {
    throw new Error('KOPIS_SERVICE_KEY environment variable is not set');
  }

  return key;
}

export function isKopisConfigured(): boolean {
  return !!process.env.KOPIS_SERVICE_KEY;
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
}

type FetchPerformancePagesOptions = {
  maxPages?: number;
  totalRows?: number;
  rowsPerPage?: number;
  continueOnError?: boolean;
};

async function fetchPerformancePages(
  baseParams: Omit<KopisListParams, 'cpage' | 'rows'>,
  options: FetchPerformancePagesOptions = {}
): Promise<KopisPerformanceItem[]> {
  const requestedRows = normalizePositiveInt(options.totalRows);
  if (requestedRows === 0) {
    return [];
  }

  const rowsPerPage = Math.min(
    normalizePositiveInt(options.rowsPerPage) ?? KOPIS_MAX_ROWS_PER_PAGE,
    KOPIS_MAX_ROWS_PER_PAGE
  );
  if (rowsPerPage <= 0) {
    return [];
  }

  const maxPages = Math.max(
    1,
    normalizePositiveInt(options.maxPages) ??
      (requestedRows ? Math.ceil(requestedRows / rowsPerPage) : getDefaultUpcomingMaxPages())
  );

  const allPerformances: KopisPerformanceItem[] = [];
  let lastPageSize = 0;

  for (let page = 1; page <= maxPages; page++) {
    const remainingRows =
      requestedRows === undefined ? rowsPerPage : requestedRows - allPerformances.length;
    if (remainingRows <= 0) {
      break;
    }

    const currentRows = Math.min(rowsPerPage, remainingRows);

    try {
      const performances = await fetchPerformanceList({
        ...baseParams,
        cpage: page,
        rows: currentRows,
      });

      allPerformances.push(...performances);
      lastPageSize = performances.length;

      if (performances.length < currentRows) {
        break;
      }
    } catch (error) {
      console.error(`Failed to fetch page ${page}:`, error);

      if (!options.continueOnError) {
        throw error;
      }

      break;
    }
  }

  if (
    requestedRows === undefined &&
    allPerformances.length > 0 &&
    allPerformances.length >= maxPages * rowsPerPage &&
    lastPageSize === rowsPerPage
  ) {
    console.warn(
      `KOPIS page fetch stopped at configured limit (${maxPages} pages x ${rowsPerPage} rows). Increase KOPIS_MAX_UPCOMING_PAGES if more data is expected.`
    );
  }

  return requestedRows === undefined ? allPerformances : allPerformances.slice(0, requestedRows);
}

export async function fetchPerformanceList(
  params: KopisListParams
): Promise<KopisPerformanceItem[]> {
  try {
    const serviceKey = getServiceKey();

    const queryString = buildQueryString({
      service: serviceKey,
      stdate: params.stdate,
      eddate: params.eddate,
      cpage: params.cpage ?? 1,
      rows: Math.min(params.rows ?? 10, KOPIS_MAX_ROWS_PER_PAGE),
      shcate: params.shcate,
      signgucode: params.signgucode,
      signgucodesub: params.signgucodesub,
      kidstate: params.kidstate,
      prfstate: params.prfstate,
    });

    const url = `${KOPIS_BASE_URL}/pblprfr?${queryString}`;

    console.log('Fetching KOPIS performance list:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
    let response: Response;
    const requestInit: RequestInit & { next: { revalidate: number } } = {
      signal: controller.signal,
      next: { revalidate: KOPIS_REVALIDATE_SECONDS },
    };

    try {
      response = await fetch(url, requestInit);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`KOPIS API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parsed = parsePerformanceList(xmlText);

    return parsed.dbs.db || [];
  } catch (error) {
    console.error('Failed to fetch KOPIS performance list:', error);
    throw error;
  }
}

export async function fetchPerformanceDetail(
  performanceId: string
): Promise<KopisPerformanceDetail> {
  try {
    const serviceKey = getServiceKey();
    const url = `${KOPIS_BASE_URL}/pblprfr/${performanceId}?service=${serviceKey}`;

    console.log('Fetching KOPIS performance detail:', url);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);
    let response: Response;
    const requestInit: RequestInit & { next: { revalidate: number } } = {
      signal: controller.signal,
      next: { revalidate: KOPIS_REVALIDATE_SECONDS },
    };

    try {
      response = await fetch(url, requestInit);
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      throw new Error(`KOPIS API error: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    const parsed = parsePerformanceDetail(xmlText);

    return parsed.db;
  } catch (error) {
    console.error('Failed to fetch KOPIS performance detail:', error);
    throw error;
  }
}

export async function fetchRecentPerformances(
  rows: number = 20
): Promise<KopisPerformanceItem[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 30);

  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 90);

  return fetchPerformancePages(
    {
      stdate: formatDateForKopis(startDate),
      eddate: formatDateForKopis(endDate),
      prfstate: '02',
    },
    {
      totalRows: rows,
    }
  );
}

export async function fetchAllUpcomingPerformances(
  shcate?: string,
  maxPages?: number
): Promise<KopisPerformanceItem[]> {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 365);

  const allPerformances = await fetchPerformancePages(
    {
      stdate: formatDateForKopis(startDate),
      eddate: formatDateForKopis(endDate),
      shcate,
    },
    {
      maxPages,
      rowsPerPage: KOPIS_MAX_ROWS_PER_PAGE,
      continueOnError: true,
    }
  );

  console.log(
    `Fetched ${allPerformances.length} performances from KOPIS (genre: ${shcate ?? 'all'}, ${maxPages ?? getDefaultUpcomingMaxPages()} pages max)`
  );

  return allPerformances;
}

export async function fetchPerformancesByGenre(
  genreCode: string,
  rows: number = 20
): Promise<KopisPerformanceItem[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 30);

  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 90);

  return fetchPerformancePages(
    {
      stdate: formatDateForKopis(startDate),
      eddate: formatDateForKopis(endDate),
      shcate: genreCode,
    },
    {
      totalRows: rows,
    }
  );
}
