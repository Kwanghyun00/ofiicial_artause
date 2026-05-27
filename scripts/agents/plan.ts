import fs from 'fs'
import path from 'path'

const PLAN_PATH = path.join(process.cwd(), '.claude', 'artause-plan.md')

export interface Task {
  text: string
  completed: boolean
  lineIndex: number
}

export interface DayPlan {
  week: number
  day: number
  dayName: string
  title: string
  tasks: Task[]
}

// 플랜 전체를 파싱해서 모든 DayPlan 반환
function parseAllDays(lines: string[]): DayPlan[] {
  const DAY_NAMES = ['', '월', '화', '수', '목', '금']
  const days: DayPlan[] = []

  let currentWeek = 0

  for (let i = 0; i < lines.length; i++) {
    const weekMatch = lines[i].match(/^### Week (\d+)/)
    if (weekMatch) {
      currentWeek = parseInt(weekMatch[1], 10)
      continue
    }

    const dayMatch = lines[i].match(/^#### Day (\d+)/)
    if (dayMatch && currentWeek > 0) {
      const dayNum = parseInt(dayMatch[1], 10)
      const dayTitle = lines[i]
        .replace(`#### Day ${dayNum}`, '')
        .replace(/[()월화수목금]/g, '')
        .replace('—', '')
        .trim()

      const tasks: Task[] = []
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].startsWith('####') || lines[j].startsWith('###')) break

        const unchecked = lines[j].match(/^- \[ \] (.+)/)
        const checked   = lines[j].match(/^- \[x\] (.+)/i)

        if (unchecked) tasks.push({ text: unchecked[1].trim(), completed: false, lineIndex: j })
        else if (checked) tasks.push({ text: checked[1].trim(), completed: true, lineIndex: j })
      }

      days.push({
        week: currentWeek,
        day: dayNum,
        dayName: DAY_NAMES[dayNum] ?? '',
        title: dayTitle,
        tasks,
      })
    }
  }

  return days
}

// 미완료 태스크가 있는 첫 번째 Day를 반환 (날짜 기반 아님 — 진행도 기반)
export function getTodayPlan(): DayPlan | null {
  if (!fs.existsSync(PLAN_PATH)) {
    console.error('artause-plan.md 파일을 찾을 수 없습니다.')
    return null
  }

  const content = fs.readFileSync(PLAN_PATH, 'utf-8')
  const lines = content.split('\n')
  const allDays = parseAllDays(lines)

  // 미완료 태스크가 하나라도 있는 첫 번째 Day 선택
  const nextDay = allDays.find((d) => d.tasks.some((t) => !t.completed))

  if (!nextDay) {
    console.log('모든 플랜이 완료됐습니다! 🎉')
    return null
  }

  return nextDay
}

// 특정 태스크를 완료(✅)로 마킹
export function markTaskComplete(lineIndex: number): void {
  const content = fs.readFileSync(PLAN_PATH, 'utf-8')
  const lines = content.split('\n')

  const line = lines[lineIndex]
  if (line?.includes('- [ ]')) {
    lines[lineIndex] = line.replace('- [ ]', '- [x]')
    fs.writeFileSync(PLAN_PATH, lines.join('\n'), 'utf-8')
  }
}

// 여러 태스크를 한 번에 완료로 마킹
export function markTasksComplete(lineIndices: number[]): void {
  const content = fs.readFileSync(PLAN_PATH, 'utf-8')
  const lines = content.split('\n')

  for (const idx of lineIndices) {
    if (lines[idx]?.includes('- [ ]')) {
      lines[idx] = lines[idx].replace('- [ ]', '- [x]')
    }
  }

  fs.writeFileSync(PLAN_PATH, lines.join('\n'), 'utf-8')
}

// 오늘 플랜 요약 출력
export function printPlanSummary(plan: DayPlan): void {
  const total = plan.tasks.length
  const done = plan.tasks.filter((t) => t.completed).length
  const pending = plan.tasks.filter((t) => !t.completed)

  console.log(`\n📅 Week ${plan.week} · Day ${plan.day} (${plan.dayName}) — ${plan.title}`)
  console.log(`   진행도: ${done}/${total} 완료`)

  if (pending.length > 0) {
    console.log(`\n   미완료 태스크:`)
    pending.forEach((t, i) => console.log(`   ${i + 1}. ${t.text}`))
  } else {
    console.log(`\n   오늘 모든 태스크 완료! 🎉`)
  }
  console.log()
}
