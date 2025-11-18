---
title: "ANALYTICS_QA — 태깅·KPI·품질 기준"
inherits: "./PRD_MAIN.md"
version: 2.0.0
last_updated: 2025-11-16T00:00:00+09:00
owner: Data-Owner-Name
status: active
timezone: "Asia/Seoul"
---

# 0) 목적
Artause 플랫폼의 **측정 표준**, **KPI 산식**, **품질/QA 수락기준**을 정의한다.

# 1) 이벤트 명명 규칙
- **동사_명사_상태** (소문자, 스네이크케이스)
- 성공/실패 접미사: `{success|error|attempt}`
- 예) `entry_submit_success`, `event_card_click`

# 2) 공통 컨텍스트 (모든 이벤트에 포함)
| key           | type   | note                      |
|---------------|--------|---------------------------|
| `event_time`  | string | ISO8601, KST              |
| `user_id`     | string | 익명 사용자 ID            |
| `session_id`  | string | uuid                      |
| `page`        | string | path                      |
| `referrer`    | string | HTTP referrer             |
| `device`      | string | mobile/tablet/desktop     |

# 3) 핵심 이벤트 스키마

## 3.1 페이지 뷰
| event           | props (추가)    |
|-----------------|-----------------|
| `page_view`     | `page`, `title` |

## 3.2 이벤트 탐색
| event                 | props (추가)                   |
|-----------------------|--------------------------------|
| `event_list_view`     | `filters`, `sort`, `page`      |
| `event_card_click`    | `eventId`, `eventTitle`        |
| `event_detail_view`   | `eventId`, `dwellSec`          |
| `filter_change`       | `key`, `value`                 |

## 3.3 응모
| event                    | props (추가)           |
|--------------------------|------------------------|
| `entry_submit_attempt`   | `eventId`              |
| `entry_submit_success`   | `eventId`, `campaignId`|
| `entry_submit_error`     | `eventId`, `code`      |
| `apply_cta_click`        | `eventId`, `status`    |

## 3.4 파트너
| event                          | props (추가)    |
|--------------------------------|-----------------|
| `partner_dashboard_view`       |                 |
| `partner_create_event_attempt` |                 |
| `partner_create_event_success` | `eventId`       |
| `partner_create_event_error`   | `code`, `reason`|

## 3.5 어드민
| event                      | props (추가)         |
|----------------------------|----------------------|
| `admin_dashboard_view`     |                      |
| `admin_event_approve`      | `eventId`            |
| `admin_event_reject`       | `eventId`, `reason`  |
| `admin_selection_manual`   | `eventId`, `count`   |
| `admin_attendance_check`   | `eventId`, `status`  |

# 4) KPI 정의

## 4.1 관객(Audience) KPI
- **홈 → 이벤트 목록 전환율** = `event_list_view / page_view(page='/')`
- **이벤트 상세 → 응모 전환율** = `entry_submit_success / event_detail_view`
- **응모 완료율** = `entry_submit_success / entry_submit_attempt`
- **재방문율** = 7일 내 재방문 사용자 / 총 사용자

## 4.2 파트너(Partner) KPI
- **이벤트 생성 완료율** = `partner_create_event_success / partner_create_event_attempt`
- **승인율** = approved events / (approved + rejected)
- **평균 승인 소요 시간** = AVG(approved_at - created_at)
- **재등록률** = repeat creators / total creators

## 4.3 어드민(Admin) KPI
- **평균 승인 소요 시간** = AVG(approved_at - created_at)
- **승인율** = approved / (approved + rejected)
- **당첨자 선정율** = selected / total entries
- **관람 완료율** = checked_in / selected

# 5) 대시보드 요구사항

## 5.1 실시간 대시보드
- **카드**: 오늘의 이벤트 조회수, 응모 수, 승인 대기 수
- **퍼널 차트**: 홈 → 목록 → 상세 → 응모
- **경보**: 오류율 임계치 (5% 초과 시 알림)

## 5.2 주간/월간 리포트
- 이벤트별 응모 추이
- 승인 소요 시간 추이
- 당첨률 및 관람 완료율

# 6) QA 수락 기준 (데이터 품질)

## 6.1 스키마/필드
- 모든 이벤트에 **공통 컨텍스트** 필드 존재 ⇒ PASS
- 이벤트별 **필수 props** 누락률 < 0.1% ⇒ PASS

## 6.2 무결성
- `entry_submit_error` 발생 시 직전 30분 내 `event_detail_view` 존재율 > 95% ⇒ PASS
- 중복 이벤트 (동일 session_id + event_time) < 0.05% ⇒ PASS

## 6.3 시간/타임존
- 모든 집계는 **KST 기준** ⇒ PASS
- UTC 혼합 금지 ⇒ PASS

# 7) 테스트 케이스

## 7.1 응모 플로우
- 정상 응모: `attempt` → `success` 순서 확인
- 중복 응모: `attempt` → `error(code=409)` 확인
- 기간 외 응모: `attempt` → `error(code=412)` 확인

## 7.2 승인 플로우
- 승인: `admin_event_approve` 발생 확인
- 거부: `admin_event_reject` + `reason` 존재 확인

# 8) 알림/경보 임계치

| metric                       | threshold      | action     |
|------------------------------|----------------|------------|
| 응모 오류율                  | > 5% (10분)    | 경보       |
| 이벤트 조회 없음             | 1시간 0건      | 점검       |
| 승인 지연                    | > 3일          | 알림       |

# 9) 데이터 거버넌스
- 스키마 변경은 버전 증가 + 마이그레이션 노트
- PII는 해시/마스킹, 원문 저장 금지
- 이벤트 키/필수 필드 변경은 2주 공지
