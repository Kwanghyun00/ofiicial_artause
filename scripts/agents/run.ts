#!/usr/bin/env tsx
/**
 * Artause 멀티 에이전트 오케스트레이터 실행 진입점
 *
 * 사용법:
 *   npm run agents              # 오늘 플랜 전체 실행
 *   npm run agents -- --dry-run  # 계획만 출력 (파일 수정 없음)
 *   npm run agents -- --skip-review   # 리뷰어 단계 건너뜀
 *   npm run agents -- --max-tasks 2   # 최대 2개 태스크만 처리
 *   npm run agents -- --status        # 오늘 플랜 현황만 출력
 */

import { runOrchestrator } from './orchestrator.js'
import { getTodayPlan, printPlanSummary } from './plan.js'

const args = process.argv.slice(2)

const dryRun    = args.includes('--dry-run')
const skipReview = args.includes('--skip-review')
const statusOnly = args.includes('--status')
const maxTasksIdx = args.indexOf('--max-tasks')
const maxTasks = maxTasksIdx !== -1 ? parseInt(args[maxTasksIdx + 1] ?? '999', 10) : undefined

if (statusOnly) {
  const plan = getTodayPlan()
  if (plan) {
    printPlanSummary(plan)
  } else {
    console.log('플랜 데이터를 읽을 수 없습니다.')
  }
  process.exit(0)
}

runOrchestrator({ dryRun, skipReview, maxTasks }).catch((err) => {
  console.error('\n❌ 오케스트레이터 오류:', err)
  process.exit(1)
})
