/**
 * KOPIS API 데이터 매퍼
 *
 * KOPIS API 응답을 우리 애플리케이션의 데이터 구조로 변환합니다.
 */

import type { KopisPerformanceItem, KopisPerformanceDetail } from './types';
import { parseKopisDate } from './parser';

/**
 * 우리 애플리케이션의 공연 타입
 */
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
};

/**
 * KOPIS 장르명을 정규화된 장르로 변환
 * KOPIS: "서양음악(클래식)", "뮤지컬" 등 -> "클래식", "뮤지컬" 등
 */
function normalizeGenre(kopisGenre: string): string {
  const genre = kopisGenre.toLowerCase();

  // 클래식/음악
  if (genre.includes('클래식') || genre.includes('서양음악') || genre.includes('국악')) {
    return '클래식';
  }
  // 뮤지컬
  if (genre.includes('뮤지컬')) {
    return '뮤지컬';
  }
  // 연극
  if (genre.includes('연극')) {
    return '연극';
  }
  // 무용
  if (genre.includes('무용') || genre.includes('댄스')) {
    return '무용';
  }
  // 전시
  if (genre.includes('전시') || genre.includes('미술')) {
    return '전시';
  }
  // 대중음악/콘서트
  if (genre.includes('대중음악') || genre.includes('콘서트')) {
    return '콘서트';
  }

  // 원본 반환
  return kopisGenre;
}

/**
 * KOPIS 공연 목록 아이템을 Performance 타입으로 변환
 */
export function mapKopisItemToPerformance(item: KopisPerformanceItem): Performance {
  // 필수 필드 검증
  if (!item?.mt20id || !item?.prfnm) {
    throw new Error('Invalid KOPIS item: missing required fields');
  }

  return {
    id: item.mt20id,
    slug: createSlug(item.prfnm, item.mt20id),
    title: item.prfnm || '제목 없음',
    region: item.area || (item.fcltynm ? extractRegion(item.fcltynm) : null),
    tags: item.genrenm ? [normalizeGenre(item.genrenm)] : null,
    period_start: item.prfpdfrom ? parseKopisDate(item.prfpdfrom) : null,
    period_end: item.prfpdto ? parseKopisDate(item.prfpdto) : null,
    poster_url: item.poster || null,
    venue: item.fcltynm || null,
    state: item.prfstate || null,
  };
}

/**
 * KOPIS 공연 상세 정보를 Performance 타입으로 변환
 */
export function mapKopisDetailToPerformance(detail: KopisPerformanceDetail): Performance {
  // 필수 필드 검증
  if (!detail?.mt20id || !detail?.prfnm) {
    throw new Error('Invalid KOPIS detail: missing required fields');
  }

  return {
    id: detail.mt20id,
    slug: createSlug(detail.prfnm, detail.mt20id),
    title: detail.prfnm || '제목 없음',
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
  };
}

/**
 * 공연명과 ID로 slug 생성
 */
function createSlug(title: string, id: string): string {
  // 제목을 URL-safe한 형태로 변환
  const titleSlug = title
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, '') // 특수문자 제거
    .replace(/\s+/g, '-') // 공백을 하이픈으로
    .substring(0, 50); // 최대 50자

  return `${titleSlug}-${id}`;
}

/**
 * 공연시설명에서 지역 추출
 * 예: "예술의전당 오페라하우스 [서울 서초구]" -> "서울"
 */
function extractRegion(facilityName: string | null | undefined): string | null {
  if (!facilityName || typeof facilityName !== 'string') {
    return null;
  }

  const regionMatch = facilityName.match(/\[(.*?)\]/);
  if (regionMatch && regionMatch[1]) {
    const parts = regionMatch[1].split(' ');
    return parts[0] || null;
  }

  // 지역명이 직접 포함된 경우
  const regions = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
  for (const region of regions) {
    if (facilityName.includes(region)) {
      return region;
    }
  }

  return null;
}

/**
 * 여러 KOPIS 아이템을 Performance 배열로 변환
 * 유효하지 않은 항목은 자동으로 건너뜁니다.
 */
export function mapKopisListToPerformances(items: KopisPerformanceItem[]): Performance[] {
  if (!Array.isArray(items)) {
    console.warn('mapKopisListToPerformances: items is not an array');
    return [];
  }

  return items
    .filter(item => {
      // 필수 필드 검증
      if (!item?.mt20id || !item?.prfnm) {
        console.warn('Skipping invalid KOPIS item:', item);
        return false;
      }
      return true;
    })
    .map(item => {
      try {
        return mapKopisItemToPerformance(item);
      } catch (error) {
        console.error('Error mapping KOPIS item:', error, item);
        return null;
      }
    })
    .filter((item): item is Performance => item !== null);
}
