/**
 * KOPIS API 타입 정의
 *
 * 공연예술통합전산망(KOPIS) Open API의 응답 데이터 구조를 정의합니다.
 */

/**
 * 공연 목록 조회 응답 (XML -> JSON 변환 후)
 */
export type KopisPerformanceListResponse = {
  dbs: {
    db: KopisPerformanceItem[];
  };
};

/**
 * 공연 목록 아이템
 */
export type KopisPerformanceItem = {
  mt20id: string;           // 공연 ID
  prfnm: string;            // 공연명
  prfpdfrom: string;        // 공연시작일 (YYYY.MM.DD)
  prfpdto: string;          // 공연종료일 (YYYY.MM.DD)
  fcltynm: string;          // 공연시설명 (극장명)
  poster: string;           // 포스터 이미지 URL
  genrenm: string;          // 장르명 (KOPIS API 필드명)
  area?: string;            // 지역 (서울특별시 등)
  prfstate: string;         // 공연상태 (공연중, 공연예정, 공연완료)
  openrun?: string;         // 오픈런 (Y/N)
};

/**
 * 공연 상세 조회 응답 (XML -> JSON 변환 후)
 */
export type KopisPerformanceDetailResponse = {
  db: KopisPerformanceDetail;
};

export type KopisRelateItem = {
  relatenm?: string;
  relateurl?: string;
};

/**
 * 공연 상세 정보
 */
export type KopisPerformanceDetail = {
  mt20id: string;           // 공연 ID
  prfnm: string;            // 공연명
  prfpdfrom: string;        // 공연시작일
  prfpdto: string;          // 공연종료일
  fcltynm: string;          // 공연시설명
  prfcast?: string;         // 공연 출연진
  prfcrew?: string;         // 공연 제작진
  prfruntime?: string;      // 공연 런타임
  prfage?: string;          // 공연 관람연령
  entrpsnm?: string;        // 제작사
  pcseguidance?: string;    // 티켓가격
  poster: string;           // 포스터 이미지 URL
  sty?: string;             // 줄거리
  genrenm: string;          // 장르명
  prfstate: string;         // 공연상태
  openrun?: string;         // 오픈런
  dtguidance?: string;      // 공연 시간
  styurls?: {               // 소개이미지 목록
    styurl?: string[];
  };
  relates?: {
    relate?: KopisRelateItem | KopisRelateItem[];
  };
  mt10id?: string;          // 공연시설 ID
  area?: string;            // 지역
};

/**
 * KOPIS API 요청 파라미터
 */
export type KopisListParams = {
  stdate: string;           // 시작일 (YYYYMMDD)
  eddate: string;           // 종료일 (YYYYMMDD)
  cpage?: number;           // 현재 페이지 (기본값: 1)
  rows?: number;            // 페이지당 목록 수 (기본값: 10, 최대: 100)
  shcate?: string;          // 장르 코드 (AAAA: 연극, BBBC: 뮤지컬 등)
  signgucode?: string;      // 지역 코드 (11: 서울 등)
  signgucodesub?: string;   // 세부 지역 코드
  kidstate?: string;        // 아동 공연 여부 (Y/N)
  prfstate?: string;        // 공연 상태 (01: 공연예정, 02: 공연중, 03: 공연완료)
};

/**
 * 장르 코드 매핑
 */
export const KOPIS_GENRE_CODES = {
  '연극': 'AAAA',
  '뮤지컬': 'BBBC',
  '클래식': 'CCCA',
  '오페라': 'CCCC',
  '국악': 'EEEB',
  '무용': 'GGGA',
  '대중음악': 'CCCD',
  '복합': 'EEEA',
  '서커스/마술': 'EEEE',
  '아동': 'KID',
} as const;

/**
 * 지역 코드 매핑
 */
export const KOPIS_REGION_CODES = {
  '서울': '11',
  '부산': '26',
  '대구': '27',
  '인천': '28',
  '광주': '29',
  '대전': '30',
  '울산': '31',
  '세종': '36',
  '경기': '41',
  '강원': '42',
  '충북': '43',
  '충남': '44',
  '전북': '45',
  '전남': '46',
  '경북': '47',
  '경남': '48',
  '제주': '50',
} as const;

/**
 * 공연 상태 코드
 */
export const KOPIS_STATE_CODES = {
  '공연예정': '01',
  '공연중': '02',
  '공연완료': '03',
} as const;
