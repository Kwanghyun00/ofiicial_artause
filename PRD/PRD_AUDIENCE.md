---
title: "관객(B2C) PRD"
inherits: "./PRD_MAIN.md"
version: 1.0.0
last_updated: 2025-10-25T00:00:00+09:00 # KST
owner: PM-Name
status: draft
routes:
  - "/"
  - "/shows"
  - "/shows/{showId}"
  - "/shows/{showId}/apply"
  - "/troupes/{troupeId}"
  - "/me/**"
assumptions:
  kakao_login_only: true
  audience_membership: "none"   # 관객 무료, 멤버십 없음
---

# 0) 문서 목적
<!-- BEGIN: Purpose -->
관객 대상(B2C) 화면·기능의 요구사항을 정의한다.  
정책·수치 값은 `PRD_MAIN.md`의 `policy_defaults`를 상속하며, 본 문서는 화면/상태/오류/카피/QA 기준을 구체화한다.
<!-- END: Purpose -->

# 1) IA & 접근 가드
- **도메인**: `{{toggles.domains.b2c}}`
- **공개 라우트**: `/`, `/shows`, `/shows/{showId}`
- **보호 라우트(로그인 필요)**: `/shows/{showId}/apply`, `/me/**`
- **가드 규칙**
  - 미로그인 사용자가 보호 라우트 접근 시 **카카오 로그인**으로 리다이렉트
  - `/shows/{id}/apply`는 아래 **사전조건** 충족 필요:  
    `introSeen == true` **AND** `adVerified == true` (유효 기간 내)

# 2) 핵심 사용자 플로우
<!-- BEGIN: Audience Flow -->
1) **카카오 로그인** → 2) `/shows` 탐색(필터·검색·정렬) →  
3) **공연 상세** 열람(**Intro-first**: 스크롤 ≥ {{policy_defaults.intro_first.scroll_depth_pct}}% 또는 체류 ≥ {{policy_defaults.intro_first.dwell_sec}}초) →  
4) **AdGate**: 스폰서 방문(허용 도메인, `utm_campaign` 필수, 체류 ≥ {{policy_defaults.adgate.min_dwell_sec}}초) 검증(서버) → TTL {{policy_defaults.adgate.ttl_hours}}h →  
5) **응모** `/shows/{id}/apply`(약관/개인정보 동의, 중복 검사) →  
6) **알림**: 응모 완료/추첨 결과/대기자 승급 (조용한 시간 {{legal.quiet_hours}} 준수)  
예외) Intro-first 미충족 또는 AdGate 미검증/만료 시 `/apply` → **412**, 동일 캠페인 재응모 시 **409**.
<!-- END: Audience Flow -->

# 3) 페이지별 기능 정의

3.1 홈 /
3.1.1 데이터 의존성 / API

초기 페이로드(SSR 권장): 추천/랭킹/임박/신규 섹션 4종 + 커뮤니티 의뢰 모듈

- 외부 데이터: KOPIS 공연/전시 API → ETL → `source=kopis` 레코드, 커뮤니티·파트너 의뢰 → `source=community|partner`, `commissioned=true`.
- GET /shows?sort=reco|rank|imminent|new&contentType=performance|exhibition&source=kopis|community|partner&commissionedOnly=bool&page=1&size=10  
  ↳ 응답 필드: `contentType`, `sourceTag`, `commissioned`, `troupeSummary[]{id,name,profileUrl}`, `kopisShowId`.
- GET /community/requests?status=published&limit=4 → 홈 커뮤니티 섹션(의뢰 제목/극단/상태)

광고 슬롯: GET /ads?slot=home_hero|shows_infeed|reward_test_v1&active=true

개인화: 콜드스타트 설문(장르/지역/예산) 저장 시 추천 파라미터 + `preferredContentType` 반영

3.1.2 UI 블록 & 상호작용

히어로 배너(캐러셀 1–3장): CTA 클릭 시 외부/내부 링크, 새 탭

섹션 카드 리스트(무한 스크롤 아님): 각 섹션 “더보기” → /shows로 이동(해당 쿼리 유지)

커뮤니티 의뢰 모듈: 2열 카드(극단/의뢰명/성과 배지). `commissioned=true` 데이터만 노출, “아터우스 협업” 뱃지 + `requestedBy` 표시. 카드 내 `극단 보기` 클릭 → `/troupes/{troupeId}` 오버레이, `공연 보기` → `/shows/{showId}`.

인피드 광고: 섹션 사이 삽입, 빈도캡/우선순위 준수

3.1.3 상태 & 로딩

최초 진입: 스켈레톤(섹션별 6–8개)

실패: 재시도 버튼(백오프), 오류 토스트

3.1.4 접근성/성능/분석

키보드 포커스 이동(캐러셀 버튼, 섹션 헤더)

이미지 지연 로딩, srcset 제공, LCP ≤ 2.5s 목표

태깅: ad_impression, ad_click, home_section_click{section, showId}, community_request_click{requestId, action}, reward_ad_complete{slot, dwellSec}

3.2 공연 목록 /shows
3.2.1 데이터 의존성 / API

GET /shows?genre[]&region[]&dateFrom&dateTo&priceMin&priceMax&theme[]&contentType[]=performance|exhibition&source[]=kopis|community|partner&commissionedOnly=bool&q&sort&page&size

SSR 1페이지 + CSR 무한 스크롤(20개씩), URL 쿼리와 양방향 동기화

3.2.2 필터/정렬/검색

필터: 장르(다중), 지역(시/권역), 기간(달력), 가격대(슬라이더), 테마(토글 칩), **콘텐츠 유형**(공연/전시 복수 선택), **데이터 출처**(전체/KOPIS/커뮤니티/파트너), **커뮤니티 의뢰 우선** 토글(기본 on → commissionedOnly=true)

정렬: 인기/최신/마감임박/(옵션)거리순

검색: 제목/출연진 부분 일치, 300ms 디바운스, 엔터/버튼 제출

“필터 초기화” 원버튼 → 기본값으로 리셋 후 재조회

3.2.3 리스트/카드 컴포넌트

ShowCard

포스터(비율 고정), 제목, 기간, 장소(짧은 주소), 배지(예매/응모/임박/마감)

- **콘텐츠 유형/출처 배지**: contentType=exhibition → “전시” 라벨(보라), performance → “공연”. source=community|partner는 “의뢰” 칩, `commissioned=true`이면 “아터우스 협업” 배지 고정 노출.
- **극단 칩**: 최대 2개 `troupeSummary`를 Pill로 노출, 클릭 시 `/troupes/{id}` 새 탭(또는 모달).
- **전시 전용 정보**: 관람 가능 요일·휴관일, 관람료(무료/유료) 라벨을 기간 하단에 추가.

클릭 → /shows/{id}

무한 스크롤: 뷰포트 하단 300px 진입 시 다음 페이지 프리페치

3.2.4 예외/오류 UX

결과 없음: “조건에 맞는 공연이 없습니다” + “필터 초기화”

잘못된 기간: 즉시 검증(시작 ≤ 종료)

요청 실패: 상단 토스트 + 재시도(백오프), 마지막 성공 결과 캐시 유지

3.2.5 접근성/성능/분석

필터그룹 aria-label, 키보드 탐색, 포커스 트랩

리스트 가상화(>40개), 이미지 프리로딩 1행

태깅: search{q}, filter_change{key,val}, sort_change{key}, list_infinite_load{page}

3.3 공연 상세 /shows/{showId}
3.3.1 데이터 의존성 / API

GET /shows/{id}: 시놉시스/캐스팅/런타임·등급/기간·회차/장소/FAQ/포스터/예매링크

- 추가 필드: `contentType`, `exhibitionMeta{openHours,closedDays,feeNote}`, `troupes[]{id,name,bio,sns[]}`, `commissionedSummary{requestedBy,deliverable,storyUrl}`

이벤트 상태 조회(있을 시): GET /events?showId={id} (running/not-started/closed, drawAt, seats)

광고/스폰서: GET /ads?slot=show_detail_sidebar&showId={id}

3.3.2 레이아웃/섹션

상단 메타: 포스터, 제목, 기간·회차, 장소(지도 미니), 런타임·등급

본문: 시놉시스, 캐스팅(토글), 스틸 슬라이더, 일정표, 지도/주차, FAQ

커뮤니티 패널(commissioned=true 시 노출): 의뢰자/작성일/제작 범위, `성과 보기`(storyUrl), `의뢰 현황` 배지(의뢰중/완료). 모듈 내 `아터우스 제작 노트` 텍스트 영역.

극단 카드 리스트: `troupes[]` 1~3개 카드(로고, 소개 요약, SNS 버튼). “이 극단의 다른 공연” → `/shows?troupeId=`.

전시 정보 블록(contentType=exhibition): 관람 시간표, 휴관일, 관람료/체험비 안내 문단.

CTA 영역: 예매 버튼, 응모 버튼(조건부 활성), 안내 배지

AdGate 블록: 스폰서 카드 + “스폰서 방문” 버튼, 검증 상태/TTL 표시

3.3.3 Intro-first 판정(UI/서버)

조건(둘 중 하나 충족):

스크롤 ≥ {{policy_defaults.intro_first.scroll_depth_pct}}%

체류 ≥ {{policy_defaults.intro_first.dwell_sec}}초

충족 시:

서버에 introSeen=true(TTL {{policy_defaults.intro_first.ttl_hours}}h) 기록

응모 버튼 상태 갱신(AdGate와 AND)

3.3.4 AdGate 방문/검증 흐름

“스폰서 방문” 클릭 → 새 탭(허용 도메인 + utm_campaign)

체류 ≥ {{policy_defaults.adgate.min_dwell_sec}}초 충족

복귀 시 POST /adgate/verify 결과 반영 → adVerified=true(TTL {{policy_defaults.adgate.ttl_hours}}h)

TTL 카운트다운 UI(만료 시 자동 비활성)

3.3.5 응모 CTA 상태 매트릭스

활성 조건: introSeen && adVerified && event.status==running

비활성 메시지:

Intro 미충족: “공연 소개 확인 후 응모 가능”

AdGate 미충족: “스폰서 페이지 1회 방문 시 응모 가능(유효 {{policy_defaults.adgate.ttl_hours}}시간)”

not-started: “응모 시작 전”

closed: “응모 마감”

3.3.6 예외/오류 UX

이벤트 없음: 예매만 노출(응모 CTA 숨김)

검증 실패: 툴팁/토스트(사유: utm_missing, dwell_short, domain_invalid)

API 실패: 섹션별 스켈레톤 유지 + 재시도

3.3.7 접근성/성능/분석

스크린리더용 CTA 상태 텍스트 제공(활성/비활성 사유)

Above-the-fold 우선 로딩, 스틸/지도 지연 로딩

태깅: view_show_detail{dwellSec,scrollPct}, adgate_open, adgate_verify_{success|fail}{reason}

3.4 응모 /shows/{showId}/apply
3.4.1 접근 가드

사전조건: introSeen && adVerified

미충족:

서버 응답 412 → 가드 화면

액션 버튼: “공연 소개로 이동”, “스폰서 방문”

3.4.2 폼 항목/검증

프리필: 카카오 닉네임/이미지, 동의 여부에 따라 이메일/전화 보완 입력 필요

입력 필드:

이름(읽기전용/수정 허용 여부 정책으로 결정)

이메일(형식 검사), 전화(숫자/패턴), SNS 링크(옵션)

추천코드(옵션, 정상 형식 A-Z0-9 6–10)

동의:

약관, 개인정보(필수), 마케팅(선택)

실시간 검증:

blur/submit 시점, 에러 메시지 필드 하단 노출

3.4.3 제출/서버 로직

POST /entries

Body: {campaignId, email?, phone?, sns?, terms:true, privacy:true, marketing?:bool}

성공:

완료 화면(추첨 일정/좌석 수/유의사항)

알림 큐 등록(조용한 시간 {{legal.quiet_hours}} 반영)

실패:

409(중복): 기존 상태 안내 + “마이페이지 보기”

412(사전조건): 가드로 리디렉션

422(필드): 폼 내 필드별 표기

네트워크: 재시도 버튼(백오프)

3.4.4 보안/안티어뷰즈

서버 유니크키 UNIQUE(campaignId, kakaoUserId)

디바이스/IP 스로틀(옵션), 블랙리스트 적용

CSRF 방어, Rate Limit 초과 시 429

3.4.5 분석 태깅

entry_submit_{attempt|success|conflict|precondition}

notify_queued{template="ENTRY_OK"}

3.5 마이페이지 /me/**
3.5.1 공통

보호 라우트: 미로그인 → 카카오 로그인 리다이렉트

탭: 프로필, 알림 설정, 내 응모

- **팔로우(준비중)** 탭은 자리만 표시(“곧 제공 예정”), CTA/목록 비활성. 추후 `audience_follow_enabled` 온 시 활성화 예정.

3.5.2 프로필 /me/profile

표시: 카카오 닉네임/이미지, 가입일

보완 입력: 이메일/전화(동의 없으면 필수)

저장: 인라인 저장, 성공 토스트 / 실패 롤백

검증: 이메일/전화 형식, 중복(선택)

3.5.3 알림 설정 /me/notifications

채널 토글: 이메일 on/off(기본 on), 웹푸시 on/off

조용한 시간: 표기만({{legal.quiet_hours}})

테스트 발송: 버튼(쿨다운 60초), 실패 사유 토스트

3.5.4 내 응모 /me/entries

GET /me/entries?status=ongoing|won|wait|lost|canceled&sort=desc

항목: 캠페인/공연명, 상태 배지, 추첨 예정 시각(KST), 결과/좌석, 공지 링크

필터: 상태별 탭

빈 상태: “아직 응모 내역이 없습니다” + “공연 보러가기”

상태 행동:

진행: 상세 보기 링크

당첨(미확정): 유의 안내(미응답 시 취소 가능)

대기: 순번(옵션) 표시

3.5.5 오류/예외

목록 실패: 토스트 + 재시도, 마지막 성공 캐시 유지

권한 오류(401/403): 홈으로 안전 리다이렉트

3.5.6 분석 태깅

profile_update{fields}, notify_pref_change{channel,enabled}

entries_view{tab}, entries_item_click{status}

3.6 극단 상세 /troupes/{troupeId}
3.6.1 데이터 의존성 / API

- GET /troupes/{id}: `name`, `logo`, `heroImage`, `bio`, `region`, `foundedYear`, `genres[]`, `sns[]{type,url}`, `contactEmail`, `artauseHistory{year,project}`, `commissionedStats`.
- GET /shows?troupeId={id}&page=1&size=6 → 대표 작품/의뢰 공연 리스트.

3.6.2 레이아웃/섹션

- 히어로: 커버 이미지 + 로고, “아터우스 협업 횟수” 배지.
- 소개/연혁: 상세 소개, 활동 지역/장르 칩, SNS/연락 버튼.
- 커뮤니티 기록: `artauseHistory` 타임라인, commission 성공 사례 카드(성과 링크 포함).
- 연결 CTA: “이 극단의 공연 응모하기” 리스트(최대 6) + “의뢰하기” 버튼(외부 폼).

3.6.3 상태/오류/분석

- 스켈레톤: 히어로/텍스트 placeholder, 목록은 shimmer 3개.
- 404: “등록되지 않은 극단입니다” → 홈으로 이동 CTA.
- 태깅: troupe_profile_view{troupeId}, troupe_show_click{showId}, troupe_history_click{projectId}

3.7 공통 에러 코드 & 카피(관객 영역)

401: “응모를 계속하려면 카카오 로그인이 필요합니다.”

403: “접근 권한이 없습니다.”

409(중복 응모): “이미 참여하셨어요. 마이페이지 > 내 응모에서 상태를 확인하세요.”

412(사전조건 미충족): “공연 소개 확인 및 스폰서 방문 후 다시 시도하세요.”

422: “입력값을 확인해주세요.”

3.8 컴포넌트 의존성(요약)

ShowCard, FilterBar, IntroFirstMeter, AdGatePanel, ApplyForm, GuardPage(412), Countdown(TTL), Tabs, Toast, Skeleton

3.9 QA 포인트(페이지 한정)

상세 Intro-first 충족 시 서버 introSeen=true TTL 반영(24h 기본)

AdGate 검증 성공 후 TTL 카운트다운 정확, 만료 시 응모 CTA 즉시 비활성

/apply 접근 가드: 미충족 412, 충족 시 폼 활성/제출 성공

/me/entries 수치/상태 서버와 일치, 시각은 KST 표기

# 4) 기능 명세(로직/정책)

## 4.1 인증(RBAC)
- **카카오 로그인 전용**. 최초 로그인 시 `kakao_user_id` 저장, 기본 `role=member`
- 보호 라우트 접근 시 미로그인 → 카카오 로그인 리다이렉트
- 파트너/Admin UI는 B2C에서 **비노출**

## 4.2 Intro-first
- **충족 조건**: 스크롤 ≥ {{policy_defaults.intro_first.scroll_depth_pct}}% **또는** 체류 ≥ {{policy_defaults.intro_first.dwell_sec}}초
- **상태**: `introSeen=true`, TTL {{policy_defaults.intro_first.ttl_hours}}h
- **UI**: 미충족 시 응모 CTA 비활성 + 안내 배지(“공연 소개 확인 후 응모 가능”)

## 4.3 AdGate(스폰서 방문 검증)
- **요건**: 허용 도메인(`policy_defaults.adgate.allowed_domains`) + `utm_campaign` 필수 + 체류 ≥ {{policy_defaults.adgate.min_dwell_sec}}초
- **검증**: 스폰서 랜딩 픽셀/서명 토큰 → 서버 `adVerified=true`, TTL {{policy_defaults.adgate.ttl_hours}}h
- **예외처리**: 리퍼러 차단 브라우저는 **HMAC 서명 파라미터 + 만료시간**으로 대체 검증
- **UI**: 검증 상태/잔여 TTL 표기, 만료 시 재방문 유도

## 4.4 응모(Entry)
- **중복 방지**: `(campaignId, kakaoUserId)` 유니크, 연락처 중복 및 디바이스/IP 스로틀(옵션)
- **가중치 계산**(멤버십 없음):  
  - 신규 {{policy_defaults.lottery.newbie_days}}일 +{{policy_defaults.lottery.newbie_bonus}}  
  - 추천 1명당 +{{policy_defaults.lottery.referral_unit}}(최대 {{policy_defaults.lottery.referral_cap}})  
  - 연속 낙첨 +{{policy_defaults.lottery.loss_unit}}/회(최대 {{policy_defaults.lottery.loss_cap}})  
  - 조기 응모 {{policy_defaults.lottery.early_bird_hours}}h +{{policy_defaults.lottery.early_bird_bonus}}  
  - 지역 매칭 +{{policy_defaults.lottery.region_bonus}}  
  - 최근 당첨 {{policy_defaults.lottery.cooldown_days}}일 내 ×{{policy_defaults.lottery.cooldown_factor}}  
  - **상한** ≤ {{policy_defaults.lottery.weight_cap}}
- **추첨 알고리즘**: Efraimidis–Spirakis(무교체 가중 샘플링, 시드 고정) — 실행은 Admin

## 4.5 알림(Notifications)
- **채널**: 이메일(기본), 웹푸시(옵션), SMS(옵션)
- **트리거**: 응모 완료, 추첨 결과(당첨/대기/낙첨), 대기자 승급, 임박/미응답 취소
- **정책**: **조용한 시간 {{legal.quiet_hours}}** → 지연 큐 발송

## 4.6 추천/검색
- **신호**: 콜드스타트 설문(장르/지역/예산), 상세 열람, 클릭/응모 이력
- **초기 로직**: 규칙 기반(장르/지역/인기/임박) 리스트

## 4.7 광고(노출 규칙)
- **슬롯**: `home_hero`, `shows_infeed_xN`, `show_detail_sidebar`, `reward_test_v1`(보상형)
- **보상형 슬롯**: `reward_test_v1` 완료 시 마케팅 동의 기본값 on/off 실험(응모 폼). UI에는 “15초 미만 완주 시 혜택 없음” 문구 + 진행률. 이벤트 `reward_ad_complete` 송신.
- **우선순위**: 지정 스폰서 > Direct > House
- **빈도캡**: 사용자×캠페인 24h 3회 / 세션 2회 / 동일 슬롯 연속 금지
- **어트리뷰션**: **Last AdGate Touch**(검증 후 TTL 내 응모 기여)

# 5) 카피/오류 메시지(핵심)
- **Intro-first 안내**: “공연 소개를 먼저 확인해주세요. 잠시 읽어보면 응모가 열립니다.”
- **AdGate 안내**: “스폰서 페이지를 1회 방문하면 응모가 활성화됩니다. (유효 {{policy_defaults.adgate.ttl_hours}}시간)”
- **사전조건 미충족(412)**: “응모 전 사전조건이 필요합니다. 공연 소개 확인 및 스폰서 방문 후 다시 시도하세요.”
- **중복 응모(409)**: “이미 참여하셨어요. 마이페이지 > 내 응모에서 상태를 확인하세요.”
- **로그인 필요(401)**: “응모를 계속하려면 카카오 로그인이 필요합니다.”

# 6) 분석(태깅) & KPI

## 6.1 이벤트 태깅
- `auth_kakao_login_{success|fail}`
- `view_show_detail { dwellSec, scrollDepth }`
- `adgate_open`, `adgate_verify_{success|fail} { reason }`
- `community_request_click { requestId, action }`
- `reward_ad_complete { slot, dwellSec }`
- `entry_submit_{attempt|success|conflict|precondition}`
- `troupe_profile_view { troupeId }`, `troupe_show_click { showId }`
- `notify_{queued|sent|failed} { channel }`

## 6.2 KPI(관객)
- 상세→응모 **전환율**
- AdGate 검증→응모 **전환율**
- **응모 완료율**
- 알림 **도달/클릭률**
- **재방문율**(7/30일)

# 7) QA 수락 기준(Definition of Done)

## 7.1 접근/보안
- 모든 로그인 진입점에 **카카오 버튼만 노출**(타 수단 미노출) ⇒ PASS
- 미로그인 사용자가 `/apply`, `/me/**` 접근 시 로그인 유도 ⇒ PASS

## 7.2 퍼널 가드
- Intro-first 미충족 시 상세에서 응모 CTA **비활성** + 안내 노출, `/apply` 직접 접근 시 **412** ⇒ PASS
- AdGate 미검증 또는 TTL 만료 시 `/apply` **412** ⇒ PASS

## 7.3 응모/중복
- 동일 캠페인 재제출 시 **409** + 기존 상태 반환 ⇒ PASS
- 필수 필드·동의 누락 시 폼 에러가 필드 단위로 표시 ⇒ PASS

## 7.4 알림/조용한 시간
- {{legal.quiet_hours}} 내 발송 요청은 지연 큐 처리, 실패 시 재시도 백오프 ⇒ PASS

## 7.5 광고/측정
- 슬롯 우선순위(스폰서 > Direct > House) 및 빈도캡 규칙 위반 없음 ⇒ PASS
- AdGate 검증/전환 로그가 이벤트 스트림에 수집됨 ⇒ PASS

# 8) 오픈 이슈
- AdGate **허용 도메인** 초기셋 확정(최소 3~5개)
- 이메일/전화 **선택동의 미제공** 사용자의 연락수단 보완 타이밍(응모 폼 vs 마이페이지) 확정
- 상세 페이지 **리뷰 요약** 노출 시점(차기 릴리스 여부)
- 커뮤니티 **팔로우/구독** 기능: 토글(`audience_follow_enabled`) 온 시 API/알림 정의 필요, 현재는 플레이스홀더만 노출

# 9) 부록/링크
- 상위 정책: `./PRD_MAIN.md#3-공통-정책상속-기준`
- 파트너/B2B: `./PRD_PARTNER.md`
- 어드민: `./PRD_ADMIN.md`
