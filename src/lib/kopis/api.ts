/**
 * KOPIS API 클라이언트
 *
 * 공연예술통합전산망(KOPIS) Open API를 호출하는 함수들을 제공합니다.
 *
 * API 문서: http://www.kopis.or.kr/por/cs/openapi/openApiList.do
 */

import {
  parsePerformanceList,
  parsePerformanceDetail,
  formatDateForKopis,
} from './parser';
import type {
  KopisListParams,
  KopisPerformanceItem,
  KopisPerformanceDetail,
} from './types';

/**
 * KOPIS API 기본 URL
 */
const KOPIS_BASE_URL = 'http://www.kopis.or.kr/openApi/restful';
const KOPIS_REVALIDATE_SECONDS = readPositiveIntEnv("KOPIS_REVALIDATE_SECONDS", 120);

function readPositiveIntEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  return parsed;
}

/**
 * 환경변수에서 서비스 키 가져오기
 */
function getServiceKey(): string {
  const key = process.env.KOPIS_SERVICE_KEY;
  if (!key) {
    throw new Error('KOPIS_SERVICE_KEY environment variable is not set');
  }
  return key;
}

/**
 * KOPIS API 서비스 키가 설정되어 있는지 확인
 */
export function isKopisConfigured(): boolean {
  return !!process.env.KOPIS_SERVICE_KEY;
}

/**
 * URL 파라미터 생성
 */
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join('&');
  return filtered;
}

/**
 * 공연 목록 조회
 *
 * @param params - 조회 파라미터
 * @returns 공연 목록
 *
 * @example
 * const performances = await fetchPerformanceList({
 *   stdate: '20250101',
 *   eddate: '20250131',
 *   cpage: 1,
 *   rows: 20,
 *   shcate: 'BBBC' // 뮤지컬
 * });
 */
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
      rows: params.rows ?? 10,
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
    try {
      response = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: KOPIS_REVALIDATE_SECONDS },
      });
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

/**
 * 공연 상세 정보 조회
 *
 * @param performanceId - 공연 ID (mt20id)
 * @returns 공연 상세 정보
 *
 * @example
 * const detail = await fetchPerformanceDetail('PF123456');
 */
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
    try {
      response = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: KOPIS_REVALIDATE_SECONDS },
      });
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

/**
 * 최근 공연 목록 조회 (편의 함수)
 *
 * 현재 날짜 기준으로 앞뒤 기간의 공연을 조회합니다.
 *
 * @param rows - 조회할 항목 수 (기본값: 20, 최대: 100)
 * @returns 공연 목록
 */
export async function fetchRecentPerformances(rows: number = 20): Promise<KopisPerformanceItem[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 30);

  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 90); // 3개월 후까지

  return fetchPerformanceList({
    stdate: formatDateForKopis(startDate),
    eddate: formatDateForKopis(endDate),
    rows: Math.min(rows, 100), // KOPIS API 최대값 100
    prfstate: '02', // 공연중
  });
}

/**
 * 모든 진행 중/예정 공연 조회 (페이지네이션)
 *
 * @param maxPages - 최대 페이지 수 (기본값: 5)
 * @returns 모든 공연 목록
 */
export async function fetchAllUpcomingPerformances(
  maxPages: number = 5,
  shcate?: string,
): Promise<KopisPerformanceItem[]> {
  const now = new Date();
  const startDate = new Date(now);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 365); // 1년 후까지

  const allPerformances: KopisPerformanceItem[] = [];

  // 여러 페이지 조회
  for (let page = 1; page <= maxPages; page++) {
    try {
      const performances = await fetchPerformanceList({
        stdate: formatDateForKopis(startDate),
        eddate: formatDateForKopis(endDate),
        cpage: page,
        rows: 100, // 페이지당 최대
        shcate,
      });

      allPerformances.push(...performances);

      // 결과가 100개 미만이면 마지막 페이지
      if (performances.length < 100) {
        break;
      }
    } catch (error) {
      console.error(`Failed to fetch page ${page}:`, error);
      break;
    }
  }

  console.log(`✅ Fetched ${allPerformances.length} performances from KOPIS (genre: ${shcate ?? 'all'}, ${maxPages} pages max)`);

  return allPerformances;
}

/**
 * 장르별 공연 목록 조회 (편의 함수)
 *
 * @param genreCode - 장르 코드 (KOPIS_GENRE_CODES 참고)
 * @param rows - 조회할 항목 수
 * @returns 공연 목록
 */
export async function fetchPerformancesByGenre(
  genreCode: string,
  rows: number = 20
): Promise<KopisPerformanceItem[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 30);

  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 90); // 3개월 후까지

  return fetchPerformanceList({
    stdate: formatDateForKopis(startDate),
    eddate: formatDateForKopis(endDate),
    shcate: genreCode,
    rows,
  });
}
