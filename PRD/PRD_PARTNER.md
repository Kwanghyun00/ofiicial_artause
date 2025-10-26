---
title: "파트너(B2B: 공연 단체/종사자) PRD"
inherits: "./PRD_MAIN.md"
version: 1.0.0
last_updated: 2025-10-25T00:00:00+09:00 # KST
owner: PM-Name
status: draft
routes:
  - "partner.domain.com/dashboard"
  - "partner.domain.com/shows"
  - "partner.domain.com/shows/new"
  - "partner.domain.com/shows/{showId}/edit"
  - "partner.domain.com/events"
  - "partner.domain.com/events/new"
  - "partner.domain.com/ads"
  - "partner.domain.com/reports"
  - "partner.domain.com/billing"
assumptions:
  kakao_login_only: true
  audience_membership: "none"   # 관객 무료
  timezone: "Asia/Seoul"
---

# 0) 문서 목적
<!-- BEGIN: Purpose -->
공연 단체/종사자(파트너)가 작품/이벤트/광고를 셀프 운영하고 성과를 확인·정산할 수 있도록, B2B 포털의 정보 구조·화면·로직·정책·QA 기준을 정의한다.  
정책/수치는 `PRD_MAIN.md`의 `policy_defaults`를 상속한다.
<!-- END: Purpose -->

# 1) IA & 접근 가드
- **도메인**: `{{toggles.domains.b2b}}`
- **보호 라우트**: 모든 `partner.*` 경로는 **카카오 로그인 + 파트너 승인** 필요
- **가드 규칙**
  - 미로그인/미승인 사용자는 파트너 신청 화면으로 리다이렉트
  - 관객/일반 회원이 접근 시 **403**(역할 랜딩으로 안전 리다이렉트)
  - Admin 기능은 **비노출**

# 2) 파트너 온보딩 플로우
<!-- BEGIN: Partner Flow -->
1) **카카오 로그인** → 2) **파트너 신청**(회사/담당/사업자 정보 업로드) 제출  
3) **Admin 심사**: 승인/보류/반려(사유 기록)  
4) **승인 후** 대시보드 접근, 작품 등록 → 이벤트 생성 → 광고/리포트 운영  
예외) 반려 시 사유 노출 및 재신청 가능. 승인 전에는 모든 운영 화면이 잠김.
<!-- END: Partner Flow -->

# 3) 페이지별 기능 정의

## 3.1 대시보드 `/dashboard`
- **KPI 카드**: 노출, 클릭, AdGate 검증, 응모 수/율, 추첨 결과(당첨/대기/낙첨), 예산 소진(광고), 주간 변화
- **알림**: 마감 임박 캠페인, 소재 만료, 심사 상태 변경
- **빠른 액션**: 작품 만들기, 이벤트 만들기, 광고 만들기, 리포트 다운로드

## 3.2 작품 관리 `/shows`
### 목록
- 필터: 상태(draft/review/published/rejected), 기간, 장르
- 카드: 포스터/제목/기간/상태/최근 수정/연결된 이벤트 수
### 신규/수정 `/shows/new`, `/shows/{id}/edit`
- **필수 메타**: 제목, 장르, 런타임, 등급, 기간(시작/종료), 장소(이름/주소), 시놉시스, 캐스팅, 예매 링크
- **미디어**: 포스터(권장 1200×1800, ≤1.5MB), 스틸 3–10장(≤800KB)
- **좌석/회차**: 회차별 일시(KST), 회차 메모(옵션)
- **검수 제출**: draft → review(락), Admin 승인 시 published
- **상태 전이**: draft ↔ review → published / rejected(사유 필수)
- **밸리데이션**: 필수 필드 누락·잘못된 링크 시 저장/제출 불가(필드단위 에러)

## 3.3 이벤트(초대권) `/events`, `/events/new`
- **캠페인 기본**: 제목, 대상 공연(1:n 가능), 좌석 수(K명), 응모 기간/마감, 추첨 일시(KST), 참여 자격(설명)
- **가중치 정책(설정값 가시화)**:  
  - 신규 {{policy_defaults.lottery.newbie_days}}일 +{{policy_defaults.lottery.newbie_bonus}}, 추천 +{{policy_defaults.lottery.referral_unit}}/명(cap {{policy_defaults.lottery.referral_cap}}),  
    연속 낙첨 +{{policy_defaults.lottery.loss_unit}}/회(cap {{policy_defaults.lottery.loss_cap}}), 조기 응모 {{policy_defaults.lottery.early_bird_hours}}h +{{policy_defaults.lottery.early_bird_bonus}}, 지역 +{{policy_defaults.lottery.region_bonus}},  
    최근 당첨 {{policy_defaults.lottery.cooldown_days}}일 ×{{policy_defaults.lottery.cooldown_factor}}, **상한** ≤ {{policy_defaults.lottery.weight_cap}}
- **AdGate 규칙(필수)**: 허용 도메인(화이트리스트에서 선택), **`utm_campaign` 필수**, 최소 체류 {{policy_defaults.adgate.min_dwell_sec}}초, TTL {{policy_defaults.adgate.ttl_hours}}h
- **운영 옵션**: 중복/부정 필터(디바이스/IP 스로틀, 블랙리스트 적용), 응모당 필수 동의 고지문
- **현황 탭**: 실시간 응모 수/추이, AdGate 검증율, 중복 차단 건수, 예상 추첨 좌석 대비 경쟁률
- **내보내기**: CSV(응모자 id/연락/AdGate 상태/가중치 분해/타임스탬프)
- **상태 전이**: draft → running → closed → drawing_done

## 3.4 광고 `/ads`
- **슬롯 선택**: `home_hero`, `shows_infeed_xN`, `show_detail_sidebar`, `pre_apply_interstitial`(AdGate 유도)
- **타게팅**: 장르/지역/공연ID/기간/요일/시간대, 신규/휴면 세그먼트(옵션)
- **과금/예산**: CPM/CPC, 일/총 예산, 페이싱(even/asap), 빈도캡(24h 3회/세션 2회/연속 금지)
- **크리에이티브**: 이미지(규격/용량 검사), 대체텍스트, UTM 자동 부착
- **승인 흐름**: 제출→심사→집행, 만료/중지 지원
- **로그**: 노출/클릭/AdGate 전환(assist), 오류 사유

## 3.5 리포트 `/reports`
- **퍼널**: 노출 → 클릭 → AdGate 검증 → 응모 → 당첨/대기/낙첨
- **세그먼트**: 장르/슬롯/캠페인/기간/지역/디바이스
- **다운로드**: CSV/XLSX, 날짜·타임존 KST 고정
- **어트리뷰션**: Last AdGate Touch(검증 후 TTL 내 응모를 해당 캠페인 기여)

## 3.6 정산 `/billing`
- **집행 요약**: 기간 선택, 캠페인별 비용(CPM/CPC), VAT 표기
- **청구서**: PDF 다운로드, 사업자 정보 노출
- **상태**: 결제 대기/완료/조정, 이의신청 메모

# 4) 기능 명세(로직/정책)

## 4.1 인증/권한
- **카카오 로그인 전용**, 승인된 사용자만 `partner.*` 접근
- 권한 롤(확장): `partner_owner`, `partner_staff`(초기에는 동일 권한 가능)

## 4.2 작품 검수
- 제출 시 필수 필드 검증 → review 전환, 수정 잠금
- Admin 승인/반려(사유 저장), 반려 후 재제출 가능
- 공개 상태에서의 주요 변경(제목/기간/장소)은 **재검수 요구**(표시 배지)

## 4.3 이벤트 운영
- 중복 방지: `UNIQUE(campaignId, kakaoUserId)`(서버 보장)
- AdGate 미검증 응모는 서버에서 **412** 반환(프론트 안내 동기화)
- 추첨은 Admin에서 실행(시드 고정, 재현 보장). 파트너는 **결과 열람**만
- 대기자 승급은 시스템 자동(로그/알림 기록)

## 4.4 광고 집행
- 우선순위: **지정 스폰서 > Direct > House**
- 빈도캡/페이싱은 서버가 강제, 위반 시 요청 거부 및 로그 기록
- 목적 URL에는 UTM 자동 부착(`utm_source=partner&utm_medium={slot}&utm_campaign={id}`)

## 4.5 리포팅
- 모든 지표는 KST 집계(일자 경계 00:00)
- 퍼널 단계의 母수/자식수 일관성 보장(필터 조합 시 문구로 경고)
- AdGate 전환율 = 검증성공/스폰서 방문 유입(중복 제거)

# 5) 카피/오류 메시지(핵심)
- **심사 대기**: “검수 중입니다. 평균 1영업일 소요.”
- **반려**: “반려 사유: {사유}. 수정 후 재제출하세요.”
- **AdGate 설정 누락**: “허용 도메인/필수 UTM/체류 시간/TTL을 설정해주세요.”
- **소재 오류**: “규격 또는 용량을 확인하세요. (권장 {규격}, ≤{용량})”
- **권한 오류(403)**: “파트너 승인 후 접근 가능합니다.”

# 6) 분석(태깅) & KPI

## 6.1 이벤트 태깅
- `partner_login_{success|fail}`
- `partner_show_submit_{attempt|review|published|rejected}`
- `partner_event_create_{attempt|running|closed}`
- `partner_ad_submit_{attempt|approved|rejected|running|stopped}`
- `partner_report_download { type }`
- `partner_billing_invoice_{view|download}`

## 6.2 KPI(파트너)
- 응모 퍼널 전환(노출→클릭→AdGate→응모)
- 이벤트 경쟁률(응모/좌석), 당첨 확정률, 대기자 승급률
- 광고 CTR/AdGate 전환율, CAC(옵션), 재집행률
- 검수 리드타임, 반려율(사유별)

# 7) QA 수락 기준(Definition of Done)

## 7.1 접근/보안
- 미승인 사용자의 `partner.*` 접근은 **항상 403** ⇒ PASS
- 카카오 로그인 외 수단 **미노출** ⇒ PASS

## 7.2 작품
- 필수 메타 누락 시 저장/제출 불가, 필드 단위 에러 표기 ⇒ PASS
- review 상태에서 편집 잠금, 승인/반려가 로그에 남음 ⇒ PASS
- 공개 이후 주요 변경은 재검수 플래그 표시 ⇒ PASS

## 7.3 이벤트
- AdGate 규칙이 메인 정책 범위 내에서만 저장(허용 도메인/UTM/체류/TTL) ⇒ PASS
- 중복 응모 차단(서버 유니크), 미검증 응모는 412 반환 ⇒ PASS
- 현황 수치(응모/검증율)와 다운로드 CSV의 합계 일치 ⇒ PASS

## 7.4 광고
- 우선순위(스폰서 > Direct > House) 및 빈도캡(24h 3·세션 2·연속 금지) 준수 ⇒ PASS
- 소재 규격/용량 검사 정확, UTM 자동 부착 ⇒ PASS

## 7.5 리포트/정산
- 퍼널 계산 일관성, 기간·세그먼트 필터 정확 ⇒ PASS
- 청구서 PDF 생성 및 금액 합계/세부 합 일치 ⇒ PASS

# 8) 오픈 이슈
- 작품 “주요 변경”의 재검수 범위(필드 리스트) 확정
- 광고 심사 SLA(시간)와 예외 기준(공익/긴급) 정의
- CSV 내 개인정보 마스킹 수준/열 구체화
- 파트너 롤 세분화(`owner`/`staff`) 및 권한 차등 여부

# 9) 부록/링크
- 상위 정책: `./PRD_MAIN.md#3-공통-정책상속-기준`
- 관객 PRD: `./PRD_AUDIENCE.md`
- 어드민 PRD: `./PRD_ADMIN.md`
