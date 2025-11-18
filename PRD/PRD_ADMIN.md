---
title: "어드민(Admin) PRD"
inherits: "./PRD_MAIN.md"
version: 2.0.0
last_updated: 2025-11-16T00:00:00+09:00
owner: PM-Name
status: active
routes:
  - "/admin"
  - "/admin/events"
  - "/admin/entries"
security:
  admin_role_required: true
timezone: "Asia/Seoul"
---

# 0) 문서 목적
관리자(Admin)가 **이벤트 승인, 당첨자 선정, 시스템 관리** 업무를 수행할 수 있도록, 화면·로직·정책·QA 기준을 정의한다.
본 문서의 정책은 `PRD_MAIN.md`를 상속한다.

# 1) IA & 접근 가드
- **도메인**: `/admin/**`
- **가드 규칙**
  - Admin 역할을 가진 사용자만 접근 가능
  - 비관리자 접근 시 403 또는 홈으로 리다이렉트
  - 중요 작업(승인/거부/선정)은 2차 확인 모달

# 2) 핵심 플로우
1) **로그인** → 관리자 대시보드 접근
2) **이벤트 승인**
   - pending_approval 이벤트 목록 확인
   - 이벤트 내용 검토
   - 승인 또는 거부(사유 입력)
3) **당첨자 선정**
   - 종료된 이벤트(approved) 목록 확인
   - 응모자 목록 조회
   - 당첨자 수동 선정 또는 랜덤 선정(향후)
   - 선정 확정 → 당첨자에게 알림 발송
4) **관람 체크**
   - 공연 당일 당첨자 관람 여부 체크

# 3) 페이지별 기능 정의

## 3.1 대시보드 `/admin`

### 3.1.1 요약 위젯
- **이벤트 현황**:
  - 승인 대기 중: N건
  - 진행 중: N건
  - 종료됨: N건
- **응모 현황**:
  - 총 응모자 수
  - 당첨자 수
  - 관람 완료율
- **빠른 액션**:
  - "승인 대기 이벤트 보기"
  - "선정 대기 이벤트 보기"

### 3.1.2 최근 활동
- 최근 승인/거부한 이벤트
- 최근 선정한 당첨자

## 3.2 이벤트 관리 `/admin/events`

### 3.2.1 데이터 의존성
- GET /api/admin/events?status={status}&sort={sort}&page={page}

### 3.2.2 필터/정렬
**필터:**
- 상태: 전체/승인대기/승인됨/거부됨/종료
- 기간: 최근 7일/30일/전체

**정렬:**
- 최신순
- 응모 마감 임박순

### 3.2.3 이벤트 목록
**테이블 컬럼:**
- 이벤트 제목
- 공연명
- 파트너 (이름/연락처)
- 응모 기간
- 상태
- 생성일
- 액션 (승인/거부/상세)

### 3.2.4 이벤트 상세/검토
**상세 정보 표시:**
- 공연 정보 (제목, 설명, 날짜, 티켓 URL)
- 이벤트 정보 (제목, 설명, 티켓 수, 기간)
- 파트너 정보 (이름, 이메일, 연락처, 홍보 채널)

**액션:**
- 승인 버튼:
  - 확인 모달 → 승인 확정
  - 상태를 `approved`로 변경
  - `approved_at` 기록
  - 파트너에게 이메일 알림(향후)
- 거부 버튼:
  - 거부 사유 입력 모달 (필수)
  - 상태를 `rejected`로 변경
  - 사유 기록
  - 파트너에게 이메일 알림(향후)

### 3.2.5 승인/거부 로직
**POST /api/admin/events/{id}/approve**
- Body: `{}`
- 응답: `{ok: true, data: {event}}`

**POST /api/admin/events/{id}/reject**
- Body: `{reason: string}`
- 응답: `{ok: true, data: {event}}`

## 3.3 응모/당첨자 관리 `/admin/entries`

### 3.3.1 이벤트 선택
- 종료된 이벤트(approved, ends_at < now) 목록
- 이벤트 선택 → 응모자 목록 표시

### 3.3.2 응모자 목록
**테이블 컬럼:**
- 응모 번호
- 연락처 (해시 또는 마스킹)
- 응모 시각
- 선정 상태 (pending/selected/rejected)
- 관람 상태 (pending/checked_in/no_show)
- 액션 (선정/미선정/관람체크)

**필터:**
- 선정 상태별
- 관람 상태별

### 3.3.3 당첨자 선정
**수동 선정:**
- 체크박스로 응모자 선택
- "당첨자로 선정" 버튼
- 확인 모달 → N명 선정 확정
- `selection_status = selected` 업데이트
- `selected_at` 기록
- 당첨자에게 알림 발송(향후)

**랜덤 선정 (향후):**
- 티켓 수 입력
- "랜덤 선정" 버튼
- 알고리즘: 단순 무작위 또는 가중치 랜덤
- 확인 모달 → 선정 확정

**일괄 미선정:**
- "나머지 미선정 처리" 버튼
- 확인 모달 → pending 응모를 rejected로 변경

### 3.3.4 관람 체크
- 공연 당일 또는 이후
- 당첨자(selected) 목록에서 체크박스 선택
- "관람 완료" 버튼 → `checked_in` 상태로 변경
- "미관람" 버튼 → `no_show` 상태로 변경

### 3.3.5 데이터 내보내기 (향후)
- 응모자 목록 CSV 다운로드
- 당첨자 목록 CSV 다운로드
- 개인정보 마스킹 옵션

## 3.4 시스템 설정 (향후)
- 플랫폼 전역 설정
- 이메일 템플릿 관리
- 사용자 관리

# 4) 기능 명세

## 4.1 접근 제어
- `role = admin`인 사용자만 접근
- 비관리자 접근 시 403 또는 홈으로 리다이렉트

## 4.2 이벤트 승인
- 승인 시 `status = approved`, `approved_at = now()`
- 거부 시 `status = rejected`, 사유 기록
- 승인/거부 후 되돌리기는 수동으로 DB 수정(향후 UI 제공 고려)

## 4.3 당첨자 선정
- 선정 시 `selection_status = selected`, `selected_at = now()`
- 미선정 시 `selection_status = rejected`
- 선정 후 되돌리기 가능 (향후)

## 4.4 관람 체크
- 체크인 시 `attendance_status = checked_in`, `checked_in_at = now()`
- 미관람 시 `attendance_status = no_show`

## 4.5 알림 (향후)
- 이벤트 승인 시 → 파트너 이메일
- 이벤트 거부 시 → 파트너 이메일 + 사유
- 당첨 시 → 당첨자 이메일/SMS
- 미당첨 시 → 위로 메시지 (선택)

# 5) 카피/오류 메시지

**성공 메시지:**
- "이벤트가 승인되었습니다."
- "이벤트가 거부되었습니다."
- "N명의 당첨자가 선정되었습니다."
- "관람 상태가 업데이트되었습니다."

**확인 모달:**
- 승인: "이벤트를 승인하시겠습니까? 승인 시 관객에게 공개됩니다."
- 거부: "이벤트를 거부하시겠습니까? 파트너에게 사유가 전달됩니다."
- 선정: "N명을 당첨자로 선정하시겠습니까? 선정 후 알림이 발송됩니다."

**오류 메시지:**
- 권한 없음 (403): "관리자만 접근 가능합니다."
- 잘못된 상태: "이미 처리된 이벤트입니다."

# 6) 분석(태깅) & KPI

## 6.1 이벤트 태깅
- `admin_dashboard_view`
- `admin_event_list_view{status, filters}`
- `admin_event_approve{eventId}`
- `admin_event_reject{eventId, reason}`
- `admin_selection_manual{eventId, count}`
- `admin_attendance_check{eventId, status}`

## 6.2 KPI(Admin)
- 평균 승인 소요 시간 (제출 → 승인)
- 승인율 (approved / (approved + rejected))
- 거부율 및 주요 거부 사유
- 당첨자 선정율 (selected / total entries)
- 관람 확정율 (checked_in / selected)

# 7) QA 수락 기준

## 7.1 접근/보안
- Admin 역할 외 사용자는 `/admin` 접근 불가 (403) ⇒ PASS
- 중요 액션(승인/거부/선정)은 확인 모달 필수 ⇒ PASS

## 7.2 이벤트 승인
- 승인 시 `approved` 상태 + `approved_at` 기록 ⇒ PASS
- 거부 시 `rejected` 상태 + 사유 필수 ⇒ PASS
- 상태 변경 후 이벤트 목록에 즉시 반영 ⇒ PASS

## 7.3 당첨자 선정
- 선정 시 `selected` + `selected_at` 기록 ⇒ PASS
- 미선정 시 `rejected` 상태 ⇒ PASS
- 선정 수와 실제 업데이트된 응모 수 일치 ⇒ PASS

## 7.4 관람 체크
- 체크인 시 `checked_in` + `checked_in_at` 기록 ⇒ PASS
- 미관람 시 `no_show` 상태 ⇒ PASS

# 8) 오픈 이슈
- 승인/거부 되돌리기 기능 필요성
- 당첨자 선정 되돌리기 기능
- 자동 추첨 알고리즘 (단순 랜덤 vs 가중치)
- 응모자 개인정보 조회 권한 및 마스킹 수준
- 일괄 작업(bulk actions) 지원 범위
- 감사 로그(audit log) 구현

# 9) 참조 문서
- 상위 정책: `./PRD_MAIN.md`
- 관객 PRD: `./PRD_AUDIENCE.md`
- 파트너 PRD: `./PRD_PARTNER.md`
