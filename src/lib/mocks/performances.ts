import type { Database } from "@/lib/supabase/types";

type PerformanceRow = Database["public"]["Tables"]["performances"]["Row"];
type CampaignRow = Database["public"]["Tables"]["ticket_campaigns"]["Row"] & {
  slug: string;
  performances?: Pick<PerformanceRow, "slug" | "title" | "poster_url" | "organization_id"> | null;
};
type OrganizationRow = Database["public"]["Tables"]["organizations"]["Row"];
type CommunityPostRow = Database["public"]["Tables"]["community_posts"]["Row"] & {
  organizations?: Pick<OrganizationRow, "id" | "slug" | "name" | "logo_url" | "tagline"> | null;
};

type FollowSnapshot = {
  organizationId: string;
  followerCount: number;
};

const now = new Date().toISOString();
const basePoster = "/images/mock/poster-default.svg";
const baseCover = "/images/mock/cover-default.jpg";

export const mockOrganizations: OrganizationRow[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    slug: "artause-theatre-lab",
    name: "아르타우스 시어터 랩",
    tagline: "야간 관객을 위한 몰입형 스토리텔링",
    description:
      "서울 성수에서 활동하는 크리에이티브 팀으로, 라디오 드라마와 공간 연출을 결합해 도심 속 야간 몰입 경험을 만듭니다.",
    genre_focus: ["몰입극", "드라마"],
    region: "서울",
    cover_image_url: baseCover,
    logo_url: null,
    website: "https://artause.example.com",
    instagram: "https://instagram.com/artause_lab",
    youtube: "https://youtube.com/@artause",
    follower_count: 1820,
    created_at: now,
    updated_at: now,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    slug: "horizon-collective",
    name: "호라이즌 콜렉티브",
    tagline: "부산 바닷가에서 열리는 선셋 아트 & 음악 페스티벌",
    description:
      "부산 기반의 페스티벌 팀으로, 라이브 일렉트로닉 음악과 해안 예술 설치, 웰니스 팝업을 결합한 3일간의 프로그램을 기획합니다.",
    genre_focus: ["페스티벌", "일렉트로닉", "팝"],
    region: "부산",
    cover_image_url: baseCover,
    logo_url: null,
    website: "https://horizon.example.com",
    instagram: "https://instagram.com/horizon_collective",
    youtube: null,
    follower_count: 2560,
    created_at: now,
    updated_at: now,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    slug: "serenade-ensemble",
    name: "세레나데 앙상블",
    tagline: "도심의 야경과 어우러지는 실내악",
    description:
      "대구를 기반으로 활동하는 실내악 팀으로, 뉴클래식과 재즈를 혼합해 도시의 야경을 배경으로 한 공연을 선보입니다.",
    genre_focus: ["클래식", "재즈"],
    region: "대구",
    cover_image_url: baseCover,
    logo_url: null,
    website: null,
    instagram: "https://instagram.com/serenade_ensemble",
    youtube: "https://youtube.com/@serenadeensemble",
    follower_count: 980,
    created_at: now,
    updated_at: now,
  },
];

export const mockCommunityPosts: CommunityPostRow[] = [
  {
    id: "aaaa1111-aaaa-4111-8111-aaaaaaaaaaaa",
    organization_id: mockOrganizations[0].id,
    slug: "immersive-backstage-note",
    title: "문라이트 랩 비하인드 노트",
    excerpt:
      "첫 프리뷰에서 받은 관객 피드백과 냄새·조명·사운드를 동시에 전환시키는 연출 노하우를 정리했습니다.",
    body: [
      "관객이 단서를 충분히 탐색할 수 있도록 씬 전환 템포를 20% 느리게 조정했습니다.",
      "FM 라디오 톤을 살리기 위해 아날로그 필터와 디지털 믹스를 병행했습니다.",
      "피날레에서 향이 트리거되는 타이밍을 배우 동선과 맞추기 위해 전날 집중 리허설을 진행했습니다."
    ].join("\n"),
    cover_image_url: baseCover,
    tags: ["연출", "비하인드"],
    published_at: now,
    created_at: now,
    updated_at: now,
    organizations: {
      id: mockOrganizations[0].id,
      slug: mockOrganizations[0].slug,
      name: mockOrganizations[0].name,
      logo_url: mockOrganizations[0].logo_url,
      tagline: mockOrganizations[0].tagline,
    },
  },
  {
    id: "bbbb2222-bbbb-4222-8222-bbbbbbbbbbbb",
    organization_id: mockOrganizations[1].id,
    slug: "horizon-2025-lineup-teaser",
    title: "호라이즌 2025 라인업 & 오션 웰니스",
    excerpt:
      "선셋 메인 스테이지와 새로운 오션 웰니스 존을 공개했습니다. 얼리버드 일정과 혜택도 함께 안내합니다.",
    body: [
      "18시 45분 일몰에 맞춰 헤드라이너가 등장하도록 조명 큐를 설계했습니다.",
      "바다 소리를 활용한 사운드 배스를 추가해 저녁 시간대 몰입도를 높였습니다.",
      "기수별 얼리버드에는 리유저블 텀블러와 디지털 포스터를 번들로 제공합니다."
    ].join("\n"),
    cover_image_url: baseCover,
    tags: ["라인업", "페스티벌"],
    published_at: now,
    created_at: now,
    updated_at: now,
    organizations: {
      id: mockOrganizations[1].id,
      slug: mockOrganizations[1].slug,
      name: mockOrganizations[1].name,
      logo_url: mockOrganizations[1].logo_url,
      tagline: mockOrganizations[1].tagline,
    },
  },
  {
    id: "cccc3333-cccc-4333-8333-cccccccccccc",
    organization_id: mockOrganizations[2].id,
    slug: "serenade-night-session-playlist",
    title: "세레나데 나이트 세션 플레이리스트",
    excerpt:
      "10월 프로그램 플레이리스트와 각 트랙에 얽힌 스토리를 소개합니다.",
    body: [
      "야경이 비치는 스크린과 맞추기 위해 재즈 스탠더드를 새롭게 편곡했습니다.",
      "리허설 라이브 클립을 활용해 유료 광고용 리타게팅 소재를 제작했습니다.",
      "관객이 직접 선택한 앙코르 트랙은 다음 도시 일정의 UGC로 활용합니다."
    ].join("\n"),
    cover_image_url: baseCover,
    tags: ["플레이리스트", "라이브"],
    published_at: now,
    created_at: now,
    updated_at: now,
    organizations: {
      id: mockOrganizations[2].id,
      slug: mockOrganizations[2].slug,
      name: mockOrganizations[2].name,
      logo_url: mockOrganizations[2].logo_url,
      tagline: mockOrganizations[2].tagline,
    },
  },
];

export const mockFollowSnapshots: FollowSnapshot[] = mockOrganizations.map((organization) => ({
  organizationId: organization.id,
  followerCount: organization.follower_count,
}));

export const mockPerformances: PerformanceRow[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "moonlight-ensemble",
    title: "문라이트 앙상블",
    status: "ongoing",
    category: "몰입형 연극",
    region: "서울",
    organization: mockOrganizations[0].name,
    organization_id: mockOrganizations[0].id,
    period_start: "2025-10-01",
    period_end: "2025-10-28",
    venue: "아르타우스 블루스퀘어 스튜디오",
    synopsis:
      "자정 라디오 드라마를 콘셉트로 한 미스터리 몰입극입니다. 관객은 방송국 제작진이 되어 단서를 수집하고 사건을 해결합니다.",
    tasks: ["티저 영상 공개", "인플루언서 프리뷰 투어", "N회차 리워드 프로그램"],
    poster_url: basePoster,
    hero_headline: "첫 주 좌석 점유율 82%",
    hero_subtitle: "서울 야간 관객과 팬덤 커뮤니티를 타깃",
    ticket_link: "https://tickets.example.com/moonlight",
    is_featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "festival-horizon",
    title: "2025 호라이즌 페스티벌",
    status: "scheduled",
    category: "페스티벌",
    region: "부산",
    organization: mockOrganizations[1].name,
    organization_id: mockOrganizations[1].id,
    period_start: "2025-11-15",
    period_end: "2025-11-17",
    venue: "F1963 문화창고",
    synopsis:
      "일몰 시간에 맞춘 라이브 일렉트로닉과 해안 예술 설치, 웰니스 존이 결합된 3일간의 페스티벌입니다.",
    tasks: ["페스티벌 브랜딩", "티켓 퍼널 최적화", "현장 라이브 커버리지"],
    poster_url: basePoster,
    hero_headline: "전년 대비 소셜 리치 520% 성장",
    hero_subtitle: "지역 팬과 관광객을 연결하는 콘셉트",
    ticket_link: null,
    is_featured: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "classical-serenade",
    title: "시티 세레나데",
    status: "completed",
    category: "실내악",
    region: "대구",
    organization: mockOrganizations[2].name,
    organization_id: mockOrganizations[2].id,
    period_start: "2025-06-02",
    period_end: "2025-06-04",
    venue: "대구 콘서트하우스 체임버홀",
    synopsis:
      "도시 야경을 배경으로 뉴클래식과 재즈를 혼합한 실내악 프로그램입니다. 프로젝션과 라이브 페인팅이 함께 진행됩니다.",
    tasks: ["VIP 프리뷰", "언론 홍보", "관객 후기 리패키징"],
    poster_url: basePoster,
    hero_headline: "오픈 24시간 내 예매율 72%",
    hero_subtitle: "점심시간 프로모션으로 직장인 관객 확보",
    ticket_link: null,
    is_featured: false,
    created_at: now,
    updated_at: now,
  },
];

export const mockCampaigns: CampaignRow[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    slug: "moonlight-preview-night",
    performance_id: mockPerformances[0].id,
    title: "문라이트 앙상블 프리뷰 나이트",
    description: "출연진 토크와 사운드스케이프 투어가 포함된 드레스 리허설 초청 이벤트입니다.",
    reward: "프리뷰 초대권 2매",
    starts_at: now,
    ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    form_link: null,
    created_at: now,
    updated_at: now,
    performances: {
      slug: mockPerformances[0].slug,
      title: mockPerformances[0].title,
      poster_url: mockPerformances[0].poster_url,
      organization_id: mockPerformances[0].organization_id,
    },
  },
];
