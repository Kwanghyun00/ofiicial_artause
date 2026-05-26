# supabase/archive

이 디렉터리는 **배포에서 제외된** SQL 파일을 보관한다.

## 규칙

- 이 디렉터리의 파일은 Supabase 마이그레이션 실행 경로(`supabase/migrations/`)가 아니다.
- **절대 `supabase db push` 또는 마이그레이션 파이프라인에서 이 경로를 가리키지 않는다.**

## 파일 목록

| 파일 | 설명 | 상태 |
|---|---|---|
| `combined_migration.sql` | 전체 스키마 스냅샷 (배포 입력 금지) | 참조 전용 보관 |
| `20260406000000_drop_legacy_tables.sql` | 레거시 테이블 DROP (2026-04-06 실행 예정) | 모니터링 대기 중 |

## 레거시 DROP 파일 실행 방법

2주 모니터링(~2026-03-20) 완료 후:

```bash
# 1. migrations 디렉터리로 이동
mv supabase/archive/20260406000000_drop_legacy_tables.sql \
   supabase/migrations/20260406000000_drop_legacy_tables.sql

# 2. 마이그레이션 적용
npx supabase db push

# 3. 타입 재생성
npx supabase gen types typescript --project-id <project-id> \
  > src/lib/supabase/types.ts
```

**전제 조건 확인 후 실행할 것**:
- [ ] 2주 이상 앱 오류 없음 확인 (Sentry / 로그)
- [ ] `audit_logs`에서 레거시 테이블 접근 시도 없음 확인
- [ ] `user_penalties.entry_id` / `campaign_id` NULL 처리 계획 검토
