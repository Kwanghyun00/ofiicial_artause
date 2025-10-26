---
title: "공연 플랫폼 — 메인 PRD (관객 무료 · 카카오 로그인 전용)"
version: 1.0.0
last_updated: 2025-10-25T00:00:00+09:00 # KST
owner: PM-Name
status: draft
# 운영 토글(하위 PRD에서 상속)
toggles:
  kakao_login_only: true
  admin_single_user: true
  audience_membership: "none"     # 관객 유료 멤버십 없음
  intro_first_enabled: true
  adgate_enabled: true
  weighted_lottery_enabled: true
  b2c_b2b_admin_split: true
  reward_ad_test_enabled: true    # 보상형 광고(reward_test_v1) 시범 슬롯 온
  audience_follow_enabled: false  # 커뮤니티 팔로우는 2차 개편 시 활성화
domains:
  b2c: "www.domain.com"
  b2b: "partner.domain.com"
  admin: "admin.domain.com"
policy_defaults:
  intro_first:
    scroll_depth_pct: 60
    dwell_sec: 5
    ttl_hours: 24
  adgate:
    min_dwell_sec: 5
    ttl_hours: 24
    required_utm: ["utm_campaign"]
    allowed_domains: ["<fill.sponsor.example>"]  # Admin에서 관리
  lottery:
    newbie_days: 30
    newbie_bonus: 0.3
    referral_unit: 0.05
    referral_cap: 0.30
    loss_unit: 0.1
    loss_cap: 0.30
    early_bird_hours: 24
    early_bird_bonus: 0.1
    region_bonus: 0.1
    cooldown_days: 14
    cooldown_factor: 0.5
    weight_cap: 4.0
security:
  admin_2fa: "required"           # TOTP 또는 패스키
  admin_whitelist_kakao_id: true
legal:
  quiet_hours: "22:00-08:00 KST"
  pii_minimization: true
  unlink_aware: true              # 카카오 연결 해제(Unlink) 대응
---

# 0) 문서 목적 · 범위
<!-- BEGIN: Purpose -->
본 문서는 관객 무료·카카오 로그인 전용 모델에서 **Intro-first → AdGate → 응모 → 가중치 추첨** 퍼널을 표준화한 상위 PRD이다.  
하위 PRD(`PRD_AUDIENCE.md`, `PRD_PARTNER.md`, `PRD_ADMIN.md`)는 이 문서의 **정책/수치**를 상속하며, 정책 변경은 본문만 수정한다(단일 진실원천).
<!-- END: Purpose -->

# 1) 서비스 정의 · 목표
## 1.1 정의
- 공연 정보 탐색/추천과 **보상형 초대권 이벤트**(AdGate 연동)를 제공하는 양면 플랫폼.

## 1.2 핵심 가치
- **신뢰성**(표준화된 정보, 재현 가능한 추첨/감사 로그)
- **공정성**(Intro-first, 광고 게이트 충족, 가중치 상한/쿨다운)
- **효율**(카카오 전용으로 가입 마찰 최소화, 스폰서 가치 측정)

## 1.3 성공 지표(KPI)
- 상세→응모 전환율, AdGate→응모 전환율, 응모 완료율
- 알림 도달/클릭률, 파트너 재집행률, 광고/제휴 ARPU(플랫폼 관점)

# 2) 대상/역할 · 배포 구조
## 2.1 역할
- **관객(B2C)**: 탐색/상세/AdGate/응모/알림/마이페이지  
- **종사자(B2B)**: 작품/이벤트/광고 등록, 리포트/정산  
- **관리자(Admin=1인)**: 승인/정책/추첨/감사/모니터링

## 2.2 도메인 분리
- B2C: `{{ domains.b2c }}` / B2B: `{{ domains.b2b }}` / Admin: `{{ domains.admin }}`
- 세션/쿠키·보안정책 **도메인별 분리**, 상호 UI 비노출

## 2.3 콘텐츠 소스 전략
- **KOPIS Open API**를 1차 공연 데이터 소스로 사용하며 장르/기간/장소/출연진/극단 레퍼런스를 동기화한다. kopis_show_id, kopis_org_id를 Show, Troupe 스키마에 저장해 중복을 방지한다.
- KOPIS 연동 시 **전시(Exhibition)** 분류도 함께 적재하고 content_type=performance|exhibition 필드로 노출/필터링 기준을 제공한다.
- 커뮤니티 의뢰 공연(내외부 파트너 요청, 카드뉴스 제작 등)은 commissioned=true 태그로 표기해 홈/커뮤니티 영역의 상단 모듈에서 우선 노출한다.
- 각 공연은 하나 이상의 **극단(Troupe)** 정보와 연결되며, 극단 카드에는 과거 협업 내역/연락처/외부 채널을 노출한다. 데이터 모델·API 계약은 SHARED_SPEC.md에 정의한다.


# 3) 공통 정책(상속 기준)
## 3.1 인증/RBAC/보안
- **카카오 로그인만 허용**, 유일키 `kakao_user_id`  
- 파트너: 신청→Admin 승인 후 `partner.*` 접근  
- Admin: **화이트리스트된 Kakao ID + 2FA** 필수  
- 위험 액션(추첨/정책/정산)은 **이중 확인 + 감사 로그**  
- 연결 해제(Unlink) 콜백 수신 시 세션 무효화·계정 상태 갱신

## 3.2 Intro-first
- 충족 조건: **스크롤 ≥ {{policy_defaults.intro_first.scroll_depth_pct}}%** 또는 **체류 ≥ {{policy_defaults.intro_first.dwell_sec}}초** 중 1개  
- 서버에 `introSeen=true` 기록(유효 {{policy_defaults.intro_first.ttl_hours}}h)

## 3.3 AdGate(스폰서 방문 검증)
- 허용 도메인 화이트리스트(`policy_defaults.adgate.allowed_domains`)  
- **필수 UTM:** `{{policy_defaults.adgate.required_utm[0]}}`  
- **최소 체류:** {{policy_defaults.adgate.min_dwell_sec}}초 / **TTL:** {{policy_defaults.adgate.ttl_hours}}h  
- 검증 실패/만료 시 `/apply` **412(PRECONDITION)**

## 3.4 가중치 · 추첨(멤버십 없음)
- **기본 1.0**, 상한 **≤ {{policy_defaults.lottery.weight_cap}}**  
- 보너스/패널티:  
  - 신규 {{policy_defaults.lottery.newbie_days}}일: +{{policy_defaults.lottery.newbie_bonus}}  
  - 추천: +{{policy_defaults.lottery.referral_unit}}/명 (cap {{policy_defaults.lottery.referral_cap}})  
  - 연속 낙첨: +{{policy_defaults.lottery.loss_unit}}/회 (cap {{policy_defaults.lottery.loss_cap}})  
  - 조기 응모 {{policy_defaults.lottery.early_bird_hours}}h: +{{policy_defaults.lottery.early_bird_bonus}}  
  - 지역 매칭: +{{policy_defaults.lottery.region_bonus}}  
  - 최근 당첨 {{policy_defaults.lottery.cooldown_days}}일 내: ×{{policy_defaults.lottery.cooldown_factor}}  
  - 의심 행위: 0 또는 제외  
- **알고리즘**: Efraimidis–Spirakis(무교체 가중 샘플링), 시드 `SHA256(campaignId + drawAt(KST) + serverSecret)`  
- **대기자 승급**: 미확정/거절 → 자동 승급 + 알림

## 3.5 알림 정책
- 채널: 이메일(기본) / 웹푸시 옵션 / SMS 옵션  
- **조용한 시간:** {{legal.quiet_hours}} → 지연 큐 발송  
- 트리거: 응모 완료/추첨 결과/대기자 승급/임박/미응답 취소

## 3.6 광고(Ad System)
- 슬롯 예시: `home_hero`, `shows_list_top`, `shows_infeed_xN`, `show_detail_sidebar`, `pre_apply_interstitial`(AdGate 전용)  
- **보상형 광고 슬롯** `reward_test_v1`: 커뮤니티 모듈 하단 1회 노출, 완료 트래킹(`reward_ad_complete`) 시 응모 폼 기본값(마케팅 수신) on/off AB 테스트에 활용한다. 초기에는 하우스 캠페인으로 더미 크리에이티브를 사용해 플로우만 검증한다.
- **우선순위**: 지정 스폰서 > Direct(유상) > House  
- **빈도캡**: 사용자×캠페인 24h 3회 / 세션 2회 / 동일 슬롯 연속 금지  
- **어트리뷰션**: Last AdGate Touch(검증 후 TTL 내 응모 기여)

## 3.7 외부 데이터 연계
- **KOPIS 동기화**: 3시간 간격 증분 수집(`updated_at` 커서). 실패 시 15분 백오프로 3회 재시도 후 RUNBOOK 경보.
- **전시 데이터**: KOPIS Exhibition 엔드포인트 + 커스텀 태그(`exhibition_category`, `artause_tag`). 전시는 응모 흐름 없이 소개/티켓 링크 중심으로 노출한다.
- **극단 마스터**: `troupe` 테이블로 공연 다건 매핑, 커뮤니티 요청 시 Admin이 수동 병합/분리를 수행한다. Audience FE는 `/troupes/{id}` 상세와 `/shows?troupeId=` 필터를 사용한다.
- **커뮤니티 의뢰 공연**: 파트너 포털에서 승인된 `commissioned` 캠페인만 Audience 커뮤니티에 승격되며, 데이터 일관성 검증은 Admin에서 수행한다.

# 4) 정보 구조(IA) · 라우팅(요약)
- **B2C**: `/`, `/shows`, `/shows/{showId}`, `/shows/{showId}/apply`, `/me/**`  
- **B2B**: `/dashboard`, `/shows`, `/shows/new`, `/events`, `/events/new`, `/ads`, `/reports`, `/billing`  
- **Admin**: `/dashboard`, `/approvals`, `/lottery`, `/policies`, `/monitoring`, `/audit`  
- **가드**: 역할 미일치 시 403 + 역할 랜딩 리다이렉트

# 5) 분석(태깅) · KPI
## 5.1 이벤트 키(공통)
- `auth_kakao_login_success|fail`  
- `view_show_detail{dwellSec,scrollDepth}`  
- `adgate_open`, `adgate_verify_{success|fail}{reason}`  
- `entry_submit_{attempt|success|conflict|precondition}`  
- `lottery_draw_execute{auditId,seats}`, `waitlist_promoted`  
- `notify_{queued|sent|failed}`, `partner_event_publish`, `admin_policy_update`

## 5.2 KPI 정의(상위)
- 세부 산식/대시보드는 하위 파일에서 확장하되, 용어/정의는 본문과 일치해야 함.

# 6) 에러/예외 공통 규칙
- 401: 비인증, 403: 권한 없음, **409: 중복 응모**, **412: Intro-first/AdGate 미충족**  
- 사용자 안내 카피는 하위 PRD에서 구체화하되, 의미는 동일하게 유지

# 7) QA 수락 기준(Definition of Done · 상위)
<!-- BEGIN: QA_DOD -->
- **로그인**: 모든 경로에 카카오 버튼만 노출(타 수단 미노출) ⇒ PASS  
- **접근**: 관객/파트너로 `admin.*` 접근 시 403, 미승인 파트너의 `partner.*` 접근 시 403 ⇒ PASS  
- **퍼널 가드**: Intro-first 미충족 또는 AdGate 미검증/만료 시 `/apply` 412 ⇒ PASS  
- **중복**: 동일 캠페인 재제출 409 + 기존 상태 반환 ⇒ PASS  
- **추첨**: 동일 시드/입력 재실행 시 결과 동일(감사 로그로 검증) ⇒ PASS  
- **알림**: 조용한 시간({{legal.quiet_hours}}) 발송 요청은 지연 큐 처리 ⇒ PASS  
- **광고**: 우선순위(스폰서>Direct>House), 빈도캡(24h 3·세션 2·연속 금지) 준수 ⇒ PASS
<!-- END: QA_DOD -->

# 8) 릴리스 계획(상위 로드맵)
- **v1.0(MVP)**: 카카오 로그인, B2C 목록/상세/응모, Intro-first, AdGate, 가중치 추첨, B2B 작품·이벤트, Admin 승인/추첨/정책, 기본 광고 슬롯  
- **v1.1**: 추천 고도화(규칙→하이브리드 초석), 마이페이지 확장, 광고 리포트, 자동 승급 고도화  
- **v1.2**: 제휴 커미션/정산, A/B 실험 프레임, 운영 대시보드 강화

# 9) 의사결정 로그 · 오픈 이슈
## 9.1 결정 로그
- 2025-10-25: 관객 무료(멤버십 없음), 카카오 로그인 전용 — 확정  
- 2025-10-25: B2C/B2B/Admin 도메인 분리 — 확정

## 9.2 오픈 이슈
- AdGate **허용 도메인** 초기값 확정(최초 3~5개)  
- Admin **2FA 방식**(TOTP vs 패스키) 및 IP 허용목록 범위  
- 이메일 선택동의 미제공 시 **연락 수단 보완 타이밍**(응모 단계 vs 마이페이지) 확정
- 관객 **팔로우 기능**은 커뮤니티 2차 개편까지 보류(`audience_follow_enabled=false`), 관찰용 트래킹만 선적용한다.

# 10) 부록 링크
- (하위) `PRD_AUDIENCE.md` — 관객 페이지 PRD  
- (하위) `PRD_PARTNER.md` — 공연 단체/종사자 PRD  
- (하위) `PRD_ADMIN.md` — 어드민(1인) PRD  
- (옵션) `/appendix/SHARED_SPEC.md` — 데이터 모델·API·추첨 의사코드  
- (옵션) `/appendix/RUNBOOKS.md` — 운영/장애/되돌리기 플레이북
