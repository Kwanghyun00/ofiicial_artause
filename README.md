# Artause Invitation Hub

Next.js 기반으로 구축된 Artause 공연 초대권 플랫폼입니다. Supabase를 백엔드로 사용해 공연 정보, 초대권 이벤트를 통합 관리하며, 관객은 공연 정보를 확인하고 초대권 응모 이벤트에 참여할 수 있습니다.

## 주요 기능

### 관객(B2C) 기능
- **메인 페이지** (`/`): 주목받는 공연 목록, 진행 중인 초대권 이벤트, 파트너 단체 소개
- **공연 상세** (`/performances/[slug]`): 공연 정보(포스터, 시놉시스, 기획사, 일정), 관련 초대권 이벤트
- **이벤트 목록** (`/events`): 진행 중/예정/종료된 초대권 이벤트 모아보기
- **초대권 응모** (`/events/tickets/[slug]`): 이벤트별 응모 폼 및 응모 현황

### 파트너(B2B) 기능
- **운영 허브** (`/event-center`): 초대권 이벤트 개설 및 관리 (개발 중)

### 디자인 및 UX
- **완전 반응형**: 모바일/태블릿/데스크톱 모두 최적화
- **모바일 네비게이션**: 햄버거 메뉴와 슬라이드 패널
- **인터랙티브 요소**: 스크롤 애니메이션, 호버 효과, 부드러운 전환
- **접근성**: ARIA 라벨, 키보드 포커스 스타일, 시맨틱 HTML

### 데이터 폴백 시스템
Supabase 환경 변수가 설정되지 않은 경우 `src/lib/mocks/` 폴더의 목업 데이터로 자동 전환되어 로컬 개발 및 UI 확인이 가능합니다.

## 기술 스택

- Framework: [Next.js 15 (App Router)](https://nextjs.org/)
- Language: TypeScript, React Server Components
- Styling: Tailwind CSS (v4 preview), 커스텀 유틸리티 클래식
- Backend: Supabase (PostgreSQL, Edge Functions 대비)
- Validation: Zod

## 프로젝트 구조

```
├── public/
│   └── images/
│       ├── brand/             # 로고 및 브랜드 자산
│       └── mock/              # 폴백용 목업 이미지
├── src/
│   ├── app/                   # App Router 페이지
│   │   ├── page.tsx           # 메인 홈페이지
│   │   ├── events/            # 이벤트 목록 및 응모 페이지
│   │   ├── performances/      # 공연 상세 페이지
│   │   ├── event-center/      # 파트너 운영 허브 (개발 중)
│   │   └── layout.tsx         # 공통 레이아웃 (SiteShell)
│   ├── components/
│   │   ├── home/              # 홈페이지 전용 컴포넌트
│   │   ├── forms/             # 폼 컴포넌트 (응모, 문의 등)
│   │   ├── layout/            # 헤더, 푸터, Shell
│   │   ├── marketing/         # 카드, 섹션 컴포넌트
│   │   └── event-center/      # 파트너 대시보드 컴포넌트
│   ├── lib/
│   │   ├── config.ts          # 환경 설정
│   │   ├── models/            # Zod 스키마 (타입 정의)
│   │   ├── mocks/             # 목업 데이터 (Supabase 미사용 시)
│   │   └── supabase/          # Supabase 클라이언트 및 쿼리
│   └── styles/
│       └── globals.css        # Tailwind 설정 및 전역 스타일
├── supabase/
│   ├── migrations/            # 데이터베이스 마이그레이션
│   └── functions/             # Supabase Edge Functions (선택)
└── README.md
```

## 코드 문서화

모든 주요 컴포넌트와 페이지에는 **JSDoc 스타일 주석**이 추가되어 있어 개발자 온보딩이 쉽습니다:

- **파일 레벨 주석**: 각 파일의 목적, 주요 기능, 데이터 소스 설명
- **함수/컴포넌트 주석**: 파라미터, 반환값, 주요 로직 설명
- **인라인 주석**: JSX 섹션별 역할 설명

### 주석이 추가된 주요 파일
- `src/app/page.tsx` - 메인 홈페이지
- `src/app/events/page.tsx` - 이벤트 목록 페이지
- `src/app/performances/[slug]/page.tsx` - 공연 상세 페이지
- `src/components/home/HomeLanding.tsx` - 메인 랜딩 컴포넌트
- `src/components/layout/SiteHeader.tsx` - 네비게이션 헤더
- `src/components/layout/SiteFooter.tsx` - 사이트 푸터

## 환경 변수 설정

`.env.local` 파일을 프로젝트 루트에 생성하고 다음 값을 채워 주세요:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=optional-for-admin-scripts
SUPABASE_PERFORMANCE_BUCKET=performance-assets
```

값이 비어 있는 경우 폴백 데이터로 자동 전환되므로 로컬 UI 확인만 필요한 경우 생략해도 됩니다.

## Supabase 데이터 준비

1. Supabase 프로젝트를 만든 뒤 `supabase/migrations/0001_init.sql`을 실행합니다.
2. `performances`, `promotion_requests`, `ticket_campaigns`, `ticket_entries` 테이블이 생성됩니다.
3. 초기 데이터를 삽입하면 즉시 웹 UI에 반영됩니다. (App Router는 기본적으로 서버 렌더링을 사용합니다.)

## 개발 시작하기

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 로컬 실행
npm start

# 코드 린트
npm run lint

# 테스트 실행 (Vitest)
npm test
```

> ?? `npm run lint` 실행 시 `eslint-plugin-react` 모듈 관련 오류가 발생한다면 `npm install eslint-plugin-react@latest` 후 다시 시도해 주세요.

### 주요 개발 패턴

#### 1. 반응형 디자인
- **Tailwind 브레이크포인트**: `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **모바일 우선**: 기본 스타일은 모바일, 큰 화면은 브레이크포인트로 확장
- **터치 타겟**: 버튼은 최소 44x44px 크기 유지

#### 2. 애니메이션 및 인터랙션
- **스크롤 애니메이션**: `IntersectionObserver` 사용 (`src/components/home/HomeLanding.tsx` 참고)
- **호버 효과**: `hover:scale-105`, `hover:shadow-lg` 등 Tailwind 유틸리티 활용
- **전환 효과**: `transition-all duration-300` 등으로 부드러운 전환

#### 3. 접근성
- **ARIA 라벨**: 모든 인터랙티브 요소에 `aria-label` 추가
- **키보드 네비게이션**: `focus:ring-2` 등 포커스 스타일 명시
- **시맨틱 HTML**: `<nav>`, `<section>`, `<article>` 등 적절한 태그 사용

## 배포

### Vercel 배포

1. **환경 변수 설정**
   - Vercel 프로젝트 설정에서 Supabase 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 추가
   - 선택 사항: `SUPABASE_SERVICE_ROLE_KEY` (관리 기능용)

2. **이미지 설정**
   - `next.config.ts`에서 외부 이미지 호스트 허용 설정 완료
   - Supabase Storage 사용 시 해당 도메인 추가 필요

3. **데이터베이스 보안**
   - Supabase Row Level Security(RLS) 정책 활성화 권장
   - 서버 액션에서 필요한 권한 정책 확인

### 성능 최적화

- **Next.js Image 컴포넌트**: 자동 이미지 최적화 및 lazy loading
- **Server Components**: 데이터 페칭을 서버에서 처리하여 클라이언트 번들 크기 감소
- **React.cache()**: Supabase 쿼리에 캐싱 적용 (요청 레벨)
- **Tailwind CSS**: 사용하지 않는 스타일 자동 제거 (PurgeCSS)

## 향후 확장 계획

- **관리자 대시보드**: 이벤트 승인, 사용자 관리, 통계 대시보드
- **파트너 포털**: 공연 등록, 이벤트 개설, 응모 현황 확인
- **추첨 시스템**: 자동 추첨 및 당첨자 이메일 발송
- **소셜 인증**: 간편 로그인 (Google, Kakao 등)

## 문의 및 지원

- **이메일**: contact@artause.kr
- **문의 시간**: 평일 08:00 ~ 22:00 KST (Quiet Hours 22:00 ~ 08:00)

---

**Artause Invitation Hub** - 공연과 관객을 연결하는 가장 단순한 방법
