---
title: "ANALYTICS_QA — 태깅·KPI·대시보드·품질 기준"
inherits: "./PRD_MAIN.md"
version: 1.0.0
last_updated: 2025-10-25T00:00:00+09:00 # KST
owner: Data-Owner-Name
status: draft
timezone: "Asia/Seoul"
data_stack:
  collection: "Web SDK + Server logs"
  transport: "HTTPS, batch 5s/20 events"
  warehouse: "events_raw, events_clean, marts_*"
privacy:
  pii_minimization: true
  quiet_hours: "22:00-08:00 KST"
---

# 0) 목적
Intro-first → AdGate → 응모 → 가중치 추첨 퍼널의 **측정 표준**, **KPI 산식**, **대시보드 요구사항**, **품질/QA 수락기준**을 정의한다.  
모든 하위 PRD는 본 스키마/이벤트 키를 사용한다.

---

# 1) 이벤트 명명 규칙
- **동사_명사_상태** (소문자, 스네이크케이스)  
- 성공/실패 접미사: `{success|fail}`  
- 숫자 단위: 초(sec), 원(krw), 퍼센트(%)는 숫자만 기록, 단위는 메타에서 관리

예) `auth_kakao_login_success`, `adgate_verify_fail`, `entry_submit_conflict`

---

# 2) 공통 컨텍스트(모든 이벤트에 포함)
| key              | type    | note                         |
|------------------|---------|------------------------------|
| `event_time`     | string  | ISO8601, KST                 |
| `user_id`        | string  | `kakao_user_id` (익명키)     |
| `session_id`     | string  | uuid                         |
| `role`           | string  | member/partner/admin         |
| `page`           | string  | path + query                  |
| `referrer`       | string  | HTTP referrer                 |
| `device`         | string  | web_ios/web_android/desktop  |
| `ua_hash`        | string  | user-agent 해시               |
| `ip_hash`        | string  | IP 해시                       |
| `exp_bucket`     | string  | 실험 배정 키(없으면 null)    |

> PII는 원문 저장 금지. 이메일/전화는 **마스킹 또는 해시**.

---

# 3) 핵심 이벤트 스키마

## 3.1 인증/접근
| event                              | props (추가)                         |
|-----------------------------------|--------------------------------------|
| `auth_kakao_login_success`        | `kakao_scope[]`                      |
| `auth_kakao_login_fail`           | `reason`                             |
| `guard_blocked`                   | `route`, `code` (401/403/412/409)    |

## 3.2 상세/Intro-first
| event                       | props (추가)                       |
|----------------------------|------------------------------------|
| `view_show_detail`         | `show_id`, `dwell_sec`, `scroll_pct` |
| `intro_marked`             | `show_id`, `by`(scroll/dwell)      |

## 3.3 AdGate
| event                      | props (추가)                                      |
|---------------------------|---------------------------------------------------|
| `adgate_open`             | `show_id`, `campaign_id`, `slot`, `utm_*`        |
| `adgate_verify_success`   | `show_id`, `campaign_id`, `dwell_sec`, `ttl_h`    |
| `adgate_verify_fail`      | `show_id`, `campaign_id`, `reason`                |

## 3.4 응모/추첨
| event                              | props (추가)                                              |
|-----------------------------------|-----------------------------------------------------------|
| `entry_submit_attempt`            | `campaign_id`                                            |
| `entry_submit_success`            | `campaign_id`, `weight`, `weight_breakdown`(json)        |
| `entry_submit_conflict`(409)      | `campaign_id`                                            |
| `entry_submit_precondition`(412)  | `campaign_id`, `missing`(intro/adgate)                   |
| `lottery_draw_execute`(admin)     | `campaign_id`, `seats`, `seed_hash`                      |
| `waitlist_promoted`               | `campaign_id`, `from_pos`, `to_pos`                      |

## 3.5 알림
| event                    | props (추가)                 |
|-------------------------|------------------------------|
| `notify_queued`         | `channel`, `template`, `eta` |
| `notify_sent`           | `channel`, `delivery_id`     |
| `notify_failed`         | `channel`, `reason`          |

## 3.6 광고
| event                    | props (추가)                                  |
|-------------------------|-----------------------------------------------|
| `ad_impression`         | `slot`, `campaign_id`, `creative_id`          |
| `ad_click`              | `slot`, `campaign_id`, `creative_id`, `utm_*` |
| `ad_attributed_entry`   | `campaign_id`(ad), `entry_campaign_id`(event) |

## 3.7 파트너/어드민(요약)
| event                               | props (추가)                     |
|------------------------------------|----------------------------------|
| `partner_event_create_running`     | `event_id`                       |
| `admin_policy_update`              | `key`, `old`, `new`              |
| `admin_blacklist_add`              | `scope`, `reason`                |

---

# 4) KPI 정의(산식)

## 4.1 퍼널
- **상세→응모 전환율** = `entry_submit_success / view_show_detail (same show_id)`  
- **AdGate→응모 전환율** = `entry_submit_success / adgate_verify_success`  
- **응모 완료율** = `entry_submit_success / entry_submit_attempt`  
- **알림 도달율** = `notify_sent / notify_queued`

## 4.2 품질/운영
- **중복 응모 차단율** = `entry_submit_conflict / entry_submit_attempt`  
- **AdGate 검증 성공률** = `adgate_verify_success / adgate_open`  
- **조용한 시간 위반률** = `notify_sent (22–08시) / notify_sent_total` (목표 0)

## 4.3 파트너/광고
- **CTR** = `ad_click / ad_impression`  
- **AdGate 전환율(광고)** = `adgate_verify_success(ad campaign) / ad_click`  
- **어트리뷰션 기여율** = `ad_attributed_entry / entry_submit_success`

---

# 5) 대시보드 요구사항

## 5.1 실시간(운영)
- 카드: 오늘의 상세수/AdGate 성공수/응모수/추첨예정수
- 퍼널 차트: 상세→AdGate→응모
- 경보: `adgate_verify_fail(reason=utm_missing|dwell_short)` 임계치

## 5.2 제품 성과(일단위)
- 전환율 추이(7/30일), 장르/지역 세그먼트
- 캠페인별 경쟁률(응모/좌석), 대기자 승급률

## 5.3 광고/파트너
- 슬롯별 노출/클릭/AdGate/응모 기여
- 캠페인 퍼널 + 예산 소진/페이싱

## 5.4 알림
- 채널별 큐 현황, 실패 사유 Top, 조용한 시간 지연큐 통계

---

# 6) 데이터 모델(요약)

## 6.1 레이어
- `events_raw`: 수집 원본  
- `events_clean`: 스키마 정제 + PII 마스킹  
- `marts_product`: 퍼널/세그먼트 뷰  
- `marts_ads`: 광고·어트리뷰션 뷰  
- `marts_ops`: 알림/모니터링 뷰

## 6.2 핵심 테이블 키
| table             | pk                       | partition         |
|-------------------|--------------------------|-------------------|
| `events_clean`    | `(event_time, user_id, event)` | by day (KST) |
| `entries`         | `entry_id`               | by campaign_id    |
| `lottery_runs`    | `audit_id`               | by campaign_id    |
| `ad_events`       | `(event_time, campaign_id, slot)` | by day |

---

# 7) 트래킹 구현 가이드

## 7.1 프런트(Web)
- **발화 시점**: DOM ready / CTA click / XHR 결과 콜백  
- **전송 정책**: `navigator.sendBeacon` 선호, 실패 시 XHR  
- **배치**: 5초 또는 20건 기준 플러시

## 7.2 서버(필수)
- `adgate_verify_*`, `entry_submit_*`, `lottery_*`, `notify_*`는 **서버 로그가 정본**

## 7.3 오류 처리
- 전송 실패 → 재시도 백오프(0.5/1/2/4s), 최대 4회  
- 중복 방지 → `(session_id, client_ts, event, dedup_key)` 해시

---

# 8) QA 수락 기준(데이터 품질)

## 8.1 스키마/필드
- 모든 이벤트에 **공통 컨텍스트** 필드 존재 ⇒ PASS  
- 이벤트별 **필수 props** 누락률 < **0.1%** ⇒ PASS  
- 잘못된 타입 비율 < **0.1%** ⇒ PASS

## 8.2 무결성
- `entry_submit_precondition` 발생 시 직전 30분 내 `view_show_detail` 또는 `adgate_open` 존재율 > **95%** ⇒ PASS  
- `ad_attributed_entry`는 동일 세션/TTL 내 `adgate_verify_success` 존재 ⇒ PASS

## 8.3 시간/타임존
- 모든 집계는 **KST 기준** 파티션, UTC 혼합 금지 ⇒ PASS

## 8.4 중복/유실
- 중복 이벤트(동일 dedup_key) < **0.05%**, 수집 유실(전송 실패 미복구) < **0.1%** ⇒ PASS

## 8.5 조용한 시간
- `notify_sent`가 22–08시에 직접 발송 0건, 모두 `queued→sent` 전환 로그 보유 ⇒ PASS

---

# 9) 테스트 케이스(기능별)

## 9.1 Intro-first
- 상세 진입 후 3초 이탈 → `intro_marked` 미발생  
- 7초 체류 → `intro_marked(by=dwell)` 발생  
- 스크롤 65% → `intro_marked(by=scroll)` 발생

## 9.2 AdGate
- UTM 누락 → `adgate_verify_fail(reason=utm_missing)`  
- 체류 3초(<5s) → `adgate_verify_fail(reason=dwell_short)`  
- 6초 체류 + 허용 도메인 → `adgate_verify_success(ttl_h=24)`

## 9.3 응모
- 사전조건 미충족 → `entry_submit_precondition(missing=intro|adgate)`  
- 중복 제출 → `entry_submit_conflict`  
- 정상 제출 → `entry_submit_success(weight>0)`

## 9.4 추첨/승급
- 동일 입력+시드 → `lottery_draw_execute` 결과 동일  
- 미응답 → `waitlist_promoted` 발생

## 9.5 알림
- 조용한 시간 발송 요청 → `notify_queued`만 생성, 08:00 이후 `notify_sent` 전환

## 9.6 광고
- 노출→클릭→AdGate 검증→응모 기여까지 이벤트 체인 일관

---

# 10) 알림/경보 임계치(초기)

| metric                          | threshold                  | action          |
|---------------------------------|----------------------------|-----------------|
| `adgate_verify_fail` 비율       | > 20% (10분 이동)          | 경보 + 점검     |
| `entry_submit_precondition` 비율| > 15% (30분)               | 카피/UX 점검     |
| 조용한시간 위반                 | > 0                        | 즉시 중지       |
| 수집 유실(전송 실패)            | > 0.5% (5분)               | 재시도/확인     |

---

# 11) 어트리뷰션 규칙(요약)
- **Last AdGate Touch**  
  동일 세션 또는 TTL 내 `adgate_verify_success(campaign_id=X)` → 이후 `entry_submit_success`는 `X`에 **assist** 부여.

---

# 12) 데이터 거버넌스
- 스키마 변경은 **버전 증가** + 마이그레이션 노트  
- 이벤트 키/필수 필드 변경은 **Deprecation 2주 공지**  
- PII는 해시/마스킹, 원문 저장 금지

---

# 13) 샘플 페이로드

```json
{
  "event": "entry_submit_success",
  "event_time": "2025-10-25T14:03:21+09:00",
  "user_id": "k_9a1b2c3d4e",
  "session_id": "b2b3c4-...",
  "role": "member",
  "page": "/shows/abc123/apply",
  "referrer": "/shows/abc123",
  "device": "desktop",
  "weight": 1.45,
  "weight_breakdown": {"newbie":0.3,"referral":0.15},
  "campaign_id": "camp_789"
}
