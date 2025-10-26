---
title: "어드민(Admin, 1인 전용) PRD"
inherits: "./PRD_MAIN.md"
version: 1.0.0
last_updated: 2025-10-25T00:00:00+09:00 # KST
owner: PM-Name
status: draft
routes:
  - "admin.domain.com/dashboard"
  - "admin.domain.com/approvals"
  - "admin.domain.com/lottery"
  - "admin.domain.com/policies"
  - "admin.domain.com/monitoring"
  - "admin.domain.com/audit"
security:
  whitelist_kakao_id: true        # 지정된 Kakao ID 1개만 접근 허용
  two_factor: "required"          # 2FA(TOTP 또는 패스키) 필수
assumptions:
  kakao_login_only: true
  audience_membership: "none"
  timezone: "Asia/Seoul"
---

# 0) 문서 목적
<!-- BEGIN: Purpose -->
Admin(1인)이 **승인/정책/추첨/모니터링/감사** 업무를 안전하고 재현 가능하게 수행하도록, 화면·로직·정책·감사 기준·QA 수락기준을 정의한다.  
본 문서의 수치·정책은 `PRD_MAIN.md`의 `policy_defaults`를 상속하며, 변경은 **Admin > 정책(policies)** 화면에서만 수행한다.
<!-- END: Purpose -->

# 1) IA & 접근 가드
- **도메인**: `{{toggles.domains.admin}}`
- **가드 규칙**
  - 카카오 로그인 이후 **화이트리스트 Kakao ID 1개**만 접근 가능
  - 2FA 미통과 시 접근 거부(세션 생성 금지)
  - 관객/파트너 UI 요소는 **완전 비노출**
- **권한 모델(초기)**
  - `admin_owner`(단 1인): 모든 기능, 정책/추첨/정산/감사 접근
  - *(확장 예약: `admin_analyst` 등 읽기 전용)*

# 2) 핵심 플로우
<!-- BEGIN: Admin Flow -->
1) 카카오 로그인(화이트리스트 확인) → 2) 2FA 성공 → 3) 대시보드 접근  
4) 승인/제재(파트너·작품·이벤트), 블랙리스트 관리  
5) 정책 편집(Intro-first/AdGate/가중치/허용 도메인/UTM)  
6) 추첨 실행(사전 필터 → 가중치 분포 확인 → 시드 고정 무교체 샘플링)  
7) 결과 확정/공지/CSV 내보내기 → 미응답/거절 시 대기자 자동 승급  
8) 모니터링(이상 응모/알림 실패/AdGate 오류) & 감사 로그 점검
<!-- END: Admin Flow -->

# 3) 페이지별 기능 정의

## 3.1 대시보드 `/dashboard`
- **요약 위젯**
  - 오늘/주간 퍼널(노출→클릭→AdGate→응모), 응모 수/경쟁률, 추첨 예정/완료 수
  - 알림 상태(대기/성공/실패), AdGate 오류율, 이상 응모 경고
- **빠른 액션**
  - 승인 대기 n건 바로가기, 정책 편집, 추첨 실행, CSV 리포트 바로가기

## 3.2 승인/제재 `/approvals`
- **파트너 승인**
  - 신청서(회사/담당/사업자) 검토 → 승인/반려(사유 필수) → 타임스탬프/담당자 기록
- **작품(Show)**
  - 상태 전이: draft → review → published/rejected(사유 기록, 변경 이력)
  - 공개 이후 **주요 필드** 수정 시 재검수 요구 플래그
- **이벤트(EventCampaign)**
  - AdGate 규칙/가중치 설정 검증(메인 정책 범위 내인지 체크)
  - 상태 전이: draft → running → closed → drawing_ready
- **블랙리스트**
  - 사용자/디바이스/IP/전화 단위 추가/해제, 사유·기간·증거(로그 링크) 첨부

## 3.3 추첨 `/lottery`
- **사전 필터**
  - 중복/블랙리스트/부정 의심 제거, AdGate 미검증/만료 제외
- **가중치 미리보기**
  - 분포 히스토그램, 상하위 1% 휴리스틱, 과도 편향 경고(상한 `{{policy_defaults.lottery.weight_cap}}`)
- **시드 & 알고리즘**
  - 시드: `SHA256(campaignId + drawAt(KST) + serverSecret)`(읽기 전용 표시)
  - 알고리즘: **Efraimidis–Spirakis**(무교체 가중 샘플링)
- **실행 & 확정**
  - 2단계 확인 모달(요약/좌석수/KST 시간/시드 표시) → 실행
  - 결과 탭: 당첨/대기 목록, 내보내기(CSV), 공지 발송 트리거
- **자동 승급**
  - 미응답/거절 시 대기자 승급(스케줄러), 로그·알림 기록

## 3.4 정책 `/policies`
- **Intro-first**
  - 스크롤 임계(`{{policy_defaults.intro_first.scroll_depth_pct}}%`), 체류(`{{policy_defaults.intro_first.dwell_sec}}s`), TTL(`{{policy_defaults.intro_first.ttl_hours}}h`)
- **AdGate**
  - 허용 도메인(화이트리스트 CRUD), 필수 UTM 키(`{{policy_defaults.adgate.required_utm[0]}}`), 최소 체류(`{{policy_defaults.adgate.min_dwell_sec}}s`), TTL(`{{policy_defaults.adgate.ttl_hours}}h`)
  - 서명 토큰 만료(리퍼러 차단 환경용)
- **가중치(멤버십 없음)**
  - 신규 일수/보너스, 추천 단위/상한, 연속 낙첨 단위/상한, 조기 응모 시간/보너스, 지역 보너스, 쿨다운 일수/계수, 상한
- **저장 규칙**
  - 모든 변경은 **이중 확인** + 즉시 적용(캐시 무결성 검증)
  - 변경 전/후 값, 변경자, 사유, 영향을 받는 캠페인/라우트 스냅샷을 **감사 로그**에 기록
  - 롤백 포인트 생성(최근 N개 보관)

## 3.5 모니터링 `/monitoring`
- **이상 응모**
  - 디바이스/아이피/세션 과다 응모, 동일 연락처 다계정, 빠른 재시도 등
- **AdGate 상태**
  - 도메인별 검증 성공률, TTL 만료 비율, UTM 누락 비율
- **알림 큐**
  - 대기/성공/실패/재시도 현황, 조용한 시간 대기열
- **퍼널 드롭**
  - 상세→AdGate→응모 단계별 이탈, 캠페인/장르/소스 세그먼트

## 3.6 감사 로그 `/audit`
- **범위**: 승인/제재, 정책 변경, 추첨 실행, 롤백, 블랙리스트, 정산/다운로드
- **기록 필드**: 액션/주체(Kakao ID)/IP/UA/시각(KST)/입력 파라미터/이전값/이후값/해시
- **검색/필터**: 기간/주체/리소스/액션 유형
- **무결성**: 해시 체인 또는 WORM 스토리지(변조 방지)

# 4) 기능 명세(로직/정책)

## 4.1 인증/보안
- 카카오 로그인 전용 → 화이트리스트 Kakao ID 확인 → 2FA 성공 시 세션 발급
- 세션/쿠키 도메인 분리, CSRF 방어, 중요 엔드포인트는 **서명·시크릿** 검증
- 위험 액션(정책/추첨/정산)은 **Confirm 2-step + 재인증(선택)**

## 4.2 승인/제재 로직
- 상태 머신 준수(draft/review/published 등)
- 반려 시 사유 필수, 템플릿 제공(저작권/부적절/허위정보/규격 불일치 등)
- 블랙리스트는 캠페인/전역 범위 선택형, 기간 종료 시 자동 해제

## 4.3 추첨 로직
- 입력: 필터링된 엔트리(가중치 포함), 좌석수 K
- 계산: `key = -ln(U)/max(weight, 1e-9)` 기준 오름차순 K명 선발
- 재현성: 동일 입력+시드 → 동일 결과; 감사 로그에서 재실행 가능(읽기 전용)
- 결과 확정 후 **알림 큐**에 배치, 대기자 승급 스케줄 설정

## 4.4 정책 변경
- 값 검증: 허용 범위/형식 체크(예: dwell_sec 1–30, ttl_hours 1–72)
- 적용: 실시간 캐시 갱신, 프런트 구성요소에 브로드캐스트(필요 시)
- 롤백: 선택한 포인트로 정책 묶음 복귀, 감사 로그에 추적

## 4.5 모니터링/알림
- 이상 신호에 임계 초과 시 배지/이메일 경보(내부)
- 알림 실패는 최대 N회 재시도 후 데드레터 큐로 이동, 원인 태깅

## 4.6 데이터 내보내기
- CSV/XLSX: 응모자 목록(가중치 분해 포함), 결과, 로그 스냅샷
- 개인정보 마스킹 기본(이메일/전화 일부), 전체 노출은 별도 권한 플래그 필요

# 5) 카피/오류 메시지(핵심)
- **정책 저장 전 확인**: “정책 변경은 즉시 적용됩니다. 서비스에 영향이 있을 수 있습니다.”
- **추첨 실행 확인**: “동일 시드/입력에서 결과는 재현됩니다. 실행하시겠습니까?”
- **권한 오류(403)**: “허용되지 않은 Admin 계정입니다.”
- **2FA 실패**: “2차 인증에 실패했습니다. 다시 시도하세요.”

# 6) 분석(태깅) & KPI

## 6.1 이벤트 태깅
- `admin_login_{success|fail}`, `admin_2fa_{success|fail}`
- `admin_approval_{partner|show|event}_{approve|reject|hold}`
- `admin_policy_update { key, old, new }`
- `admin_lottery_{preview|execute|export} { campaignId, seats, seedHash }`
- `admin_waitlist_promote { campaignId }`
- `admin_blacklist_{add|remove}`
- `admin_monitor_{alert|ack}`
- `admin_audit_{view|export}`

## 6.2 KPI(Admin)
- 검수 리드타임(신청→승인), 반려율(사유별)
- 추첨 처리량/오류율, 재현 검증 성공률(감사 재실행)
- 알림 실패율/지연율, 이상 응모 탐지 적중률
- 정책 변경 건당 퍼널 영향(전/후 24h 비교)

# 7) QA 수락 기준(Definition of Done)

## 7.1 보안/접근
- 화이트리스트 외 Kakao ID는 **항상 403**, 2FA 미통과는 세션 미발급 ⇒ PASS
- 위험 액션은 **2단계 확인** 없이는 실행 불가 ⇒ PASS

## 7.2 승인/제재
- 반려 시 사유 필수 저장, 상태/이력/주체가 감사 로그에 기록 ⇒ PASS
- 공개 이후 **주요 필드** 수정 시 재검수 플래그 표시 ⇒ PASS

## 7.3 정책
- Intro-first/AdGate/가중치 변경 시 즉시 적용 + 롤백 포인트 생성 ⇒ PASS
- 허용 범위 밖 수치는 저장 거부 + 필드 에러 메시지 ⇒ PASS

## 7.4 추첨
- 동일 입력+시드 재실행 시 **동일 결과**(감사 로그로 검증) ⇒ PASS
- 대기자 자동 승급 트리거가 미응답/거절에만 발동, 로그/알림 남김 ⇒ PASS

## 7.5 모니터/감사
- 이상 응모/AdGate/알림 지표가 대시보드와 일치, 임계 초과 시 경보 발생 ⇒ PASS
- 모든 위험 액션이 감사 로그에 **완전 기록**(주체/파라미터/전후값/해시) ⇒ PASS

## 7.6 데이터 내보내기
- CSV/XLSX 합계가 화면 수치와 일치, 개인정보 기본 마스킹 적용 ⇒ PASS

# 8) 오픈 이슈
- **주요 필드** 재검수 범위 최종 확정(예: 제목/기간/장소/예매 링크)
- 정책 **롤백 보관 개수**(N)와 보존 기간
- 감사 로그 **WORM 스토리지** 구현 수준(외부 저장/내부 해시 체인)
- 이상 응모 **스코어 기준**과 자동 블랙리스트 임계값

# 9) 부록/링크
- 상위 정책: `./PRD_MAIN.md`
- 관객 PRD: `./PRD_AUDIENCE.md`
- 파트너 PRD: `./PRD_PARTNER.md`
- (옵션) `/appendix/SHARED_SPEC.md` — 데이터 모델·API·추첨 의사코드
- (옵션) `/appendix/RUNBOOKS.md` — 추첨 실행/롤백, AdGate 비상중지, 알림 큐 점검
