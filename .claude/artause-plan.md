# Artause 개발 로드맵 & 데일리 플랜

> **마지막 업데이트**: 2026년 5월 27일
> **목표**: 공연 정보 허브로 자연 유입을 늘리고, 파트너 → 캠페인 → 신청 → 당첨 → 리뷰까지 전체 플로우를 실제로 동작하게 만든다.

---

## 1. 프로젝트 현황 요약

### 플랫폼 개요

| 항목 | 내용 |
|------|------|
| **스택** | Next.js 15 (App Router) + Supabase + Tailwind CSS v4 |
| **역할** | 관객(B2C) / 공연 파트너(B2B) / 관리자 |
| **핵심 기능** | 초대권 이벤트 캠페인, 공연 정보, 리뷰 |
| **데이터 소스** | KOPIS API 자동 동기화 (24시간 주기) |
| **배포** | Vercel |

### 전체 플로우 완성도

| 단계 | 완성도 | 상태 |
|------|--------|------|
| 공연 파트너 등록 | 30% | 🔴 회원가입 없음, 초대코드 로그인만 존재 |
| 캠페인 생성 | 70% | 🟡 이미지 업로드 미구현, 일부 데이터 미저장 |
| 관리자 승인 | 75% | 🔴 `/admin` 인증 없음 (누구나 접근 가능) |
| 관객 초대권 신청 | 95% | 🟢 중복 신청 방지 완료, 확인 이메일 발송 완료 |
| 당첨자 추첨 | 70% | 🟡 알고리즘 편향, 추첨 이력 없음 |
| 당첨 확인 / 출석 | 80% | 🟡 당첨 안내 이메일 완료, Edge Function 인라인화 완료 |
| 리뷰 작성 | 80% | 🟡 모더레이션 UI 없음, 알림 미발송 |
| SEO / 콘텐츠 | 60% | 🟡 sitemap 없음, robots.txt 없음 |

---

## 2. 발견된 문제 목록

### 🔴 P0 — 즉시 차단 (운영 불가)

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| 1 | `/admin` 인증 미들웨어 없음 | `src/app/admin/page.tsx` | 누구나 캠페인 승인/거부 가능 |
| 2 | ~~`campaign-entry-submit` Edge Function 없음~~ | ~~`src/app/events/tickets/[slug]/actions.ts`~~ | ✅ 직접 insert로 인라인화 완료 |
| 3 | ~~`penalty-apply` Edge Function 없음~~ | ~~`src/components/event-center/AttendanceConsole.tsx`~~ | ✅ 직접 DB 로직으로 인라인화 완료 |
| 4 | 이메일 발송 코드 없음 | 전체 코드베이스 | 당첨 안내, 신청 확인 등 모든 알림 불가 |
| 5 | `selection_status` 쿼리 조건 불일치 | `src/app/event-center/actions.ts:570` | DB 기본값 `'pending'`인데 `null`로 조회 → 추첨 대상 0명 |

### 🟡 P1 — 운영 품질 (빠른 시일 내 수정)

| # | 문제 | 위치 | 영향 |
|---|------|------|------|
| 6 | 추첨 알고리즘 편향 (`Math.random() - 0.5`) | `actions.ts:577` | 공정한 추첨 불가 |
| 7 | 이미지 업로드 미구현 | `EnhancedEventCreationWizard.tsx:170` | 포스터 이미지 저장 안 됨 |
| 8 | 중복 신청 방지 없음 | `TicketEntryForm.tsx` | 같은 이메일로 무한 신청 가능 |
| 9 | 캠페인 승인/거부 후 파트너 이메일 없음 | `actions.ts:125-198` | 파트너가 결과를 알 수 없음 |
| 10 | 관리자 ID 하드코딩 | `actions.ts:139` | 승인 이력 추적 불가 |

### 🟢 P2 — 사용자 경험 (여유 있을 때)

| # | 문제 | 영향 |
|---|------|------|
| 11 | QR 코드 생성/스캔 없음 | 현장 출석 체크 수동으로만 가능 |
| 12 | 파트너 회원가입 플로우 없음 | 초대코드 방식으로만 운영 |
| 13 | 리뷰 관리자 검토 UI 없음 | 신고된 리뷰 처리 방법 없음 |
| 14 | 리뷰 작성 리마인더 이메일 없음 | 리뷰 수 저조 |

---

## 3. 전략 방향

### "공연 정보 허브"로 자연 유입 만들기

```
KOPIS 데이터 (이미 동기화 중)
    ↓
SEO 최적화 공연 상세 페이지
    ↓
"공연명 + 후기 / 초대권 / 일정" 키워드 검색 유입
    ↓
초대권 이벤트 신청 전환
    ↓
리뷰 축적 → 재유입 선순환
```

### 콘텐츠 확장 우선순위

1. **공연 상세 페이지 강화** — KOPIS 출연진/가격/일정 데이터 적극 노출
2. **리뷰 페이지 SEO화** — `/reviews/[slug]` 독립 URL + AggregateRating JSON-LD
3. **장르/지역 큐레이션 페이지** — "서울 뮤지컬 2026" 키워드 타겟
4. **공연 단체 프로필 페이지** — 극단/제작사 검색 유입
5. **공연 가이드 콘텐츠** — "초대권 이벤트란?" 등 정보성 글

---

## 4. 8주 로드맵

### 전체 일정 개요

| 주차 | 테마 | 목표 |
|------|------|------|
| 1주차 | SEO 기반 + 보안 긴급 수정 | sitemap, robots, admin 인증 |
| 2주차 | 이메일 연동 + 추첨 수정 | 핵심 플로우 동작 가능 상태 |
| 3주차 | 리뷰 콘텐츠 SEO화 | 리뷰 기반 검색 유입 |
| 4주차 | 공연 상세 콘텐츠 강화 | KOPIS 데이터 풀 활용 |
| 5주차 | 신청 플로우 완성 | Edge Function 대체, 중복 방지 |
| 6주차 | 장르/지역 큐레이션 | 롱테일 키워드 확보 |
| 7주차 | 이미지 업로드 + 파트너 UX | 캠페인 생성 완성도 |
| 8주차 | QR 출석 + 리뷰 모더레이션 | 오프라인 연동 |

---

## 5. 주차별 데일리 플랜

---

### Week 1 — SEO 기반 구축 + 보안 긴급 수정

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

### Week 2 — 이메일 연동 + 추첨 알고리즘 수정

**목표**: 당첨 안내, 신청 확인 이메일을 실제로 발송할 수 있게 한다.

#### Day 1 (월) — 이메일 서비스 설정
- [x] Resend 또는 SendGrid 계정 생성 및 도메인 인증 (artause.co.kr)
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
- [x] 캠페인 승인 시 파트너 이메일 발송 연결 (`actions.ts:125`)
- [x] 캠페인 거부 시 파트너 이메일 발송 연결 (`actions.ts:174`)
- [x] 관리자 거부 사유 입력 UI 추가 (`ApprovalQueue.tsx`)

#### Day 4 (목) — 당첨 이메일 + 추첨 알고리즘 수정
- [x] 추첨 완료 시 당첨자 이메일 발송 연결
- [x] Fisher-Yates 셔플 알고리즘으로 교체 (`actions.ts:577`)
- [x] 추첨 이력 로깅 (campaign_id, draw_at, winner_count, algorithm_version)
- [x] 추첨 결과 파트너 대시보드에 목록으로 표시

#### Day 5 (금) — 테스트 및 배포
- [x] 이메일 발송 전체 플로우 테스트 (신청 → 승인 → 추첨 → 당첨 이메일)
- [x] 스팸 필터 우회 설정 확인 (SPF, DKIM 레코드)
- [x] 배포 및 실제 이메일 수신 확인

---

### Week 3 — 리뷰 페이지 SEO화

**목표**: "공연명 + 후기/리뷰" 키워드로 구글 검색 유입을 만든다.

#### Day 1 (월) — 리뷰 독립 URL 구조 설계
- [x] `/reviews/[performanceSlug]` 라우트 생성
- [x] 공연별 리뷰 목록 페이지 구현
- [x] 기존 `/reviews?organization=` 필터와 호환성 유지
- [x] 공연 상세 페이지 (`/shows/[slug]`)에서 리뷰 섹션 링크 연결

#### Day 2 (화) — AggregateRating JSON-LD 추가
- [x] 리뷰 페이지에 `AggregateRating` 스키마 추가
- [x] 공연 상세 페이지 JSON-LD에도 `aggregateRating` 필드 추가
- [x] 구글 리치 스니펫 미리보기 도구로 검증

#### Day 3 (수) — 리뷰 페이지 메타데이터 강화
- [x] 동적 메타데이터 생성 (`generateMetadata`)
  - title: `"${공연명} 리뷰 | 알터즈"`
  - description: 최근 리뷰 요약 + 평균 별점
- [x] OG 이미지로 공연 포스터 사용
- [x] 소셜 공유 시 리뷰 내용 미리보기 확인

#### Day 4 (목) — 리뷰 작성 리마인더 이메일
- [x] 당첨자 중 공연일 D-3 시점에 리뷰 리마인더 이메일 발송
- [x] Vercel Cron Job 으로 매일 오전 9시 실행 설정
- [x] `ticket_entries` 에서 `attendance_status = 'checked_in'` + 리뷰 미작성자 조회

#### Day 5 (금) — 검토 및 배포
- [ ] 리뷰 페이지 구글 서치콘솔 URL 검사
- [x] 리뷰 작성 전체 플로우 테스트
- [x] sitemap에 `/reviews/[slug]` URL 추가

---

### Week 4 — 공연 상세 콘텐츠 강화

**목표**: KOPIS에서 가져오는 출연진/가격/일정 데이터를 공연 상세 페이지에 풍부하게 표시한다.

#### Day 1 (월) — 공연 상세 페이지 현황 파악
- [x] `/shows/[slug]` 에서 현재 표시하는 필드 목록 정리
- [x] KOPIS에서 가져오지만 표시 안 하는 필드 파악 (`cast_info`, `crew_info`, `price_info`, `schedule_info`, `detail_images`)
- [x] UI 개선 범위 결정

#### Day 2 (화) — 출연진 / 제작진 섹션
- [x] `cast_info` 파싱 후 출연진 카드 UI 구현
- [x] `crew_info` 파싱 후 제작진 섹션 구현
- [ ] 인물명 클릭 시 해당 인물 출연 공연 검색 연결 (추후)

#### Day 3 (수) — 가격 / 일정 / 상세 이미지 섹션
- [x] `price_info` 파싱 후 티켓 가격표 UI
- [x] `schedule_info` 파싱 후 요일별 공연 시간표 UI
- [x] `detail_images` 갤러리 컴포넌트 (`DetailImageGallery.tsx` 활용)

#### Day 4 (목) — 공연 단체 프로필 페이지 초안
- [x] `/partners/[slug]` 라우트 생성
- [x] `organizations` 테이블 데이터 표시 (소개, SNS, 공연 목록)
- [x] 공연 상세 페이지에서 단체명 클릭 시 이동 연결

#### Day 5 (금) — 검토 및 배포
- [x] 공연 상세 페이지 모바일 레이아웃 확인
- [x] KOPIS 이미지 HTTP → Next.js Image 최적화 처리 확인
- [ ] 배포 후 실제 공연 페이지 3개 이상 직접 확인

---

### Week 5 — 초대권 신청 플로우 완성

**목표**: Edge Function 없이도 신청이 완전히 동작하도록 인라인 코드로 대체한다.

#### Day 1 (월) — `campaign-entry-submit` 인라인화
- [x] Edge Function 호출 코드 제거
- [x] Supabase 직접 insert로 대체 (`ticket_entries` 테이블)
- [x] 필수 필드 검증 로직 서버 액션 내부에 작성
- [x] 신청 제출 end-to-end 테스트

#### Day 2 (화) — 중복 신청 방지
- [x] `ticket_entries` 테이블에 `(campaign_id, applicant_email)` unique constraint 추가 (마이그레이션)
- [x] 서버 액션에서 중복 시 명확한 에러 메시지 반환
- [x] 폼 UI에서 이미 신청한 경우 상태 표시

#### Day 3 (수) — `penalty-apply` 인라인화
- [x] Edge Function 호출 제거
- [x] 노쇼 패널티 로직 서버 액션으로 이전
  - `user_penalties` insert
  - `users.trust_score` 감산 업데이트
  - `users.is_restricted` 조건부 업데이트
- [x] 패널티 적용 후 사용자 알림 이메일 발송

#### Day 4 (목) — 신청 상태 페이지
- [x] 신청자가 본인 신청 현황을 확인할 수 있는 페이지 (`/my/entries`)
- [x] 이메일 기반 조회 (이메일 입력 → URL 파라미터 방식)
- [x] 상태 표시: 신청 완료 / 당첨 / 미당첨 / 출석 완료 / 미관람 / 추첨 완료

#### Day 5 (금) — 검토 및 배포
- [x] 전체 신청 → 추첨 → 당첨 이메일 → 출석 플로우 테스트
- [x] 패널티 적용 후 재신청 차단 확인
- [x] `npm run build` 빌드 오류 없음 확인
- [x] 배포

---

### Week 6 — 장르/지역 큐레이션 페이지

**목표**: "서울 뮤지컬 공연 2026" 같은 롱테일 키워드로 검색 유입 다각화.

#### Day 1 (월) — URL 구조 설계
- [x] `/shows/genre/[genre]` 라우트 설계 (`/shows/[slug]`와 충돌 방지)
- [x] `/shows/region/[region]` 라우트 설계
- [x] `src/constants/curation.ts` 장르/지역 상수 파일 생성
- [x] `getPerformancesByGenre()`, `getPerformancesByRegion()` 쿼리 함수 추가

#### Day 2 (화) — 장르 페이지 구현
- [x] 장르별 정적 파라미터 목록 정의 (`generateStaticParams` — 7개 장르)
- [x] 장르별 동적 메타데이터 (title, description, OG)
- [x] 장르 설명 텍스트 섹션 추가 (SEO용)
- [x] 장르 빠른 이동 칩 UI + 지역별 탐색 링크

#### Day 3 (수) — 지역 페이지 구현
- [x] 지역별 정적 파라미터 목록 정의 (`generateStaticParams` — 15개 지역)
- [x] 지역별 동적 메타데이터
- [x] 지역 내 장르 필터 지원 (`?genre=musical` searchParams 방식)
- [x] 장르별 탐색 링크

#### Day 4 (목) — 내부 링크 구조 강화
- [x] `/shows` 페이지에 장르별/지역별 큐레이션 링크 추가
- [x] 공연 상세 페이지에 "같은 장르/지역 공연 더보기" 링크 추가
- [x] sitemap에 장르(7개) + 지역(15개) 큐레이션 URL 추가

#### Day 5 (금) — 검토 및 배포
- [x] `npm run build` 통과 (64페이지 빌드, 장르 7개+지역 15개 SSG 사전 렌더링)
- [x] 모바일 페이지 확인
- [x] 배포

---

### Week 7 — 이미지 업로드 + 파트너 UX 개선

**목표**: 캠페인 생성 시 이미지를 실제로 저장하고, 파트너 경험을 개선한다.

#### Day 1 (월) — Supabase Storage 설정
- [ ] Supabase Storage 버킷 생성 (`performance-assets`)
- [ ] RLS 정책 설정 (파트너만 업로드, 퍼블릭 읽기)
- [ ] `SUPABASE_PERFORMANCE_BUCKET` 환경 변수 설정

#### Day 2 (화) — 포스터 이미지 업로드 구현
- [ ] `EnhancedEventCreationWizard.tsx` 이미지 업로드 로직 구현
- [ ] 업로드 → 공개 URL 획득 → `ticket_campaigns.poster_image` 저장
- [ ] 파일 크기/형식 검증 (5MB 이하, jpg/png/webp)
- [ ] 업로드 진행 상태 UI

#### Day 3 (수) — 스틸 이미지 업로드 구현
- [ ] 다중 이미지 업로드 (최대 5장)
- [ ] 이미지 순서 변경 UI
- [ ] `ticket_campaigns.still_images` JSON 배열로 저장

#### Day 4 (목) — 파트너 대시보드 UX 개선
- [ ] 캠페인 생성 후 "승인 대기 중" 상태 명확히 표시
- [ ] 캠페인 목록에서 상태별 필터 (대기/승인/진행중/종료)
- [ ] 거부된 캠페인에 사유 표시
- [ ] 캠페인 수정 기능 (승인 전에만 가능)

#### Day 5 (금) — 검토 및 배포
- [ ] 이미지 업로드 → 저장 → 표시 전체 플로우 확인
- [ ] KOPIS 이미지와 파트너 업로드 이미지 폴백 로직 확인
- [ ] 배포

---

### Week 8 — QR 출석 + 리뷰 모더레이션

**목표**: 현장 QR 체크인과 리뷰 관리 기능으로 오프라인-온라인 연결을 완성한다.

#### Day 1 (월) — QR 코드 생성
- [ ] `qrcode` 라이브러리 설치
- [ ] 당첨 이메일에 QR 코드 이미지 포함 (ticket_entries.qr_token 활용)
- [ ] `/tickets/[qrToken]` 모바일 티켓 페이지 생성

#### Day 2 (화) — QR 스캔 출석 체크
- [ ] 파트너용 QR 스캔 페이지 구현 (`/event-center/scan`)
- [ ] 카메라 접근 + QR 디코딩 (`@zxing/library` 또는 `html5-qrcode`)
- [ ] 스캔 시 `attendance_status = 'checked_in'` 업데이트

#### Day 3 (수) — 리뷰 관리자 검토 UI
- [ ] `/admin` 에 리뷰 모더레이션 탭 추가
- [ ] `status = 'reported'` 리뷰 목록 표시
- [ ] 숨기기 / 복구 액션 구현
- [ ] 리뷰 신고 버튼을 리뷰 카드에 추가

#### Day 4 (목) — 리뷰 신고 플로우
- [ ] 리뷰 신고 API (`report_count` 증가)
- [ ] `report_count >= 3` 시 자동으로 `status = 'reported'` 변경
- [ ] 관리자에게 신고 알림 이메일 발송

#### Day 5 (금) — 최종 점검 및 배포
- [ ] 전체 플로우 end-to-end 테스트
  - 파트너 캠페인 생성 → 관리자 승인 → 관객 신청 → 추첨 → 당첨 이메일 → QR 체크인 → 리뷰 작성
- [ ] 성능 측정 (Lighthouse 점수 확인)
- [ ] 최종 배포

---

## 6. 기술 스택 참고

### 추가 예정 라이브러리

| 용도 | 패키지 | 비고 |
|------|--------|------|
| 이메일 발송 | `resend` | 한국 도메인 인증 용이 |
| QR 생성 | `qrcode` | 서버사이드 생성 가능 |
| QR 스캔 | `html5-qrcode` | 모바일 카메라 접근 |
| 이미지 최적화 | Supabase Storage | 기존 환경변수 설정 있음 |

### 환경 변수 추가 필요 목록

```env
# 이메일
RESEND_API_KEY=

# Cron 보안
CRON_SECRET=

# 관리자 이메일
ADMIN_EMAIL=
```

### 데이터베이스 마이그레이션 예정

- `ticket_entries` — `(campaign_id, applicant_email)` unique constraint 추가
- `campaign_approvals` — 승인/거부 이력 로깅 테이블
- `lottery_draws` — 추첨 이력 테이블 (algorithm_version, seed, winner_count)

---

## 7. 일일 작업 원칙

1. **빌드 확인 필수**: 매일 작업 종료 전 `npm run build` 통과 확인
2. **모바일 우선**: UI 변경 시 항상 모바일 뷰 먼저 확인
3. **DB 변경 주의**: 마이그레이션 파일은 되돌리기 어려우므로 로컬에서 먼저 테스트
4. **보안 우선**: 서버 액션에서 항상 파트너/관리자 인증 체크 후 데이터 접근
5. **이메일 테스트**: 실제 이메일 발송 전 Resend 대시보드 로그로 먼저 확인

---

*이 문서는 진행 상황에 따라 지속 업데이트합니다.*
