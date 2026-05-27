/**
 * KOPIS API XML 응답 파서
 *
 * KOPIS API는 XML 형식으로 응답하므로 이를 JavaScript 객체로 변환합니다.
 */

import { XMLParser } from 'fast-xml-parser';
import type {
  KopisPerformanceListResponse,
  KopisPerformanceDetailResponse,
} from './types';

/**
 * XML Parser 인스턴스
 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  trimValues: true,
});

/**
 * XML 문자열을 JavaScript 객체로 파싱
 */
export function parseXML<T>(xmlString: string): T {
  try {
    const result = parser.parse(xmlString);
    return result as T;
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error('Failed to parse KOPIS API response');
  }
}

/**
 * 공연 목록 XML 응답 파싱
 */
export function parsePerformanceList(xmlString: string): KopisPerformanceListResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = parseXML<{ dbs: any }>(xmlString);

  // XML 구조 정규화
  if (!parsed.dbs) {
    return { dbs: { db: [] } };
  }

  // 단일 항목인 경우 배열로 변환
  if (parsed.dbs.db && !Array.isArray(parsed.dbs.db)) {
    parsed.dbs.db = [parsed.dbs.db];
  }

  return parsed as KopisPerformanceListResponse;
}

/**
 * 공연 상세 XML 응답 파싱
 */
export function parsePerformanceDetail(xmlString: string): KopisPerformanceDetailResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = parseXML<{ dbs: { db: any } }>(xmlString);

  if (!parsed.dbs || !parsed.dbs.db) {
    console.error('Invalid KOPIS detail XML structure:', parsed);
    throw new Error('Invalid performance detail response');
  }

  console.log('✅ Parsed KOPIS detail:', {
    mt20id: parsed.dbs.db.mt20id,
    prfnm: parsed.dbs.db.prfnm,
    genrenm: parsed.dbs.db.genrenm,
  });

  // styurls 배열 정규화
  if (parsed.dbs.db.styurls?.styurl && !Array.isArray(parsed.dbs.db.styurls.styurl)) {
    parsed.dbs.db.styurls.styurl = [parsed.dbs.db.styurls.styurl];
  }

  // XML 구조 (dbs.db)를 예상 타입 (db)으로 변환
  return { db: parsed.dbs.db } as KopisPerformanceDetailResponse;
}

/**
 * 날짜 문자열 변환 (YYYY.MM.DD -> YYYYMMDD)
 */
export function formatDateForKopis(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * KOPIS 날짜를 ISO 형식으로 변환 (YYYY.MM.DD -> YYYY-MM-DD)
 */
export function parseKopisDate(kopisDate: string): string {
  return kopisDate.replace(/\./g, '-');
}
