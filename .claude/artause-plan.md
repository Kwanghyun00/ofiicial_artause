# Artause 개발 로드맵

> **마지막 업데이트**: 2026년 5월 27일
> **현재 포지션**: SNS 공연 큐레이션 허브 MVP — "알터즈 SNS에서 소개한 공연을 웹사이트에서 더 깊이 알 수 있는 곳"

---

## ★ 현재 전략 방향 (2026.05 리포지셔닝)

초대권 이벤트 시스템 완성까지 시간이 필요하다. 그 사이 SNS 팔로워들이 웹사이트에서 즉시 가치를 경험할 수 있어야 한다. **공연 큐레이션 허브**를 먼저 완성하고 단계적으로 확장한다.

```
Phase 1 (완료)   SNS 팔로워 유입 → 큐레이션 에세이 + SNS 픽 공연 상세 정보
Phase 2 (다음)   공연 정보 검색 강화 (KOPIS 데이터 누적, /shows 고도화)
Phase 3 (이후)   공연 취향 분석 고도화 (/taste → DB 저장 → 개인화 추천)
Phase 4 (나중)   로그인 + 북마크 + 리뷰 시스템 완성
Phase 5 (나중)   초대권 이벤트 시스템 재활성화
```

### MVP 현재 헤더 구조 (Phase 1)
```
[로고]                                          [파트너 문의]
```
- 네비게이션 없음 — 탐색은 홈페이지 섹션과 푸터로
- 푸터에 모든 링크 유지 (공연검색/후기/취향테스트는 URL 직접 접근 가능)

---

## Phase 1 완성 현황 ✅ (Week 8, 2026.05.27)

| 기능 | 상태 | 비고 |
|------|------|------|
| 홈 헤더 네비게이션 제거 | ✅ | 로고 + 파트너 문의만 |
| 홈 섹션 재구성 | ✅ | SNS픽 캐러셀 → 쇼케이스 → 에세이 → 후기 |
| SNS 에디터 픽 캐러셀 | ✅ | Embla, 홈 Hero 아래 배치 |
| SNS 픽 관리자 UI | ✅ | `/admin/sns-picks` |
| 큐레이션 에세이 `/blog` | ✅ | 목록 + 상세 (react-markdown) |
| 에세이 관리자 CMS | ✅ | `/admin/blog` |
| 공연 상세 알터즈 픽 뱃지 + 캡션 | ✅ | `/shows/[slug]` |
| 공연 상세 관련 에세이 | ✅ | `/shows/[slug]` |
| 사이트맵 `/blog` 추가 | ✅ | `src/app/sitemap.ts` |
| 초대권/체험단 UI 숨김 | ✅ | nav 제거, URL 직접 접근 유지 |

### 배포 전 필요한 DB 마이그레이션

```sql
-- Supabase 대시보드 SQL Editor에서 순서대로 실행
-- 1) SNS 픽 테이블 생성
supabase/migrations/20260527000200_create_sns_picks.sql

-- 2) 블로그 컬럼 추가
supabase/migrations/20260527000300_blog_add_columns.sql
```

---

## Phase 2 — 공연 정보 검색 강화 (예정)

> 목표: "공연명 예매", "서울 뮤지컬 2026" 검색 상위 노출

- KOPIS 데이터 누적 확대 (`KOPIS_SYNC_TARGET_COUNT=2000`)
- `/shows` 표시 제한 확장 (현재 → 500개 이상)
- 장르/지역 필터 UI 개선
- 예매 정보 CTA 강화 (티켓 구매 버튼)
- 헤더에 "공연 검색" nav 재추가 시점 결정

---

## Phase 3 — 공연 취향 분석 고도화 (예정)

> 목표: 취향 결과 DB 저장 → 개인화 추천

- `/taste` 결과 → `users.taste_persona` 저장
- 쿠키 기반 익명 세션 (로그인 전 단계)
- 취향 기반 공연 추천 섹션 홈페이지 노출
- 헤더에 "취향 테스트" nav 재추가 시점 결정

---

## Phase 4 — 로그인 + 북마크 + 리뷰 (예정)

> 목표: Supabase Auth 소셜 로그인, 개인화 기능

- 카카오/네이버 소셜 로그인
- 헤더에 로그인 버튼 + 북마크 아이콘 재추가
- `/my` 페이지 — 북마크한 공연, 최근 본 공연
- 로그인 기반 리뷰 작성 → 헤더 "후기" nav 재추가

---

## Phase 5 — 초대권 이벤트 재활성화 (예정)

> 목표: 파트너 → 캠페인 → 신청 → 추첨 → 당첨 → 리뷰 전체 플로우

| 기능 | 현재 완성도 | 재활성화 시 필요 작업 |
|------|------------|----------------------|
| 초대권 신청 플로우 | 95% | 이메일 발송 최종 연동 확인 |
| 관리자 승인 | 75% | 인증 재확인 |
| 당첨자 추첨 | 70% | 알고리즘 검증 |
| 파트너 대시보드 | 90% | 최종 UX 점검 |

재활성화 시:
- 홈 `FeaturedInvitations` 섹션 재추가
- 헤더 nav "체험단 모집" 재추가
- HomeHero 초대권 CTA 재추가

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 15 (App Router + Turbopack) |
| DB / Auth | Supabase (PostgreSQL + RLS) |
| 스타일 | Tailwind CSS v4 |
| 캐러셀 | Embla Carousel |
| 마크다운 | react-markdown + remark-gfm |
| 배포 | Vercel |
| 데이터 | KOPIS API 자동 동기화 (24시간) |

---

## 일일 작업 원칙

1. **빌드 확인 필수**: 매일 작업 종료 전 `npm run build` 통과 확인
2. **graceful degradation**: 새 DB 기능은 42P01/42703 에러 핸들링 필수
3. **URL은 유지**: 숨기는 기능은 nav에서만 제거, 라우트 파일 삭제 금지
4. **모바일 우선**: UI 변경 시 항상 모바일 뷰 먼저 확인
5. **DB 변경 주의**: 마이그레이션 파일은 로컬 우선 테스트 후 Supabase 적용

---

---

# 완료된 주차별 작업 이력

---

## Week 1 — SEO 기반 구축 + 보안 긴급 수정 ✅

**목표**: 구글이 사이트를 제대로 색인할 수 있게 하고, 관리자 페이지 보안 구멍을 막는다.

#### Day 1 (월) — sitemap.xml 자동 생성
- [x] `src/app/sitemap.ts` 파일 생성 (Next.js App Router 방식)
- [x] `/shows/[slug]` 전체 URL 포함 (DB에서 모든 performance slug 조회)
- [x] `/invites/[slug]` 캠페인 URL 포함
- [x] `/reviews` 및 정적 페이지 포함
- [x] 배포 후 구글 서치콘솔에 sitemap 제출

#### Day 2 (화) — robots.txt + OG 태그 보완
- [x] `src/app/robots.ts` 파일 생성
- [x] `/admin`, `/event-center`, `/partner` 크롤링 차단 설정
- [x] `/reviews/page.tsx` OG 태그 추가 (현재 title/description만 있음)
- [x] 홈페이지 Organization JSON-LD 추가

#### Day 3 (수) — 관리자 인증 미들웨어 추가 (P0)
- [x] `src/middleware.ts` 에 `/admin` 경로 인증 체크 추가
- [x] Supabase 세션 기반 admin role 검증
- [x] 미인증 시 로그인 페이지로 리다이렉트
- [x] 관리자 로그인 페이지 생성 또는 기존 인증 연동

#### Day 4 (목) — `selection_status` 버그 수정 (P0)
- [x] `src/app/event-center/actions.ts:570` 쿼리 조건 수정
- [x] `is('selection_status', null)` → `.eq('selection_status', 'pending')` 으로 변경
- [x] 기존 `ticket_entries` DB 데이터 `selection_status` 기본값 확인
- [x] 추첨 기능 로컬에서 end-to-end 테스트

#### Day 5 (금) — 검토 및 배포
- [x] 1주차 작업 전체 리뷰
- [x] `npm run build` 빌드 오류 없음 확인
- [x] `npm run lint` 린트 통과 확인
- [x] Vercel 배포 후 sitemap URL 직접 확인
- [x] 구글 서치콘솔 URL 검사 도구로 크롤링 테스트

---

## Week 2 — 이메일 연동 + 추첨 알고리즘 수정 ✅

**목표**: 당첨 안내, 신청 확인 이메일을 실제로 발송할 수 있게 한다.

#### Day 1 (월) — 이메일 서비스 설정
- [x] Resend 계정 생성 및 도메인 인증 (artause.co.kr)
- [x] `.env.local` 에 API 키 추가
- [x] `src/lib/email/` 디렉토리 생성
- [x] 이메일 발송 유틸 함수 작성 (`sendEmail(to, subject, html)`)

#### Day 2 (화) — 이메일 템플릿 작성
- [x] 신청 접수 확인 템플릿 (신청자명, 공연명, 신청일시)
- [x] 당첨 안내 템플릿 (공연일, 장소, 확인 방법)
- [x] 캠페인 승인 안내 템플릿 (파트너용)
- [x] 캠페인 거부 안내 템플릿 (파트너용, 사유 포함)

#### Day 3 (수) — 이메일 발송 연결 (신청/승인)
- [x] 초대권 신청 완료 시 확인 이메일 발송 연결
- [x] 캠페인 승인 시 파트너 이메일 발송 연결
- [x] 캠페인 거부 시 파트너 이메일 발송 연결
- [x] 관리자 거부 사유 입력 UI 추가

#### Day 4 (목) — 당첨 이메일 + 추첨 알고리즘 수정
- [x] 추첨 완료 시 당첨자 이메일 발송 연결
- [x] Fisher-Yates 셔플 알고리즘으로 교체
- [x] 추첨 이력 로깅
- [x] 추첨 결과 파트너 대시보드에 목록으로 표시

#### Day 5 (금) — 테스트 및 배포
- [x] 이메일 발송 전체 플로우 테스트
- [x] 스팸 필터 우회 설정 확인 (SPF, DKIM 레코드)
- [x] 배포 및 실제 이메일 수신 확인

---

## Week 3 — 리뷰 페이지 SEO화 ✅

**목표**: "공연명 + 후기/리뷰" 키워드로 구글 검색 유입을 만든다.

#### Day 1 (월) — 리뷰 독립 URL 구조 설계
- [x] `/reviews/[performanceSlug]` 라우트 생성
- [x] 공연별 리뷰 목록 페이지 구현
- [x] 기존 `/reviews?organization=` 필터와 호환성 유지
- [x] 공연 상세 페이지에서 리뷰 섹션 링크 연결

#### Day 2 (화) — AggregateRating JSON-LD 추가
- [x] 리뷰 페이지에 `AggregateRating` 스키마 추가
- [x] 공연 상세 페이지 JSON-LD에도 `aggregateRating` 필드 추가

#### Day 3 (수) — 리뷰 페이지 메타데이터 강화
- [x] 동적 메타데이터 생성 (`generateMetadata`)
- [x] OG 이미지로 공연 포스터 사용

#### Day 4 (목) — 리뷰 작성 리마인더 이메일
- [x] 당첨자 공연일 D-3 시점 리뷰 리마인더 이메일
- [x] Vercel Cron Job 매일 오전 9시 설정

#### Day 5 (금) — 검토 및 배포
- [ ] 리뷰 페이지 구글 서치콘솔 URL 검사
- [x] 리뷰 작성 전체 플로우 테스트
- [x] sitemap에 `/reviews/[slug]` URL 추가

---

## Week 4 — 공연 상세 콘텐츠 강화 ✅

**목표**: KOPIS에서 가져오는 출연진/가격/일정 데이터를 공연 상세 페이지에 풍부하게 표시한다.

#### Day 1 (월) — 공연 상세 페이지 현황 파악
- [x] `/shows/[slug]` 에서 현재 표시하는 필드 목록 정리
- [x] KOPIS에서 가져오지만 표시 안 하는 필드 파악

#### Day 2 (화) — 출연진 / 제작진 섹션
- [x] `cast_info` 파싱 후 출연진 카드 UI 구현
- [x] `crew_info` 파싱 후 제작진 섹션 구현

#### Day 3 (수) — 가격 / 일정 / 상세 이미지 섹션
- [x] `price_info` 파싱 후 티켓 가격표 UI
- [x] `schedule_info` 파싱 후 요일별 공연 시간표 UI
- [x] `detail_images` 갤러리 컴포넌트

#### Day 4 (목) — 공연 단체 프로필 페이지 초안
- [x] `/partners/[slug]` 라우트 생성
- [x] `organizations` 테이블 데이터 표시

#### Day 5 (금) — 검토 및 배포
- [x] 공연 상세 페이지 모바일 레이아웃 확인
- [x] KOPIS 이미지 Next.js Image 최적화 처리

---

## Week 5 — 초대권 신청 플로우 완성 ✅

**목표**: Edge Function 없이도 신청이 완전히 동작하도록 인라인 코드로 대체한다.

#### Day 1 (월) — `campaign-entry-submit` 인라인화
- [x] Edge Function 호출 코드 제거 → 직접 insert로 대체
- [x] 필수 필드 검증 로직 서버 액션 내부 작성
- [x] 신청 제출 end-to-end 테스트

#### Day 2 (화) — 중복 신청 방지
- [x] `(campaign_id, applicant_email)` unique constraint 마이그레이션
- [x] 서버 액션 중복 시 명확한 에러 메시지
- [x] 폼 UI 이미 신청한 경우 상태 표시

#### Day 3 (수) — `penalty-apply` 인라인화
- [x] 노쇼 패널티 로직 서버 액션으로 이전
- [x] `user_penalties` insert, `trust_score` 감산, `is_restricted` 업데이트
- [x] 패널티 적용 후 사용자 알림 이메일

#### Day 4 (목) — 신청 상태 페이지
- [x] `/my/entries` 신청 현황 페이지
- [x] 상태 표시: 신청 완료 / 당첨 / 미당첨 / 출석 완료 / 추첨 완료

#### Day 5 (금) — 검토 및 배포
- [x] 전체 신청 → 추첨 → 당첨 이메일 → 출석 플로우 테스트
- [x] `npm run build` 빌드 오류 없음 확인

---

## Week 6 — 장르/지역 큐레이션 페이지 ✅

**목표**: "서울 뮤지컬 공연 2026" 같은 롱테일 키워드로 검색 유입 다각화.

#### Day 1 (월) — URL 구조 설계
- [x] `/shows/genre/[genre]`, `/shows/region/[region]` 라우트 설계
- [x] `src/constants/curation.ts` 장르/지역 상수 파일 생성
- [x] `getPerformancesByGenre()`, `getPerformancesByRegion()` 쿼리 함수 추가

#### Day 2 (화) — 장르 페이지 구현
- [x] 장르별 정적 파라미터 목록 (`generateStaticParams` — 7개 장르)
- [x] 장르별 동적 메타데이터
- [x] 장르 빠른 이동 칩 UI

#### Day 3 (수) — 지역 페이지 구현
- [x] 지역별 정적 파라미터 (`generateStaticParams` — 15개 지역)
- [x] 지역 내 장르 필터 지원 (`?genre=musical`)

#### Day 4 (목) — 내부 링크 구조 강화
- [x] `/shows` 페이지에 장르별/지역별 큐레이션 링크 추가
- [x] 공연 상세 페이지에 "같은 장르/지역 공연 더보기" 링크
- [x] sitemap에 장르(7개) + 지역(15개) URL 추가

#### Day 5 (금) — 검토 및 배포
- [x] `npm run build` 통과 (64페이지 빌드)
- [x] 배포

---

## Week 7 — 이미지 업로드 + 파트너 UX 개선 ✅

**목표**: 캠페인 생성 시 이미지를 실제로 저장하고, 파트너 경험을 개선한다.

#### Day 1 (월) — Supabase Storage 설정
- [x] Supabase Storage 버킷 생성 (`performance-assets`)
- [x] RLS 정책 설정 (파트너만 업로드, 퍼블릭 읽기)

#### Day 2 (화) — 포스터 이미지 업로드 구현
- [x] `EnhancedEventCreationWizard.tsx` 이미지 업로드 로직 구현
- [x] 업로드 → 공개 URL → `ticket_campaigns.poster_image` 저장
- [x] 파일 크기/형식 검증 (5MB 이하, jpg/png/webp)

#### Day 3 (수) — 스틸 이미지 업로드 구현
- [x] 다중 이미지 업로드 (최대 5장)
- [x] 이미지 순서 변경 UI

#### Day 4 (목) — 파트너 대시보드 UX 개선
- [x] 캠페인 생성 후 "승인 대기 중" 상태 명확히 표시
- [x] 캠페인 목록 상태별 필터 (대기/승인/진행중/종료)
- [x] 거부된 캠페인에 사유 표시
- [x] 캠페인 수정 기능 (승인 전에만) — `/event-center/edit/[id]`

#### Day 5 (금) — 검토 및 배포
- [x] TypeScript 타입 오류 수정
- [x] `npm run build` 빌드 성공 확인

---

## Week 8 — 공연 큐레이션 허브 리포지셔닝 ✅

**목표**: SNS 팔로워가 웹사이트에서 즉시 가치를 경험할 수 있는 MVP 완성.

#### SNS 픽 시스템 (A-1~A-5)
- [x] `sns_picks` 테이블 마이그레이션 + RLS
- [x] `getActiveSnsPicksWithPerformances`, `getSnsPickForPerformance` 쿼리
- [x] 관리자 UI: `/admin/sns-picks` (공연 검색, 채널/캡션/기간/활성 설정, 순서 변경)
- [x] 홈 `SnsPicksSection` Embla 캐러셀 (Hero 아래 배치)
- [x] 공연 상세 `✦ 알터즈 픽` 뱃지 + 캡션 callout

#### 블로그/에세이 시스템 (B-1~B-5)
- [x] `community_posts`에 `is_published`, `performance_id` 컬럼 추가 마이그레이션
- [x] `/blog` 목록 + `/blog/[slug]` 상세 (react-markdown + remark-gfm)
- [x] 관리자 CMS: `/admin/blog` (목록/신규/수정, 마크다운 프리뷰, 공연 연결)
- [x] 홈 `LatestBlogSection` (최신 3편)
- [x] 공연 상세 관련 에세이 섹션
- [x] 사이트맵 `/blog`, `/blog/[slug]` 추가

#### 홈페이지 + 네비게이션 재편
- [x] 홈 헤드라인: "공연, 알터즈와 함께 발견하세요"
- [x] 홈 섹션 순서: Hero → SNS픽 → 쇼케이스 → 에세이 → 후기 → CTA
- [x] 헤더 네비게이션 완전 제거 (로고 + 파트너 문의만)
- [x] 푸터: 공연검색/후기/취향테스트 각주 유지 (URL 직접 접근 가능)
- [x] 초대권/체험단 관련 UI 모두 숨김 처리

---

*이 문서는 진행 상황에 따라 지속 업데이트합니다.*
