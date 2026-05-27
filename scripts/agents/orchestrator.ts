import type Anthropic from '@anthropic-ai/sdk'
import { runAgent, callClaudeCLI, log, extractJSON, type AgentResult } from './agent.js'
import { getTodayPlan, markTasksComplete, printPlanSummary, type Task } from './plan.js'

// Planner가 반환하는 태스크 배분 결과
interface Assignment {
  taskText: string
  agent: 'frontend' | 'backend' | 'both'
  instructions: string
  order: number
}

interface PlannerOutput {
  assignments: Assignment[]
  summary: string
}

// ─── 1단계: Planner가 오늘 태스크를 분석하고 에이전트에게 배분 ─────────────

async function runPlanner(
  _client: Anthropic,
  tasks: Task[],
): Promise<PlannerOutput> {
  const taskList = tasks
    .filter((t) => !t.completed)
    .map((t, i) => `${i + 1}. ${t.text}`)
    .join('\n')

  // Planner는 파일 작성 없이 JSON 계획만 반환하면 되므로 callClaudeCLI 직접 사용
  const prompt = `당신은 Artause 프로젝트의 PM 에이전트입니다.
아래 태스크를 분석해서 frontend / backend / both 중 하나로 분류하고,
각 에이전트에게 전달할 구체적인 지시를 작성하세요.
파일을 직접 만들거나 수정하지 마세요.

태스크 목록:
${taskList}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요:
{
  "assignments": [
    { "taskText": "태스크 원문", "agent": "backend", "instructions": "상세 지시", "order": 1 }
  ],
  "summary": "오늘 작업 요약"
}`

  log('orchestrator', 'Planner 실행 중...')
  const raw = callClaudeCLI(prompt)
  const result = { output: raw }

  try {
    const parsed = extractJSON<PlannerOutput>(result.output)
    if (!parsed) throw new Error('JSON not found')
    log('orchestrator', `Planner 완료 — ${parsed.assignments.length}개 태스크 배분`)
    return parsed
  } catch {
    // JSON 파싱 실패 시 단순 처리
    log('orchestrator', '⚠️  Planner 응답 파싱 실패 — 전체를 backend로 처리')
    return {
      assignments: tasks
        .filter((t) => !t.completed)
        .map((t, i) => ({
          taskText: t.text,
          agent: 'both' as const,
          instructions: t.text,
          order: i + 1,
        })),
      summary: result.output,
    }
  }
}

// ─── 2단계: Frontend / Backend 에이전트 실행 ──────────────────────────────

async function runImplementationAgents(
  client: Anthropic,
  assignments: Assignment[],
  dryRun: boolean,
): Promise<AgentResult[]> {
  const results: AgentResult[] = []
  const sorted = [...assignments].sort((a, b) => a.order - b.order)

  for (const assignment of sorted) {
    log('orchestrator', `\n▶  태스크: ${assignment.taskText}`)

    if (dryRun) {
      log('orchestrator', `[DRY-RUN] 실제 실행 건너뜀`)
      results.push({
        role: assignment.agent === 'frontend' ? 'frontend' : 'backend',
        output: `[DRY-RUN] ${assignment.instructions}`,
        toolCallCount: 0,
        filesModified: [],
      })
      continue
    }

    if (assignment.agent === 'both') {
      // backend 먼저, 그 결과를 frontend에 전달
      const backendResult = await runAgent(
        client,
        'backend',
        `다음 태스크를 구현해주세요:\n\n${assignment.instructions}`,
      )
      results.push(backendResult)

      const frontendResult = await runAgent(
        client,
        'frontend',
        `다음 태스크를 구현해주세요.\n\n${assignment.instructions}\n\n백엔드 에이전트가 이미 다음 작업을 완료했습니다:\n${backendResult.output}`,
      )
      results.push(frontendResult)
    } else {
      const result = await runAgent(
        client,
        assignment.agent,
        `다음 태스크를 구현해주세요:\n\n${assignment.instructions}`,
      )
      results.push(result)
    }
  }

  return results
}

// ─── 3단계: Reviewer가 전체 결과 검토 ────────────────────────────────────

async function runReviewer(
  client: Anthropic,
  results: AgentResult[],
  round: number,
): Promise<{ approved: boolean; feedback: string }> {
  const allModified = [...new Set(results.flatMap((r) => r.filesModified))]

  const summary = results
    .map(
      (r) =>
        `[${r.role.toUpperCase()}]\n${r.output}\n수정 파일: ${r.filesModified.join(', ') || '없음'}`,
    )
    .join('\n\n---\n\n')

  const roundNote = round > 1 ? `\n(수정 라운드 ${round} — 이전 피드백 반영 후 재검토)` : ''

  const message = `다음 에이전트들이 작업을 완료했습니다. 코드를 검토해주세요.${roundNote}

=== 작업 요약 ===
${summary}

=== 수정된 파일 목록 ===
${allModified.join('\n') || '없음'}

각 파일을 read_file 도구로 읽어 실제 코드를 검토하세요.
검토 후 반드시 응답 맨 마지막 줄에 아래 둘 중 하나를 정확히 출력하세요 (다른 텍스트 없이):
  VERDICT: APPROVED
  VERDICT: CHANGES_REQUIRED
CHANGES_REQUIRED 시 반드시 구체적인 수정 항목을 파일명과 함께 명시하세요.`

  const result = await runAgent(client, 'reviewer', message)

  // "VERDICT: APPROVED" 또는 긍정 한국어 표현 모두 승인으로 처리
  const approvedKeywords = [
    'VERDICT: APPROVED',
    '수정 사항 없음', '수정사항 없음',
    '올바르게 완성', '정상적으로 구현', '올바르게 구현',
    '문제 없음', '문제없음',
  ]
  const approved = approvedKeywords.some((kw) => result.output.includes(kw))
  log('orchestrator', approved ? '✅ 리뷰어 승인' : '🔄 리뷰어 수정 요청')

  return { approved, feedback: result.output }
}

// ─── 리뷰어 피드백 기반 수정 에이전트 실행 ───────────────────────────────

async function runFixAgents(
  client: Anthropic,
  feedback: string,
  previousResults: AgentResult[],
): Promise<AgentResult[]> {
  const allModified = [...new Set(previousResults.flatMap((r) => r.filesModified))]

  // 피드백에서 frontend/backend 힌트 감지
  const needsFrontend = /tsx|jsx|component|ui|화면|레이아웃|스타일|frontend/i.test(feedback)
  const needsBackend  = /ts(?!x)|actions?|api|supabase|쿼리|server|backend|db|데이터베이스/i.test(feedback)
  const role: 'frontend' | 'backend' | 'both' =
    needsFrontend && needsBackend ? 'both'
    : needsFrontend ? 'frontend'
    : 'backend'

  const fixMessage = `리뷰어가 다음 피드백을 남겼습니다. 지적된 문제를 모두 수정해주세요.

=== 리뷰어 피드백 ===
${feedback}

=== 수정이 필요한 파일 ===
${allModified.join('\n') || '없음'}

피드백의 각 항목을 빠짐없이 반영하고, 수정한 파일 전체를 JSON으로 출력하세요.`

  const results: AgentResult[] = []

  if (role === 'both') {
    const backendFix = await runAgent(client, 'backend', fixMessage)
    results.push(backendFix)
    const frontendFix = await runAgent(
      client,
      'frontend',
      `${fixMessage}\n\n백엔드가 이미 수정 완료:\n${backendFix.output}`,
    )
    results.push(frontendFix)
  } else {
    results.push(await runAgent(client, role, fixMessage))
  }

  return results
}

// ─── 메인 오케스트레이터 ──────────────────────────────────────────────────

const MAX_FIX_ROUNDS = 3

export interface OrchestratorOptions {
  dryRun?: boolean     // true면 실제 파일 수정 없이 계획만 출력
  skipReview?: boolean // true면 리뷰어 단계 건너뜀
  maxTasks?: number    // 오늘 처리할 최대 태스크 수 (기본: 플랜의 Day 전체)
}

export async function runOrchestrator(options: OrchestratorOptions = {}): Promise<void> {
  const { dryRun = false, skipReview = false, maxTasks } = options

  console.log('\n' + '═'.repeat(60))
  console.log('  🎭 Artause 멀티 에이전트 오케스트레이터')
  console.log('═'.repeat(60))
  if (dryRun) console.log('  ⚠️  DRY-RUN 모드 — 실제 파일 수정 없음')
  console.log()

  const client = (await import('./agent.js')).createClient()

  // ── 플랜 읽기
  const plan = getTodayPlan()
  if (!plan) {
    console.log('오늘 처리할 플랜이 없습니다.')
    return
  }

  printPlanSummary(plan)

  const pendingTasks = plan.tasks.filter((t) => !t.completed)
  if (pendingTasks.length === 0) {
    log('orchestrator', '오늘 미완료 태스크가 없습니다. 내일 플랜을 확인하세요.')
    return
  }

  // maxTasks 제한 적용
  const tasksToProcess = maxTasks ? pendingTasks.slice(0, maxTasks) : pendingTasks
  log('orchestrator', `처리 예정: ${tasksToProcess.length}개 태스크`)

  // ── 1단계: Planner
  console.log('\n' + '─'.repeat(60))
  log('orchestrator', '1단계 — Planner: 태스크 분석 및 배분')
  const plannerOutput = await runPlanner(client, tasksToProcess)
  console.log(`\n  📋 ${plannerOutput.summary}`)

  // ── 2단계: 구현 에이전트들
  console.log('\n' + '─'.repeat(60))
  log('orchestrator', '2단계 — 구현 에이전트 실행')
  let implementationResults = await runImplementationAgents(
    client,
    plannerOutput.assignments,
    dryRun,
  )

  const allModified = [...new Set(implementationResults.flatMap((r) => r.filesModified))]
  if (allModified.length > 0) {
    log('orchestrator', `수정된 파일 (${allModified.length}개):`)
    allModified.forEach((f) => console.log(`   · ${f}`))
  }

  // ── 3단계: 리뷰 → 수정 루프 (최대 MAX_FIX_ROUNDS회)
  let approved = true
  if (!skipReview && !dryRun && implementationResults.some((r) => r.filesModified.length > 0)) {
    for (let round = 1; round <= MAX_FIX_ROUNDS; round++) {
      console.log('\n' + '─'.repeat(60))
      log('orchestrator', `3단계 — Reviewer: 코드 검토 (라운드 ${round}/${MAX_FIX_ROUNDS})`)

      const reviewResult = await runReviewer(client, implementationResults, round)
      approved = reviewResult.approved

      if (approved) break

      // 마지막 라운드에서도 미승인이면 중단
      if (round === MAX_FIX_ROUNDS) {
        console.log('\n  📝 최종 리뷰어 피드백:')
        console.log(reviewResult.feedback.split('\n').map((l) => `  ${l}`).join('\n'))
        break
      }

      // 피드백 출력 후 수정 에이전트 실행
      console.log('\n  📝 리뷰어 피드백:')
      console.log(reviewResult.feedback.split('\n').map((l) => `  ${l}`).join('\n'))

      console.log('\n' + '─'.repeat(60))
      log('orchestrator', `수정 에이전트 실행 중... (라운드 ${round} → ${round + 1})`)
      const fixResults = await runFixAgents(client, reviewResult.feedback, implementationResults)

      // 수정 결과를 누적 (이전 결과에 merge)
      implementationResults = [...implementationResults, ...fixResults]

      const fixedFiles = [...new Set(fixResults.flatMap((r) => r.filesModified))]
      if (fixedFiles.length > 0) {
        log('orchestrator', `수정된 파일 (${fixedFiles.length}개):`)
        fixedFiles.forEach((f) => console.log(`   · ${f}`))
      }
    }
  }

  // ── 완료 처리
  console.log('\n' + '─'.repeat(60))
  if (approved && !dryRun) {
    const completedIndices = tasksToProcess.map((t) => t.lineIndex)
    markTasksComplete(completedIndices)
    log('orchestrator', `✅ ${tasksToProcess.length}개 태스크 완료 — artause-plan.md 업데이트됨`)
  } else if (dryRun) {
    log('orchestrator', `[DRY-RUN] 완료 — 실제 변경사항 없음`)
  } else {
    log('orchestrator', `⚠️  ${MAX_FIX_ROUNDS}라운드 후에도 미승인 — 위 피드백을 수동으로 확인해주세요.`)
  }

  console.log('\n' + '═'.repeat(60) + '\n')
}
