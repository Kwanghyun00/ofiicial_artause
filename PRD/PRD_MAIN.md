---
title: "Artause — 메인 PRD (공연 티켓 추첨 플랫폼)"
version: 2.0.0
last_updated: 2025-11-16T00:00:00+09:00
owner: PM-Name
status: active
# 운영 설정
toggles:
  kakao_login_planned: false  # 현재는 일반 로그인
  admin_approval_required: true
  simple_lottery: true  # 간단한 추첨 시스템
domains:
  production: "artause.com"
  staging: "staging.artause.com"
policy_defaults:
  lottery:
    approval_required: true
    selection_method: "admin_manual"  # 관리자가 수동으로 선정
timezone: "Asia/Seoul"
---

# 0) 문서 목적
본 문서는 Artause 공연 티켓 추첨 플랫폼의 상위 PRD로, **서비스 정의, 핵심 정책, 데이터 모델, 역할 구조**를 정의한다.
하위 PRD(`PRD_AUDIENCE.md`, `PRD_PARTNER.md`, `PRD_ADMIN.md`)는 이 문서의 정책을 상속한다.

# 1) 서비스 정의 · 목표

## 1.1 정의
공연 종사자가 티켓 초대 이벤트를 진행하고, 관객이 응모하여 무료 관람 기회를 얻는 양면 플랫폼

## 1.2 핵심 가치
- **접근성**: 관객이 쉽게 공연을 발견하고 무료 관람 기회를 얻음
- **투명성**: 공정한 추첨 및 선정 프로세스
- **편의성**: 공연 종사자가 쉽게 이벤트를 등록하고 관리

## 1.3 성공 지표(KPI)
- 이벤트 응모 전환율
- 이벤트 승인율 및 승인 소요 시간
- 당첨자 관람 확정률
- 파트너 재등록률

# 2) 대상/역할 구조

## 2.1 역할
- **관객(Audience)**: 공연 탐색, 티켓 이벤트 응모, 당첨 확인
- **파트너(Partner)**: 공연/이벤트 등록, 응모 현황 확인
- **관리자(Admin)**: 이벤트 승인, 당첨자 선정, 시스템 관리

## 2.2 인증
- 현재: 일반 이메일/비밀번호 로그인
- 향후: 카카오 소셜 로그인 추가 고려

# 3) 핵심 프로세스

## 3.1 이벤트 생성 및 승인 플로우
1. 파트너가 공연 정보 + 티켓 이벤트 정보 입력
2. 시스템에 **pending_approval** 상태로 저장
3. 관리자가 검토 후 **approved** 또는 **rejected**
4. 승인 시 이벤트 기간 동안 관객에게 노출
5. 이벤트 종료 후 **closed** 상태로 전환

## 3.2 응모 및 선정 플로우
1. 관객이 승인된 이벤트에 응모 (연락처 정보 입력)
2. 응모 내역은 **pending** 상태로 저장
3. 이벤트 종료 후 관리자가 당첨자 선정
4. 선정된 응모는 **selected**, 미선정은 **rejected**
5. 당첨자에게 알림 발송
6. 공연 관람 후 관람 체크 가능 (**checked_in** / **no_show**)

## 3.3 상태 관리

### 이벤트(Ticket Campaign) 상태
- `pending_approval`: 승인 대기
- `approved`: 승인됨 (응모 가능)
- `rejected`: 거부됨
- `closed`: 종료됨

### 응모(Ticket Entry) 상태
**선정 상태:**
- `pending`: 대기 중
- `selected`: 당첨
- `rejected`: 미당첨

**관람 상태:**
- `pending`: 미확인
- `checked_in`: 관람 완료
- `no_show`: 미관람

# 4) 데이터 모델 (핵심)

## 4.1 Performances
공연 기본 정보
- 제목, 설명, 장르, 기간, 장소
- 티켓 구매 URL
- 상태 (draft/scheduled/ongoing/completed)

## 4.2 Ticket Campaigns
티켓 초대 이벤트
- 연결된 공연(performance_id)
- 이벤트 제목, 설명, 보상 (ex: "2인 초대권")
- 이벤트 기간 (starts_at ~ ends_at)
- 승인 상태 (status)
- 파트너 정보 (partner_name, partner_email, partner_phone)
- 승인 정보 (approved_at, approved_by)

## 4.3 Ticket Entries
응모 내역
- 캠페인(campaign_id)
- 응모자 정보 (contact_hash - 연락처 해시)
- 선정 상태 (selection_status)
- 관람 상태 (attendance_status)
- 메타데이터 (fingerprint, metadata)

## 4.4 Organizations
공연 단체/극단 정보
- 이름, 슬러그, 소개
- 장르, 지역
- 소셜 미디어 링크

# 5) 정보 구조(IA) · 라우팅

## 5.1 공개 영역 (Audience)
- `/`: 홈 (추천 공연, 진행 중 이벤트)
- `/events`: 티켓 이벤트 목록
- `/events/[slug]`: 이벤트 상세 및 응모
- `/events/tickets/[slug]`: 티켓 응모 폼

## 5.2 파트너 영역
- `/event-center`: 대시보드
- `/event-center/create`: 이벤트 생성

## 5.3 관리자 영역
- `/admin`: 대시보드
- `/admin/events`: 이벤트 승인 관리
- `/admin/entries`: 응모 관리 및 당첨자 선정

# 6) 핵심 정책

## 6.1 승인 정책
- 모든 이벤트는 관리자 승인 필요
- 승인 시 이벤트 기간 동안 자동 노출
- 부적절한 내용, 허위 정보 등은 거부 사유와 함께 반려

## 6.2 응모 정책
- 1인 1회 응모 제한 (campaign_id + contact_hash 유니크)
- 이벤트 기간 내에만 응모 가능
- 필수 정보: 이름, 연락처

## 6.3 선정 정책
- 관리자가 이벤트별로 수동 선정
- 선정 기준: 파트너가 제시한 티켓 수량 기준
- 공정성 확보를 위한 랜덤 선정 도구 제공 (향후)

## 6.4 알림 정책
- 이벤트 승인 시: 파트너에게 이메일 알림
- 당첨 시: 당첨자에게 이메일/SMS 알림
- 조용한 시간(22:00-08:00 KST) 준수

# 7) 보안 및 개인정보

## 7.1 개인정보 보호
- 연락처는 해시로 저장 (contact_hash)
- PII 최소화 원칙
- 응모 데이터는 이벤트 종료 후 90일 보관 후 익명화

## 7.2 접근 제어
- 역할 기반 접근 제어 (RBAC)
- 파트너는 자신의 이벤트만 조회
- 관리자만 모든 데이터 접근 가능

# 8) QA 수락 기준

## 8.1 이벤트 승인
- pending_approval 상태의 이벤트는 공개 목록에 미노출 ⇒ PASS
- 승인 시 approved 상태로 전환 및 공개 ⇒ PASS
- 거부 시 rejected 상태 및 사유 기록 ⇒ PASS

## 8.2 응모
- 동일 campaign + contact 중복 응모 차단 (409) ⇒ PASS
- 이벤트 기간 외 응모 차단 ⇒ PASS
- 승인되지 않은 이벤트 응모 차단 ⇒ PASS

## 8.3 선정
- 선정된 응모는 selection_status = selected ⇒ PASS
- 선정 시각 기록 (selected_at) ⇒ PASS
- 당첨자 알림 발송 ⇒ PASS

# 9) 릴리스 계획

## v1.0 (현재)
- 기본 이벤트 등록 및 승인 워크플로우
- 응모 및 수동 선정
- 당첨자 알림
- 관람 체크

## v1.1 (계획)
- 카카오 소셜 로그인
- 자동 추첨 도구
- 응모자 통계 및 리포트
- 파트너 대시보드 강화

## v1.2 (계획)
- 공연 추천 알고리즘
- 커뮤니티 기능
- 극단/단체 프로필 페이지

# 10) 의사결정 로그

## 결정 사항
- 2025-11-16: AdGate/가중치 추첨 시스템 제거, 간단한 수동 선정으로 변경
- 2025-11-16: 이벤트 승인 워크플로우 추가
- 2025-11-16: 관람 체크 기능 추가

## 오픈 이슈
- 자동 추첨 알고리즘 도입 시점 및 방식
- 카카오 로그인 연동 우선순위
- 파트너 포털 고도화 범위

# 11) 참조 문서
- 하위 PRD: `PRD_AUDIENCE.md`, `PRD_PARTNER.md`, `PRD_ADMIN.md`
- 기술 스펙: `SHARED_SPEC.md`
- 분석: `ANALYTICS_QA.md`
- 운영: `RUNBOOK.md`
