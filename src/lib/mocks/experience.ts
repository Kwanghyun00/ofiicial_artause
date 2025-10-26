export type AudienceLeaderboardEntry = {
  id: string;
  nickname: string;
  score: number;
  tier: "Explorer" | "Amplifier" | "Partner";
  recentActivity: string;
};

export type AudienceEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  tags: string[];
  status: "오픈" | "마감임박" | "선착순" | "조기마감";
  cta: string;
};

export type AudienceChallenge = {
  id: string;
  title: string;
  reward: string;
  progress: number;
  due: string;
};

export type PartnerCampaign = {
  id: string;
  name: string;
  status: "active" | "scheduled" | "paused";
  goal: string;
  budget: number;
  startDate: string;
  endDate: string;
  primaryChannel: string;
  owner: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    conversion: number;
  };
};

export const audienceLeaderboard: AudienceLeaderboardEntry[] = [
  {
    id: "rank-1",
    nickname: "nightloop",
    score: 3210,
    tier: "Amplifier",
    recentActivity: "친구 추천 12건 · 프리뷰 라운지 참여",
  },
  {
    id: "rank-2",
    nickname: "studio.flow",
    score: 2875,
    tier: "Explorer",
    recentActivity: "DM 공유 9건 · 신규 체크인 4건",
  },
  {
    id: "rank-3",
    nickname: "kyung",
    score: 2440,
    tier: "Partner",
    recentActivity: "프로 구독 · 추천 코드 6건",
  },
  {
    id: "rank-4",
    nickname: "dawnlight",
    score: 2110,
    tier: "Explorer",
    recentActivity: "현장 체크인 3회 · 후기 작성",
  },
  {
    id: "rank-5",
    nickname: "amplifyhoon",
    score: 1980,
    tier: "Amplifier",
    recentActivity: "SNS 릴스 업로드 2건",
  },
];

export const audienceEvents: AudienceEvent[] = [
  {
    id: "aud-evt-1",
    title: "문라이트 앙상블: 몰입형 시사회",
    date: "2025-10-21",
    time: "19:30",
    location: "성수 아트홀",
    tags: ["이머시브", "초대"],
    status: "오픈",
    cta: "사전신청",
  },
  {
    id: "aud-evt-2",
    title: "리듬 아틀리에: 비트워크샵",
    date: "2025-10-24",
    time: "18:00",
    location: "합정 스튜디오",
    tags: ["워크샵", "커뮤니티"],
    status: "선착순",
    cta: "바로참여",
  },
  {
    id: "aud-evt-3",
    title: "포커스 필름: 오디오 시어터",
    date: "2025-10-27",
    time: "20:00",
    location: "이태원 콘트랩",
    tags: ["사운드", "라이브"],
    status: "마감임박",
    cta: "잔여티켓",
  },
  {
    id: "aud-evt-4",
    title: "에코드리프트: 미드나잇 세션",
    date: "2025-11-01",
    time: "22:00",
    location: "성수 웨어하우스",
    tags: ["언더그라운드"],
    status: "오픈",
    cta: "신청하기",
  },
  {
    id: "aud-evt-5",
    title: "H-Collective: 루프탑 시청회",
    date: "2025-11-03",
    time: "19:00",
    location: "부산 F1963",
    tags: ["프리미어", "초대"],
    status: "조기마감",
    cta: "웨이팅",
  },
  {
    id: "aud-evt-6",
    title: "시네바이브: 실험 단편 라운지",
    date: "2025-11-05",
    time: "17:30",
    location: "홍대 모자이크",
    tags: ["단편", "크리에이터"],
    status: "오픈",
    cta: "티켓확인",
  },
  {
    id: "aud-evt-7",
    title: "서라운드 프루프: 스테이지 투어",
    date: "2025-11-07",
    time: "15:00",
    location: "국립극장 백스테이지",
    tags: ["투어", "체험"],
    status: "선착순",
    cta: "예약",
  },
];

export const audienceChallenges: AudienceChallenge[] = [
  {
    id: "aud-ch-1",
    title: "친구 추천 3인 달성",
    reward: "보너스 300P",
    progress: 66,
    due: "D-2",
  },
  {
    id: "aud-ch-2",
    title: "현장 체크인 연속 2회",
    reward: "Artause 스티커 팩",
    progress: 40,
    due: "D-5",
  },
  {
    id: "aud-ch-3",
    title: "커뮤니티 후기 작성",
    reward: "추첨권 2장",
    progress: 80,
    due: "D-1",
  },
];

export const partnerCampaigns: PartnerCampaign[] = [
  {
    id: "pt-cmp-1",
    name: "Moonlight Preview Night",
    status: "active",
    goal: "사전 예매 420석 확보",
    budget: 1500000,
    startDate: "2025-10-01",
    endDate: "2025-10-14",
    primaryChannel: "home_hero",
    owner: "Artause Theatre Lab",
    metrics: {
      impressions: 18240,
      clicks: 512,
      ctr: 2.8,
      conversion: 2.4,
    },
  },
  {
    id: "pt-cmp-2",
    name: "Horizon Collective Rooftop",
    status: "scheduled",
    goal: "프리뷰 초청 200명",
    budget: 980000,
    startDate: "2025-10-18",
    endDate: "2025-10-25",
    primaryChannel: "community_digest",
    owner: "Horizon Collective",
    metrics: {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      conversion: 0,
    },
  },
  {
    id: "pt-cmp-3",
    name: "Serenade Ensemble Capsule",
    status: "active",
    goal: "후원 티켓 120매",
    budget: 720000,
    startDate: "2025-09-28",
    endDate: "2025-10-12",
    primaryChannel: "home_mid",
    owner: "Serenade Ensemble",
    metrics: {
      impressions: 9600,
      clicks: 310,
      ctr: 3.2,
      conversion: 2.9,
    },
  },
  {
    id: "pt-cmp-4",
    name: "Backstage Immersion Tour",
    status: "paused",
    goal: "체험 리드 80건",
    budget: 540000,
    startDate: "2025-09-10",
    endDate: "2025-10-05",
    primaryChannel: "referral_loop",
    owner: "Stagecraft Studio",
    metrics: {
      impressions: 11200,
      clicks: 190,
      ctr: 1.7,
      conversion: 1.2,
    },
  },
  {
    id: "pt-cmp-5",
    name: "Community Creator Sprint",
    status: "active",
    goal: "UGC 45건 확보",
    budget: 450000,
    startDate: "2025-10-05",
    endDate: "2025-10-20",
    primaryChannel: "creator_loop",
    owner: "Artause Network",
    metrics: {
      impressions: 7800,
      clicks: 268,
      ctr: 3.4,
      conversion: 2.1,
    },
  },
];
