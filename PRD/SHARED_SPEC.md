---

title: "SHARED_SPEC — 데이터 모델 · API 계약 · 알고리즘"

inherits: "./PRD_MAIN.md"

version: 1.0.0

last_updated: 2025-10-25T00:00:00+09:00 # KST

owner: Tech-Lead

status: draft

timezone: "Asia/Seoul"

---



# 0) 목적

플랫폼 공통의 **데이터 모델**, **API 계약**, **알고리즘(AdGate/가중치 추첨/알림 큐)**, **보안·감사 기준**을 규정한다.  

하위 PRD(Audience/Partner/Admin), Analytics_QA, Runbooks는 이 문서를 기준으로 구현·검증한다.



---



# 1) 공통 규약



## 1.1 식별자/시간/로케일

- **ID 규격**: `prefix_random` (예: `usr_8f9a...`, `show_x1y2...`, `camp_ab12...`, `lotr_...`)

- **시간**: 저장 UTC, 노출/집계 **KST**(Asia/Seoul)

- **정밀도**: ms

- **통화**: KRW (정산 영역), 소수 0자리



## 1.2 역할/상태(Enums)

| key           | values (짧은 키워드)                     |

|---------------|-------------------------------------------|

| `role`        | `member`, `partner`, `admin`              |

| `show_status` | `draft`, `review`, `published`, `rejected`|

| `event_status`| `draft`, `running`, `closed`, `drawing_ready`, `drawing_done` |

| `ad_status`   | `draft`, `review`, `running`, `stopped`, `expired` |

| `notif_state` | `queued`, `sent`, `failed`                |



## 1.3 에러 코드

- 401(비인증), 403(권한), **409(중복 응모)**, **412(사전조건 미충족)**, 422(검증 실패), 429(레이트리밋), 500/503



---



# 2) 데이터 모델(핵심 필드 요약)



> 표의 설명은 **짧은 구문**만 사용. 상세 설명은 본문 불릿으로 보강.



## 2.1 `User`

| field            | type        | note                          |

|------------------|------------|-------------------------------|

| `id`             | string(pk) | `usr_*`                       |

| `role`           | enum       | 기본 `member`                 |

| `kakao_user_id`  | string     | **unique**, 불변              |

| `nickname`       | string     | 카카오 프리필                 |

| `email`          | string?    | 선택 동의/보완 입력           |

| `phone`          | string?    | 선택 동의/보완 입력           |

| `region`         | string?    | 콜드스타트 설문               |

| `status`         | enum       | `active`, `unlinked`, `banned`|

| `created_at`     | datetime   | UTC                           |



- **인덱스**: `(kakao_user_id) unique`, `(role)`



## 2.2 `KakaoToken` (민감, 암호화 저장)

| field           | type        | note                     |

|-----------------|------------|--------------------------|

| `user_id`       | fk(User)   |                          |

| `access_enc`    | string     | 암호화                   |

| `refresh_enc`   | string     | 암호화                   |

| `scope_json`    | json       | 동의 항목                |

| `expires_at`    | datetime   |                          |



## 2.3 `PartnerApplication`

| field        | type       | note                |

|--------------|------------|---------------------|

| `id`         | string(pk) | `pa_*`              |

| `user_id`    | fk(User)   | 신청자              |

| `company`    | string     |                     |

| `biz_reg`    | string     | 사업자              |

| `status`     | enum       | `pending/approved/rejected` |

| `reason`     | string?    | 반려 사유           |

| `created_at` | datetime   |                     |



## 2.4 `Show`

| field        | type        | note                                  |

|--------------|-------------|---------------------------------------|

| `id`         | string(pk)  | `show_*`                              |

| `title`      | string      |                                       |

| `genre`      | string      | enum 유사(but 확장 허용)              |

| `content_type`| enum      | `performance` or `exhibition`          |

| `source`     | enum        | `kopis`, `community`, `partner`        |

| `commissioned`| boolean   | 기본 false, 커뮤니티 의뢰 시 true      |

| `kopis_show_id`| string?  | KOPIS 공연/전시 ID                     |

| `community_request_id`| fk?| `CommunityRequest` 연결                |

| `runtime`    | int         | 분                                   |

| `rating`     | string      | 관람 등급                             |

| `period`     | daterange   | 시작~종료                             |

| `venue`      | json        | `{name, address, lat, lng}`           |

| `synopsis`   | text        |                                       |

| `cast`       | text/array  |                                       |

| `poster_url` | string      | 업로드 경로                           |

| `ticket_url` | string?     | 예매 링크                             |

| `status`     | enum        | 위 표                                 |

| `owner_id`   | fk(User)    | 파트너 소유                           |

| `troupe_ids_cache`| json  | `troupe_id[]`(검색/필터용)             |



- **인덱스**: `(status, period)`, `(content_type, status)`, `(title trigram)`, `(genre)`, `(commissioned)`



## 2.5 `ShowPerformance` (회차)

| field        | type        | note                   |

|--------------|-------------|------------------------|

| `id`         | string(pk)  | `perf_*`               |

| `show_id`    | fk(Show)    |                        |

| `starts_at`  | datetime    | KST 기준 로직          |

| `note`       | string?     |                        |



## 2.6 `EventCampaign` (초대권 이벤트)

| field           | type        | note                                     |

|-----------------|-------------|------------------------------------------|

| `id`            | string(pk)  | `camp_*`                                 |

| `show_id`       | fk(Show)    | 1:n 허용 시 별도 맵 테이블               |

| `title`         | string      |                                          |

| `seats`         | int         | 좌석 수                                  |

| `apply_start`   | datetime    |                                          |

| `apply_end`     | datetime    |                                          |

| `draw_at`       | datetime    | KST                                      |

| `status`        | enum        |                                          |

| `adgate_rules`  | json        | `{domains[], min_dwell_sec, ttl_h, utm}` |

| `weight_rules`  | json        | 정책 스냅샷                              |

| `created_by`    | fk(User)    | 파트너                                   |



## 2.7 `Entry` (응모)

| field            | type        | note                                 |

|------------------|-------------|--------------------------------------|

| `id`             | string(pk)  | `ent_*`                              |

| `campaign_id`    | fk(Event)   |                                      |

| `user_id`        | fk(User)    |                                      |

| `email`          | string?     | 보완 입력                            |

| `phone`          | string?     | 보완 입력                            |

| `weight`         | float       | 0~cap                                 |

| `weight_json`    | json        | 분해: `{newbie:0.3,...}`              |

| `ad_verified`    | boolean     |                                      |

| `intro_seen`     | boolean     |                                      |

| `created_at`     | datetime    |                                      |



- **제약**: `UNIQUE(campaign_id, user_id)`  

- **인덱스**: `(campaign_id)`, `(user_id)`



## 2.8 `AdGateVisit`

| field          | type       | note                                  |

|----------------|------------|---------------------------------------|

| `id`           | string(pk) | `adv_*`                               |

| `user_id`      | fk(User)   |                                       |

| `campaign_id`  | string     | **광고 캠페인 ID**                    |

| `show_id`      | string?    |                                       |

| `dwell_sec`    | int        | 체류                                   |

| `verified`     | boolean    | 검증 결과                              |

| `ttl_exp`      | datetime   | 만료                                   |

| `utm`          | json       | `utm_source/medium/campaign`          |

| `signature`    | string?    | HMAC 서명                              |

| `created_at`   | datetime   |                                       |



## 2.9 `LotteryRun`

| field          | type        | note                               |

|----------------|-------------|------------------------------------|

| `id`           | string(pk)  | `lotr_*`                           |

| `campaign_id`  | fk(Event)   |                                    |

| `seats`        | int         |                                    |

| `seed_hash`    | string      | `SHA256(...)`                      |

| `params_json`  | json        | 필터/시드/시각                     |

| `winners_json` | json        | 당첨자 리스트                      |

| `wait_json`    | json        | 대기자 리스트                      |

| `created_by`   | fk(User)    | Admin                              |

| `created_at`   | datetime    |                                    |



## 2.10 `Notification`

| field        | type        | note                       |

|--------------|-------------|----------------------------|

| `id`         | string(pk)  | `ntf_*`                    |

| `user_id`    | fk(User)    |                            |

| `channel`    | enum        | `email/webpush/sms`        |

| `template`   | string      | 키                          |

| `state`      | enum        | `queued/sent/failed`       |

| `deliver_at` | datetime    | 지연 발송                  |

| `reason`     | string?     | 실패 사유                  |

| `created_at` | datetime    |                            |



## 2.11 `AdCampaign`, `AdCreative`, `AdStat`
- **AdCampaign**: 슬롯/기간/예산/과금/타게팅/상태 + `reward_mode`(`none|view_complete`), `reward_threshold_sec`(기본 15s) → `reward_test_v1` 관리
- **AdCreative**: 이미지/대체텍스트/규격/용량
- **AdStat(日)**: 노출/클릭/검증/응모 기여(assist), `reward_complete`


## 2.12 `Blacklist`

| field      | type        | note                          |

|------------|-------------|-------------------------------|

| `id`       | string(pk)  | `blk_*`                        |

| `scope`    | enum        | `user/device/ip/phone`        |

| `value`    | string      | 해시/마스킹                    |

| `reason`   | string      | 짧은 메모                      |

| `expires`  | datetime?   | null=영구                      |

| `created_by`| fk(User)   | Admin                          |



## 2.13 `AuditLog` (변조 방지 저장)

| field        | type        | note                                   |

|--------------|-------------|----------------------------------------|

| `id`         | string(pk)  | `aud_*`                                 |

| `actor_id`   | fk(User)    |                                        |

| `action`     | string      | `policy_update/lottery_execute/...`     |

| `target`     | string      | 리소스 ID                               |

| `before`     | json?       |                                        |

| `after`      | json?       |                                        |

| `ip_hash`    | string      |                                        |

| `ua_hash`    | string      |                                        |

| `hash_chain` | string      | 이전 레코드 포함 체인                   |

| `created_at` | datetime    |                                        |



## 2.14 `Troupe`
| field         | type        | note                                  |
|---------------|-------------|---------------------------------------|
| `id`          | string(pk)  | `trp_*`                               |
| `name`        | string      |                                       |
| `bio`         | text        |                                       |
| `region`      | string      | 활동 지역                              |
| `genres`      | text[]      | 주력 장르                              |
| `founded_year`| int?        |                                       |
| `logo_url`    | string?     |                                       |
| `hero_url`    | string?     |                                       |
| `sns_json`    | json        | `{type,url}`                          |
| `contact_email`| string?    |                                       |
| `website_url` | string?     |                                       |
| `artause_history_json` | json | 협업 연혁 `{year,project,deliverable}`|
| `created_at`  | datetime    |                                       |
- **인덱스**: `(name trigram)`, `(region)`, `(genres)`  

## 2.15 `ShowTroupe`
| field       | type       | note                         |
|-------------|------------|------------------------------|
| `show_id`   | fk(Show)   | 복합 PK                      |
| `troupe_id` | fk(Troupe) |                              |
| `role`      | string     | `producer|cohost|guest`      |
| `created_at`| datetime   |                              |
- **제약**: `UNIQUE(show_id, troupe_id, role)`

## 2.16 `CommunityRequest`
| field           | type        | note                               |
|-----------------|-------------|------------------------------------|
| `id`            | string(pk)  | `req_*`                             |
| `show_id`       | fk(Show)?   | 승인 전에는 null 허용              |
| `requested_by`  | string      | 기관/담당자                        |
| `source`        | enum        | `community`, `partner`, `internal` |
| `deliverable`   | json        | `{type,scope}`                      |
| `status`        | enum        | `draft`, `approved`, `published`    |
| `commissioned_at`| datetime?  | 승인 시각                           |
| `story_url`     | string?     | 케이스 스터디 링크                 |
| `notes`         | text?       |                                    |
| `created_by`    | fk(User)    | 커뮤니티 매니저                    |
- **인덱스**: `(status, created_at)`, `(source)`, `(show_id)`  
- Show는 `community_request_id`로 역참조, `commissioned=true` 시 필수.

---



# 3) API 계약(요약)



> 베이스:  

> - B2C: `/api`  

> - Partner: `/api/partner`  

> - Admin: `/api/admin`  

> 응답 공통 래퍼: `{ "ok": true|false, "data": ..., "error": {code, message} }`



## 3.1 인증/세션

- `GET /auth/kakao/login` → 302 to Kakao

- `GET /auth/kakao/callback?code=...` → `{ok, data:{user:{id,role}}}`

- `POST /auth/logout` → `{ok:true}`

- `GET /me` → 프로필/역할/동의 상태



## 3.2 B2C — 쇼/응모/AdGate
- `GET /shows?genre&region&date&contentType&source&commissionedOnly&troupeId&q&sort&page` → 목록
- `GET /shows/{id}` → 상세
- `GET /community/requests?status&limit` → 커뮤니티 의뢰 리스트
- `GET /troupes/{id}` / `GET /troupes/{id}/shows?page&size` → 극단 상세/작품
- `POST /adgate/open` → `{ok:true}` (클라이언트 시작 로그)
- `POST /adgate/verify`  

  - **Body**: `{campaignId, showId?, signature?, dwellSec, utm}`  

  - **Res**: `{ok:true, ttlExp:"..."}`

- `POST /entries`  

  - **Body**: `{campaignId, email?, phone?, sns?, terms:true, privacy:true, marketing?:bool}`  

  - **Res**: 201 / **409** / **412**

- `GET /me/entries` → 내 응모 목록



## 3.3 Partner — 작품/이벤트/광고

- `POST /partner/shows` → draft 생성

- `PUT /partner/shows/{id}` → 수정

- `POST /partner/shows/{id}/submit` → review 전환

- `POST /partner/events` → 캠페인 생성

- `GET /partner/events/{id}/stats` → 현황

- `POST /partner/ads` / `PUT /partner/ads/{id}` / `POST /partner/ads/{id}/start|stop`



## 3.4 Admin — 승인/정책/추첨

- `POST /admin/approvals/partners/{id}:{approve|reject}`  

- `POST /admin/shows/{id}:{approve|reject}`  

- `POST /admin/events/{id}/state:{running|closed|drawing_ready}`

- `GET /admin/policies` / `PUT /admin/policies` (이중확인)

- `POST /admin/lottery/execute`  

  - **Body**: `{campaignId, seats}` → `{ok, data:{auditId, winners[], wait[]}}`

- `POST /admin/waitlist/promote` → 자동 승급 트리거



## 3.5 오류 포맷 예시

```json

{

  "ok": false,

  "error": { "code": 412, "message": "Precondition failed: intro/adgate" }

}

# 4) 외부 데이터/피드 동기화

## 4.1 KOPIS 공연/전시
- **엔드포인트**: KOPIS Open API(공연·전시) → `kopis_show_id`, `kopis_org_id`.
- **스케줄**: 3시간 간격 증분(`lastModified` 커서) + 일 1회 풀 백필. 실패 시 15분 간격 3회 재시도 후 Ops 알림.
- **필드 매핑**: 장르/등급/기간/장소/출연/단체명 → `Show`, 단체명 → `Troupe` upsert(이름+지역 fuzzy).
- **전시 특화**: `content_type=exhibition`, `exhibitionMeta{openHours,closedDays,feeNote}` 채우기. 응모 흐름 제외, 소개/티켓 링크만 노출.

## 4.2 커뮤니티 의뢰
- 파트너/내부 요청 → `CommunityRequest` 작성 → 승인 시 `commissioned=true`, `show.community_request_id` 세팅.
- 홈/커뮤니티 모듈은 `status=published` + 최신 승격 순. `story_url` 없을 경우 “성과 준비 중” 메시지 노출.
- 극단 정보는 `ShowTroupe` 조인으로 연결, 미존재 시 Admin이 `Troupe` 생성 후 매핑.

## 4.3 데이터 품질/모니터링
- **중복 탐지**: `kopis_show_id` unique, 수동 등록 시 Soft-check로 경고.
- **연결 검증**: `commissioned=true` 인 쇼는 `CommunityRequest` 존재 여부, 최소 1개 `troupe` 매핑 여부를 배치 체크.
- **로그**: `feed_sync_run{source,success,duration,inserted,updated}` 이벤트로 관제.

