export type UserRole = "audience" | "partner";

export type AuthProviderType = "kakao";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  provider: AuthProviderType;
  role: UserRole;
  tier: string;
  avatarColor: string;
  organization?: string;
  kakaoId?: string;
  preferences: {
    segments: string[];
    homeFocus: string;
  };
  metrics: {
    points: number;
    missionsCompleted: number;
    favorites: number;
    upcomingShow?: string;
    campaignsActive?: number;
    budgetThisMonth?: number;
    ctrAverage?: number;
  };
}

export const mockUsers: MockUser[] = [
  {
    id: "user-kakao-1",
    name: "Harin",
    email: "harin@kakao.com",
    provider: "kakao",
    kakaoId: "kakao_991",
    role: "audience",
    tier: "Bloom",
    avatarColor: "bg-yellow-400",
    preferences: {
      segments: ["intro_first", "immersive"],
      homeFocus: "퍼널 진행률",
    },
    metrics: {
      points: 620,
      missionsCompleted: 5,
      favorites: 7,
      upcomingShow: "Surround Proof Stage Tour",
    },
  },
  {
    id: "user-kakao-2",
    name: "Yoon Sungwoo",
    email: "seongwoo@kakao.com",
    provider: "kakao",
    kakaoId: "kakao_552",
    role: "partner",
    tier: "Slate",
    avatarColor: "bg-emerald-400",
    organization: "Serenade Ensemble",
    preferences: {
      segments: ["adgate", "home_mid"],
      homeFocus: "캠페인 KPI",
    },
    metrics: {
      points: 0,
      missionsCompleted: 0,
      favorites: 0,
      campaignsActive: 1,
      budgetThisMonth: 640000,
      ctrAverage: 3.4,
    },
  },
  {
    id: "user-kakao-3",
    name: "Admin Concierge",
    email: "admin@artause.kr",
    provider: "kakao",
    kakaoId: "kakao_admin_001",
    role: "partner",
    tier: "Admin",
    avatarColor: "bg-slate-500",
    organization: "Artause Admin Console",
    preferences: {
      segments: ["lottery", "monitoring"],
      homeFocus: "정책 감사",
    },
    metrics: {
      points: 0,
      missionsCompleted: 0,
      favorites: 0,
      campaignsActive: 0,
      budgetThisMonth: 0,
      ctrAverage: 0,
    },
  },
];

export const kakaoProfiles = mockUsers;
