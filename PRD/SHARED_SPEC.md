---
title: "SHARED_SPEC — 데이터 모델 · API 계약"
inherits: "./PRD_MAIN.md"
version: 2.0.0
last_updated: 2025-11-16T00:00:00+09:00
owner: Tech-Lead
status: active
timezone: "Asia/Seoul"
---

# 0) 목적
플랫폼 공통의 **데이터 모델**, **API 계약**, **에러 코드**, **보안 기준**을 규정한다.

# 1) 공통 규약

## 1.1 식별자/시간/로케일
- **ID 규격**: UUID v4
- **시간**: 저장 UTC, 노출/집계 **KST**(Asia/Seoul)
- **정밀도**: 초 단위 (timestamptz)
- **통화**: KRW

## 1.2 역할/상태(Enums)
| key             | values                                        |
|-----------------|-----------------------------------------------|
| `role`          | `member`, `partner`, `admin`                  |
| `campaign_status`| `pending_approval`, `approved`, `rejected`, `closed` |
| `selection_status`| `pending`, `selected`, `rejected`            |
| `attendance_status`| `pending`, `checked_in`, `no_show`          |
| `performance_status`| `draft`, `scheduled`, `ongoing`, `completed`|

## 1.3 에러 코드
- 401: 비인증
- 403: 권한 없음
- **409**: 중복 응모
- **412**: 사전조건 미충족 (이벤트 기간 외, 승인되지 않음)
- 422: 검증 실패
- 429: Rate Limit
- 500/503: 서버 오류

# 2) 데이터 모델 (핵심 필드)

## 2.1 `Performances`
| field            | type        | note                    |
|------------------|-------------|-------------------------|
| `id`             | uuid(pk)    |                         |
| `slug`           | string      | unique                  |
| `title`          | string      |                         |
| `description`    | text        |                         |
| `genre`          | string      |                         |
| `venue`          | string      |                         |
| `starts_at`      | timestamptz |                         |
| `ends_at`        | timestamptz |                         |
| `status`         | enum        |                         |
| `created_at`     | timestamptz |                         |
| `updated_at`     | timestamptz |                         |

## 2.2 `Ticket Campaigns`
| field               | type        | note                          |
|---------------------|-------------|-------------------------------|
| `id`                | uuid(pk)    |                               |
| `performance_id`    | fk(Performances) |                          |
| `slug`              | string      | unique                        |
| `title`             | string      |                               |
| `description`       | text        |                               |
| `reward`            | string      | 예: "2인 초대권"              |
| `starts_at`         | timestamptz | 응모 시작                     |
| `ends_at`           | timestamptz | 응모 종료                     |
| `status`            | enum        | 승인 상태                     |
| `ticket_purchase_url`| string     |                               |
| `partner_name`      | string      |                               |
| `partner_email`     | string      |                               |
| `partner_phone`     | string      |                               |
| `approved_at`       | timestamptz |                               |
| `approved_by`       | string      | admin user id                 |
| `form_link`         | string      | 외부 응모 폼 (선택)           |
| `created_at`        | timestamptz |                               |
| `updated_at`        | timestamptz |                               |

## 2.3 `Ticket Entries`
| field               | type        | note                          |
|---------------------|-------------|-------------------------------|
| `id`                | uuid(pk)    |                               |
| `campaign_id`       | fk(TicketCampaigns) |                       |
| `contact_hash`      | string      | SHA256(연락처) - 중복 방지    |
| `selection_status`  | enum        | pending/selected/rejected     |
| `attendance_status` | enum        | pending/checked_in/no_show    |
| `selected_at`       | timestamptz |                               |
| `checked_in_at`     | timestamptz |                               |
| `fingerprint`       | jsonb       | 디바이스/브라우저 정보        |
| `metadata`          | jsonb       | 추가 정보                     |
| `created_at`        | timestamptz |                               |

**제약**: `UNIQUE(campaign_id, contact_hash)`

## 2.4 `Organizations`
| field            | type        | note                    |
|------------------|-------------|-------------------------|
| `id`             | uuid(pk)    |                         |
| `slug`           | string      | unique                  |
| `name`           | string      |                         |
| `tagline`        | string      |                         |
| `description`    | text        |                         |
| `genre_focus`    | text[]      |                         |
| `region`         | string      |                         |
| `cover_image_url`| string      |                         |
| `logo_url`       | string      |                         |
| `website`        | string      |                         |
| `instagram`      | string      |                         |
| `youtube`        | string      |                         |
| `follower_count` | int         |                         |
| `created_at`     | timestamptz |                         |
| `updated_at`     | timestamptz |                         |

# 3) API 계약

## 3.1 공통 응답 형식
```json
{
  "ok": true|false,
  "data": {...},
  "error": {
    "code": 422,
    "message": "Validation failed"
  }
}
```

## 3.2 주요 엔드포인트

### Audience (B2C)
- `GET /api/events?status=approved&genre[]&region[]&q&sort&page&size`
- `GET /api/events/{slug}`
- `POST /api/entries` - Body: `{campaignId, name, contact, marketingConsent}`

### Partner
- `GET /api/partner/events` - 내 이벤트 목록
- `POST /api/partner/events` - 이벤트 생성

### Admin
- `GET /api/admin/events?status&sort&page`
- `POST /api/admin/events/{id}/approve`
- `POST /api/admin/events/{id}/reject` - Body: `{reason}`
- `GET /api/admin/entries?campaignId&status`
- `POST /api/admin/entries/select` - Body: `{entryIds[]}`
- `POST /api/admin/entries/attendance` - Body: `{entryIds[], status: checked_in|no_show}`

## 3.3 에러 응답 예시
```json
{
  "ok": false,
  "error": {
    "code": 409,
    "message": "이미 응모하셨습니다"
  }
}
```

# 4) 보안 및 개인정보

## 4.1 개인정보 보호
- 연락처는 SHA256 해시로 저장 (`contact_hash`)
- PII 최소화 원칙
- 응모 데이터는 이벤트 종료 후 90일 보관 후 익명화(향후)

## 4.2 접근 제어
- 역할 기반 접근 제어 (RBAC)
- Row Level Security (RLS) 활성화
- 파트너는 자신의 이벤트만 조회
- 관리자만 모든 데이터 접근 가능

## 4.3 Rate Limiting
- 응모 엔드포인트: 10 req/min per IP
- API 전역: 100 req/min per user

# 5) 데이터 무결성

## 5.1 제약 조건
- `UNIQUE(campaign_id, contact_hash)` - 중복 응모 방지
- `CHECK(ends_at > starts_at)` - 기간 검증
- 외래 키 제약 조건 활성화

## 5.2 인덱스
- `idx_campaigns_status` on `(status, approved_at)`
- `idx_entries_selection` on `(campaign_id, selection_status)`
- `idx_entries_attendance` on `(campaign_id, attendance_status)`

# 6) 성능 고려사항
- 응모 조회는 campaign_id로 파티션
- 상태별 조회를 위한 복합 인덱스 활용
- 페이지네이션 기본 20개, 최대 100개

# 7) 향후 확장 고려사항
- 카카오 소셜 로그인 → `users` 테이블 및 OAuth 토큰 관리
- 자동 추첨 알고리즘 → `lottery_runs` 테이블
- 알림 큐 → `notifications` 테이블
- 감사 로그 → `audit_logs` 테이블
