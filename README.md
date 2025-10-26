# Artause Web Platform

Next.js 기반으로 재구축한 Artause 공연 마케팅 플랫폼입니다. Supabase를 백엔드로 사용해 공연 데이터, 홍보 의뢰, 초대권 이벤트를 통합 관리할 수 있으며, 관객은 현재 진행 중인 공연과 이벤트를 한 곳에서 확인하고 응모할 수 있습니다.

## 주요 기능

- **홈**: 대표 공연, 진행 중 캠페인, 초대권 이벤트 하이라이트
- **Spotlight**: 필터와 검색이 가능한 공연 사례 아카이브
- **Spotlight 상세**: 공연별 홍보 포인트, 수행 업무, 초대권 이벤트 연동
- **홍보 상담 폼**: 서버 액션 기반 Supabase 연동, 미설정 시 모의 저장으로 대체
- **초대권 이벤트**: 진행 중인 이벤트 리스트와 외부 응모 링크 안내

Supabase 환경 변수가 설정되지 않은 경우 `src/lib/mocks/performances.ts`에 정의된 더미 데이터로 자동 폴백됩니다.

## 기술 스택

- Framework: [Next.js 15 (App Router)](https://nextjs.org/)
- Language: TypeScript, React Server Components
- Styling: Tailwind CSS (v4 preview), 커스텀 유틸리티 클래식
- Backend: Supabase (PostgreSQL, Edge Functions 대비)
- Validation: Zod

## 프로젝트 구조

```
├── legacy_site/               # 기존 정적 HTML 자산 보관소
├── public/
│   └── images/mock/           # 폴백용 목업 포스터
├── src/
│   ├── app/                   # App Router 페이지
│   │   ├── (기능별 폴더)
│   │   └── layout.tsx         # 공통 레이아웃 + Shell
│   ├── components/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── marketing/         # 카드/섹션 컴포넌트
│   ├── lib/
│   │   ├── config.ts
│   │   ├── models/            # Zod 스키마
│   │   ├── mocks/             # Supabase 미사용 시 목업 데이터
│   │   └── supabase/          # 클라이언트, 서버, 쿼리 래퍼
│   └── styles/
├── supabase/
│   └── migrations/0001_init.sql  # 공연/홍보/이벤트 기본 스키마
└── README.md
```

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

## 개발 스크립트

```bash
npm install          # 의존성 설치
npm run dev          # http://localhost:3000 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 검사 (로컬 환경에 따라 플러그인 설치가 필요할 수 있음)
```

> ?? `npm run lint` 실행 시 `eslint-plugin-react` 모듈 관련 오류가 발생한다면 `npm install eslint-plugin-react@latest` 후 다시 시도해 주세요.

## Vercel 배포 팁

- Vercel 프로젝트 설정에서 Supabase 환경 변수를 추가합니다.
- 이미지 로더가 외부 URL을 허용하도록 `next.config.ts`에서 `images.remotePatterns`를 이미 설정했습니다.
- Supabase Row Level Security를 사용하는 경우 서버 액션에 필요한 정책을 잊지 말고 적용해 주세요.

## 레거시 자산

기존 정적 사이트는 `legacy_site/` 폴더에 그대로 보관했습니다. 과거 HTML, CSV, 스크립트를 참고하거나 마이그레이션 자료로 활용할 수 있습니다.

---

필요한 추가 페이지나 어드민 대시보드가 있다면 Supabase Row-Level Security와 Next.js Server Actions를 조합해 쉽게 확장할 수 있습니다. 언제든지 이어서 작업해 드릴게요!
