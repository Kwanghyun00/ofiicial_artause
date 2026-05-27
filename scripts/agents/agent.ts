import { execSync, spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { executeTool } from './tools.js'
import type { AgentRole } from './personas.js'
import { PERSONAS } from './personas.js'

const ROOT = path.resolve(process.cwd())
const MAX_ITERATIONS = 15

// 콘솔 색상
const COLORS: Record<AgentRole | 'orchestrator', string> = {
  planner:      '\x1b[34m',
  frontend:     '\x1b[32m',
  backend:      '\x1b[33m',
  reviewer:     '\x1b[35m',
  orchestrator: '\x1b[36m',
}
const RESET = '\x1b[0m'
const BOLD  = '\x1b[1m'

export function log(role: AgentRole | 'orchestrator', message: string): void {
  const color = COLORS[role] ?? ''
  const label = role.toUpperCase().padEnd(12)
  console.log(`${color}${BOLD}[${label}]${RESET} ${message}`)
}

export interface AgentResult {
  role: AgentRole
  output: string
  toolCallCount: number
  filesModified: string[]
}

// ─── CLI 모드 (기본값, API 키 불필요) ────────────────────────────────────────
//
// Claude Code CLI를 서브프로세스로 호출해 현재 구독 인증을 그대로 사용합니다.
// 에이전트는 한 번의 호출로 필요한 파일 변경사항을 JSON으로 출력합니다.

interface FileChange {
  path: string
  content: string
}

interface AgentCLIResponse {
  files?: FileChange[]
  summary: string
  read_first?: string[]  // 작업 전 읽어야 할 파일 목록
}

function buildContextFromFiles(filePaths: string[]): string {
  if (filePaths.length === 0) return ''
  const parts: string[] = ['\n=== 관련 파일 컨텍스트 ===']
  for (const filePath of filePaths) {
    const abs = path.join(ROOT, filePath)
    if (fs.existsSync(abs)) {
      try {
        const content = fs.readFileSync(abs, 'utf-8')
        parts.push(`\n--- ${filePath} ---\n${content}`)
      } catch {
        // 읽기 실패 무시
      }
    }
  }
  return parts.join('\n')
}

// 응답 텍스트에서 가장 바깥쪽 JSON 객체를 안전하게 추출
// 단순 정규식 대신 중괄호 균형을 맞춰 파싱해 오탐(false positive)을 방지
export function extractJSON<T>(text: string): T | null {
  // 코드 블록 안의 JSON 먼저 시도
  const codeBlock = text.match(/```(?:json)?\s*\n?([\s\S]+?)\n?```/)
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1]) as T } catch { /* 다음으로 */ }
  }

  // 중괄호 균형을 맞춰 첫 번째 완전한 JSON 객체 추출
  let depth = 0
  let start = -1
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i
      depth++
    } else if (text[i] === '}') {
      depth--
      if (depth === 0 && start !== -1) {
        try { return JSON.parse(text.slice(start, i + 1)) as T } catch { start = -1 }
      }
    }
  }
  return null
}

// .exe 네이티브 바이너리인지 확인 (.cmd는 spawnSync+input 불가)
function isNativeBinary(binPath: string): boolean {
  return binPath.endsWith('.exe') || (!binPath.endsWith('.cmd') && process.platform !== 'win32')
}

// VSCode 확장 폴더에서 anthropic.claude-code 네이티브 바이너리 탐색
function findVSCodeNativeBinary(): string | null {
  if (process.platform !== 'win32') return null
  const userProfile = process.env.USERPROFILE ?? ''
  const extDir = path.join(userProfile, '.vscode', 'extensions')
  if (!fs.existsSync(extDir)) return null
  try {
    const entries = fs.readdirSync(extDir)
    // 최신 버전 우선 (이름 내림차순 정렬)
    const claudeExts = entries.filter((e) => e.startsWith('anthropic.claude-code-')).sort().reverse()
    for (const ext of claudeExts) {
      const candidate = path.join(extDir, ext, 'resources', 'native-binary', 'claude.exe')
      if (fs.existsSync(candidate)) return candidate
    }
  } catch { /* 읽기 실패 무시 */ }
  return null
}

// claude 바이너리 경로를 찾는 함수 — 항상 네이티브 .exe 우선
function findClaudeBinary(): string {
  // 0. VSCode 확장 실행 중: CLAUDE_CODE_EXECPATH = 네이티브 바이너리
  const execPath = process.env.CLAUDE_CODE_EXECPATH
  if (execPath && fs.existsSync(execPath)) return execPath

  // 1. VSCode 확장 폴더에서 네이티브 바이너리 탐색 (외부 터미널에서 실행 시)
  const vscodeNative = findVSCodeNativeBinary()
  if (vscodeNative) return vscodeNative

  // 2. Windows 데스크탑 앱 설치 경로
  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA ?? ''
    const appData = process.env.APPDATA ?? ''
    const candidates = [
      path.join(localAppData, 'AnthropicClaude', 'claude.exe'),
      path.join(localAppData, 'Programs', 'claude', 'claude.exe'),
      path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'claude.exe'),
      // .cmd는 마지막 수단 (spawnSync+input 불가 — 별도 처리 필요)
      path.join(appData, 'npm', 'claude.cmd'),
    ]
    for (const c of candidates) {
      if (fs.existsSync(c)) return c
    }
  }

  // 3. macOS / Linux
  if (process.platform !== 'win32') {
    const candidates = [
      '/usr/local/bin/claude',
      `${process.env.HOME}/.local/bin/claude`,
      `${process.env.HOME}/.npm-global/bin/claude`,
    ]
    for (const c of candidates) {
      if (fs.existsSync(c)) return c
    }
  }

  throw new Error(
    'claude 바이너리를 찾을 수 없습니다.\n' +
    '  A) Claude Code VSCode 확장이 설치되어 있는지 확인하세요.\n' +
    '  B) API 키 방식: .env.local 에 ANTHROPIC_API_KEY=sk-ant-... 추가 시 SDK 모드로 전환됩니다.',
  )
}

// CLAUDECODE 환경변수를 제거한 env 객체 (중첩 호출 허용)
function buildChildEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env }
  delete env['CLAUDECODE']
  return env
}

// 네이티브 .exe: spawnSync + stdin pipe
// .cmd 폴백: 임시 파일 + execSync shell redirect
export function callClaudeCLI(prompt: string): string {
  const claudeBin = findClaudeBinary()

  if (isNativeBinary(claudeBin)) {
    const result = spawnSync(
      claudeBin,
      ['-p'],
      {
        input: prompt,
        cwd: ROOT,
        encoding: 'utf-8',
        timeout: 300_000,
        maxBuffer: 10 * 1024 * 1024,
        env: buildChildEnv(),
      },
    )
    if (result.error) throw new Error(`claude 실행 실패: ${result.error.message}`)
    const stdout = (result.stdout ?? '').trim()
    const stderr = (result.stderr ?? '').trim()
    if (result.status === 0 && stdout) return stdout
    if (stdout && stdout.length > 10 && stdout !== 'Execution error') return stdout
    const detail = (stderr || stdout || '알 수 없는 오류').slice(0, 300)
    throw new Error(`claude CLI 오류 (exit ${result.status ?? '?'}): ${detail}`)
  }

  // .cmd 폴백: 임시 파일 + cmd.exe shell redirect
  const tmpPath = path.join(ROOT, '.claude', '.tmp_agent_prompt.txt')
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true })
  fs.writeFileSync(tmpPath, prompt, 'utf-8')
  try {
    const output = execSync(
      `"${claudeBin}" --print < "${tmpPath}"`,
      {
        cwd: ROOT,
        encoding: 'utf-8',
        timeout: 300_000,
        maxBuffer: 10 * 1024 * 1024,
        shell: 'cmd.exe',
        env: buildChildEnv(),
      },
    )
    return output.trim()
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string; status?: number }
    if (e.stdout && e.stdout.trim().length > 10) return e.stdout.trim()
    const detail = (e.stderr ?? e.message ?? '알 수 없는 오류').slice(0, 300)
    throw new Error(`claude CLI 오류 (exit ${e.status ?? '?'}): ${detail}`)
  } finally {
    fs.rmSync(tmpPath, { force: true })
  }
}

async function runAgentCLI(role: AgentRole, userMessage: string): Promise<AgentResult> {
  const persona = PERSONAS[role]
  log(role, '작업 시작 (CLI 모드)...')

  // 1단계: 어떤 파일을 읽어야 하는지 먼저 파악
  const scanPrompt = `${persona}

다음 태스크를 수행하기 위해 먼저 읽어야 할 파일 목록을 JSON으로 알려주세요.
파일은 최대 5개까지만 지정하세요.

태스크: ${userMessage}

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{ "read_first": ["src/app/page.tsx", "src/lib/supabase/queries.ts"] }`

  let filesToRead: string[] = []
  try {
    const scanResult = callClaudeCLI(scanPrompt)
    const parsed = extractJSON<{ read_first?: string[] }>(scanResult)
    filesToRead = parsed?.read_first ?? []
  } catch {
    // 파일 목록 파악 실패해도 계속 진행
  }

  if (filesToRead.length > 0) {
    log(role, `📂 컨텍스트 파일 로드: ${filesToRead.join(', ')}`)
  }

  // 2단계: 파일 컨텍스트와 함께 실제 구현 요청
  const context = buildContextFromFiles(filesToRead)
  const implementPrompt = `${persona}
${context}

=== 태스크 ===
${userMessage}

위 태스크를 완전히 구현하세요.
반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):

{
  "files": [
    {
      "path": "src/app/sitemap.ts",
      "content": "파일 전체 내용을 여기에 작성"
    }
  ],
  "summary": "무엇을 했는지 한두 문장으로 설명"
}

수정할 파일이 없으면 "files": [] 로 응답하세요.`

  let output = ''
  const filesModified: string[] = []

  try {
    log(role, '구현 중...')
    const result = callClaudeCLI(implementPrompt)
    output = result

    // JSON 파싱해서 파일 작성
    const parsed = extractJSON<AgentCLIResponse>(result)
    if (parsed) {
      if (parsed.files && parsed.files.length > 0) {
        for (const file of parsed.files) {
          const toolResult = executeTool('write_file', { path: file.path, content: file.content })
          if (!toolResult.startsWith('오류')) {
            filesModified.push(file.path)
            log(role, `📝 ${file.path}`)
          } else {
            log(role, `⚠️  ${toolResult}`)
          }
        }
      }
      output = parsed.summary ?? result
      log(role, `✅ 완료: ${parsed.summary ?? ''}`)
    } else {
      log(role, '⚠️  JSON 파싱 실패 — 응답을 텍스트로 처리')
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    log(role, `❌ 오류: ${msg}`)
    output = msg
  }

  return { role, output, toolCallCount: filesToRead.length > 0 ? 2 : 1, filesModified }
}

// ─── SDK 모드 (--use-sdk 플래그, ANTHROPIC_API_KEY 필요) ────────────────────

async function runAgentSDK(role: AgentRole, userMessage: string): Promise<AgentResult> {
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  const { TOOL_DEFINITIONS } = await import('./tools.js')

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다.')

  const client = new Anthropic({ apiKey })
  const systemPrompt = PERSONAS[role]
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }]

  let iterations = 0
  let totalToolCalls = 0
  const filesModified: string[] = []

  log(role, '작업 시작 (SDK 모드)...')

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8096,
      system: systemPrompt,
      tools: TOOL_DEFINITIONS,
      messages,
    })

    const textBlocks = response.content.filter((b) => b.type === 'text')
    if (textBlocks.length > 0) {
      const preview = textBlocks[0].text.slice(0, 120).replace(/\n/g, ' ')
      log(role, `💬 ${preview}${textBlocks[0].text.length > 120 ? '...' : ''}`)
    }

    if (response.stop_reason === 'end_turn') {
      const finalText = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
      log(role, `✅ 완료 (${totalToolCalls}번 도구 사용)`)
      return { role, output: finalText, toolCallCount: totalToolCalls, filesModified }
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
      )
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const toolUse of toolUseBlocks) {
        totalToolCalls++
        log(role, `🔧 ${toolUse.name}(${JSON.stringify(toolUse.input).slice(0, 80)})`)
        const result = executeTool(toolUse.name, toolUse.input as Record<string, unknown>)
        if (toolUse.name === 'write_file') {
          const p = (toolUse.input as { path?: string }).path
          if (p && !filesModified.includes(p)) filesModified.push(p)
        }
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: result })
      }

      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: toolResults })
    }
  }

  return { role, output: '최대 반복 횟수 도달', toolCallCount: totalToolCalls, filesModified }
}

// ─── 외부에서 사용하는 통합 인터페이스 ────────────────────────────────────────

export async function runAgent(
  _client: unknown,        // CLI 모드에선 미사용 (하위 호환)
  role: AgentRole,
  userMessage: string,
): Promise<AgentResult> {
  // ANTHROPIC_API_KEY 있으면 SDK, 없으면 CLI
  const useSDK = Boolean(process.env.ANTHROPIC_API_KEY) ||
    process.argv.includes('--use-sdk')

  return useSDK ? runAgentSDK(role, userMessage) : runAgentCLI(role, userMessage)
}

// orchestrator.ts 호환용 (CLI 모드는 client 객체 불필요)
export function createClient(): unknown {
  return null
}
