/**
 * 장르/지역 큐레이션 페이지용 상수
 * SEO 슬러그(영문) ↔ 한국어 라벨/설명 매핑
 */

export interface CurationMeta {
  label: string          // 한국어 표시명
  categoryValue: string  // DB category/region 컬럼 값 (한국어)
  description: string    // SEO용 설명 텍스트
  emoji: string
}

// ─── 장르 ─────────────────────────────────────────────────────────────────────

export const GENRE_MAP: Record<string, CurationMeta> = {
  musical: {
    label: "뮤지컬",
    categoryValue: "뮤지컬",
    emoji: "🎵",
    description:
      "화려한 노래와 춤이 어우러지는 뮤지컬 공연을 한 곳에서 확인하세요. 대형 라이선스 작품부터 소극장 창작 뮤지컬까지 다양한 공연 정보와 초대권 이벤트를 제공합니다.",
  },
  theater: {
    label: "연극",
    categoryValue: "연극",
    emoji: "🎭",
    description:
      "배우의 날 것의 감정을 가까이서 느낄 수 있는 연극 공연 목록입니다. 소극장 실험극부터 대학로 인기 장기 공연까지 연극 정보를 한눈에 확인하세요.",
  },
  classic: {
    label: "클래식",
    categoryValue: "클래식",
    emoji: "🎻",
    description:
      "오케스트라 연주회, 실내악, 독주회 등 클래식 음악 공연 정보를 모았습니다. 국내외 유명 연주자들의 무대를 초대권 이벤트와 함께 만나보세요.",
  },
  concert: {
    label: "콘서트",
    categoryValue: "콘서트",
    emoji: "🎸",
    description:
      "K-POP, 인디, 팝 등 다양한 장르의 콘서트 공연 정보입니다. 좋아하는 아티스트의 공연 일정을 미리 확인하고 초대권 이벤트에 응모해 보세요.",
  },
  dance: {
    label: "무용",
    categoryValue: "무용",
    emoji: "💃",
    description:
      "발레, 현대무용, 한국무용 등 무용 공연 정보를 모았습니다. 몸으로 표현하는 예술의 아름다움을 가까이서 경험해 보세요.",
  },
  exhibition: {
    label: "전시",
    categoryValue: "전시",
    emoji: "🖼️",
    description:
      "미술, 사진, 미디어아트 등 다양한 전시 정보를 제공합니다. 알터즈에서 초대권 이벤트가 연결된 전시 행사를 가장 빠르게 확인하세요.",
  },
  circus: {
    label: "서커스·마술",
    categoryValue: "서커스/마술",
    emoji: "🎪",
    description:
      "가족 모두가 즐길 수 있는 서커스와 마술 공연 정보입니다. 신비로운 무대 예술의 세계로 초대합니다.",
  },
} as const

export const GENRE_SLUGS = Object.keys(GENRE_MAP) as Array<keyof typeof GENRE_MAP>

// ─── 지역 ─────────────────────────────────────────────────────────────────────

export const REGION_MAP: Record<string, CurationMeta> = {
  seoul: {
    label: "서울",
    categoryValue: "서울",
    emoji: "🏙️",
    description:
      "서울에서 열리는 공연 정보를 한눈에 확인하세요. 대학로, 예술의전당, 세종문화회관 등 서울 전역의 공연장에서 펼쳐지는 다양한 무대를 만나보세요.",
  },
  gyeonggi: {
    label: "경기",
    categoryValue: "경기",
    emoji: "🌆",
    description:
      "수원, 성남, 고양, 안산 등 경기도 지역 공연 정보입니다. 서울 인근에서 즐길 수 있는 다양한 공연과 초대권 이벤트를 확인하세요.",
  },
  busan: {
    label: "부산",
    categoryValue: "부산",
    emoji: "🌊",
    description:
      "부산에서 열리는 공연 정보를 모았습니다. 부산문화회관, 해운대 등 부산 지역의 다양한 공연 일정을 확인하고 초대권 이벤트에 응모해 보세요.",
  },
  daegu: {
    label: "대구",
    categoryValue: "대구",
    emoji: "🏛️",
    description:
      "대구에서 펼쳐지는 공연 정보입니다. 대구오페라하우스 등 대구 지역 공연장의 다양한 프로그램을 소개합니다.",
  },
  incheon: {
    label: "인천",
    categoryValue: "인천",
    emoji: "✈️",
    description:
      "인천에서 열리는 공연 정보를 확인하세요. 인천문화예술회관 등 인천 지역의 다양한 공연을 소개합니다.",
  },
  gwangju: {
    label: "광주",
    categoryValue: "광주",
    emoji: "🎨",
    description:
      "예향 광주에서 열리는 공연 정보입니다. 광주문화예술회관 등 다양한 공연장에서 펼쳐지는 무대를 만나보세요.",
  },
  daejeon: {
    label: "대전",
    categoryValue: "대전",
    emoji: "🔬",
    description:
      "대전에서 열리는 공연 정보를 모았습니다. 대전예술의전당 등 대전 지역의 다양한 공연 일정을 확인하세요.",
  },
  ulsan: {
    label: "울산",
    categoryValue: "울산",
    emoji: "🏭",
    description:
      "울산에서 열리는 공연 정보입니다. 울산문화예술회관 등 울산 지역 공연장의 다양한 프로그램을 소개합니다.",
  },
  gangwon: {
    label: "강원",
    categoryValue: "강원",
    emoji: "🏔️",
    description:
      "강원도에서 열리는 공연 정보입니다. 자연 속에서 즐기는 강원 지역 다양한 공연과 문화 행사를 소개합니다.",
  },
  chungnam: {
    label: "충남",
    categoryValue: "충남",
    emoji: "🌾",
    description: "충청남도에서 열리는 공연 정보입니다. 천안, 아산 등 충남 지역 다양한 공연 일정을 확인하세요.",
  },
  jeonbuk: {
    label: "전북",
    categoryValue: "전북",
    emoji: "🌿",
    description: "전라북도에서 열리는 공연 정보입니다. 전주, 익산 등 전북 지역 다양한 공연을 소개합니다.",
  },
  jeonnam: {
    label: "전남",
    categoryValue: "전남",
    emoji: "🍃",
    description: "전라남도에서 열리는 공연 정보입니다. 순천, 여수 등 전남 지역 다양한 공연 일정을 확인하세요.",
  },
  gyeongbuk: {
    label: "경북",
    categoryValue: "경북",
    emoji: "🏯",
    description: "경상북도에서 열리는 공연 정보입니다. 경주, 포항 등 경북 지역 다양한 공연을 소개합니다.",
  },
  gyeongnam: {
    label: "경남",
    categoryValue: "경남",
    emoji: "🌺",
    description: "경상남도에서 열리는 공연 정보입니다. 창원, 진주 등 경남 지역 다양한 공연 일정을 확인하세요.",
  },
  jeju: {
    label: "제주",
    categoryValue: "제주",
    emoji: "🍊",
    description:
      "제주도에서 열리는 공연 정보입니다. 제주의 아름다운 자연과 함께 즐기는 다양한 공연과 문화 행사를 소개합니다.",
  },
} as const

export const REGION_SLUGS = Object.keys(REGION_MAP) as Array<keyof typeof REGION_MAP>
