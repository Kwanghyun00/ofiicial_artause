import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import type Anthropic from '@anthropic-ai/sdk'

const ROOT = path.resolve(process.cwd())

// 쓰기 허용 경로 (보안: 이 경로 외엔 write 불가)
const WRITE_ALLOW = ['src/', 'supabase/migrations/', '.claude/artause-plan.md', 'scripts/']
// 실행 허용 명령어 prefix
const CMD_ALLOW = ['npm run lint', 'npm run build', 'npm test', 'git diff', 'git status', 'npx tsc']

// ─── Tool 스키마 정의 (Claude API 형식) ────────────────────────────────────

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: 'read_file',
    description: '프로젝트 내 파일 내용 읽기',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '프로젝트 루트 기준 상대 경로 (예: src/app/page.tsx)' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: '파일 생성 또는 덮어쓰기 (src/, supabase/migrations/, artause-plan.md만 허용)',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '프로젝트 루트 기준 상대 경로' },
        content: { type: 'string', description: '파일에 쓸 전체 내용' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'search_code',
    description: '코드베이스에서 텍스트/패턴 검색 (ripgrep 스타일)',
    input_schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: '검색할 텍스트 또는 정규식' },
        directory: { type: 'string', description: '검색 범위 디렉토리 (기본: src/)' },
        file_pattern: { type: 'string', description: '파일 확장자 필터 (예: *.tsx, *.ts)' },
      },
      required: ['pattern'],
    },
  },
  {
    name: 'list_files',
    description: '특정 디렉토리의 파일 목록 조회',
    input_schema: {
      type: 'object',
      properties: {
        directory: { type: 'string', description: '조회할 디렉토리 경로 (예: src/components/)' },
        recursive: { type: 'boolean', description: '하위 디렉토리 포함 여부 (기본: false)' },
      },
      required: ['directory'],
    },
  },
  {
    name: 'run_command',
    description: '안전한 명령어 실행 (lint, build, test, git diff/status, tsc만 허용)',
    input_schema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: '실행할 명령어 (npm run lint | npm run build | npm test | git diff | git status | npx tsc)',
        },
      },
      required: ['command'],
    },
  },
]

// ─── Tool 실행 구현 ────────────────────────────────────────────────────────

export function executeTool(name: string, input: Record<string, unknown>): string {
  try {
    switch (name) {
      case 'read_file':
        return toolReadFile(input.path as string)
      case 'write_file':
        return toolWriteFile(input.path as string, input.content as string)
      case 'search_code':
        return toolSearchCode(
          input.pattern as string,
          (input.directory as string) ?? 'src/',
          input.file_pattern as string | undefined,
        )
      case 'list_files':
        return toolListFiles(input.directory as string, (input.recursive as boolean) ?? false)
      case 'run_command':
        return toolRunCommand(input.command as string)
      default:
        return `오류: 알 수 없는 도구 "${name}"`
    }
  } catch (err) {
    return `오류: ${err instanceof Error ? err.message : String(err)}`
  }
}

function toolReadFile(filePath: string): string {
  const abs = path.join(ROOT, filePath)
  if (!abs.startsWith(ROOT)) return '오류: 프로젝트 외부 경로 접근 불가'
  if (!fs.existsSync(abs)) return `오류: 파일을 찾을 수 없음 — ${filePath}`
  const content = fs.readFileSync(abs, 'utf-8')
  const lines = content.split('\n')
  // 라인 번호 붙여서 반환 (에이전트가 위치 파악하기 쉽게)
  return lines.map((l, i) => `${String(i + 1).padStart(4, ' ')} | ${l}`).join('\n')
}

function toolWriteFile(filePath: string, content: string): string {
  const isAllowed = WRITE_ALLOW.some((prefix) => filePath.startsWith(prefix))
  if (!isAllowed) return `오류: 쓰기 차단됨 — ${filePath} (허용 경로: ${WRITE_ALLOW.join(', ')})`

  const abs = path.join(ROOT, filePath)
  if (!abs.startsWith(ROOT)) return '오류: 프로젝트 외부 경로 접근 불가'

  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content, 'utf-8')
  return `완료: ${filePath} 저장됨 (${content.split('\n').length}줄)`
}

function toolSearchCode(pattern: string, directory: string, filePattern?: string): string {
  const absDir = path.join(ROOT, directory)
  if (!absDir.startsWith(ROOT)) return '오류: 프로젝트 외부 경로 접근 불가'

  const results: string[] = []
  const ext = filePattern?.replace('*.', '.') ?? null

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!['node_modules', '.next', '.git', '_archive'].includes(entry.name)) walk(full)
      } else if (!ext || entry.name.endsWith(ext)) {
        try {
          const content = fs.readFileSync(full, 'utf-8')
          const lines = content.split('\n')
          const regex = new RegExp(pattern, 'gi')
          lines.forEach((line, idx) => {
            if (regex.test(line)) {
              const rel = path.relative(ROOT, full)
              results.push(`${rel}:${idx + 1}  ${line.trim()}`)
            }
          })
        } catch {
          // 읽을 수 없는 파일 skip
        }
      }
    }
  }

  walk(absDir)

  if (results.length === 0) return `결과 없음: "${pattern}" in ${directory}`
  if (results.length > 50) return results.slice(0, 50).join('\n') + `\n... (${results.length - 50}개 더 있음)`
  return results.join('\n')
}

function toolListFiles(directory: string, recursive: boolean): string {
  const abs = path.join(ROOT, directory)
  if (!abs.startsWith(ROOT)) return '오류: 프로젝트 외부 경로 접근 불가'
  if (!fs.existsSync(abs)) return `오류: 디렉토리를 찾을 수 없음 — ${directory}`

  const results: string[] = []

  function walk(dir: string, depth = 0) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = path.relative(ROOT, path.join(dir, entry.name))
      results.push(`${'  '.repeat(depth)}${entry.isDirectory() ? '📁' : '📄'} ${rel}`)
      if (recursive && entry.isDirectory() && !['node_modules', '.next', '.git'].includes(entry.name)) {
        walk(path.join(dir, entry.name), depth + 1)
      }
    }
  }

  walk(abs)
  return results.join('\n') || '(빈 디렉토리)'
}

function toolRunCommand(command: string): string {
  const isAllowed = CMD_ALLOW.some((prefix) => command.trim().startsWith(prefix))
  if (!isAllowed) {
    return `오류: 명령어 차단됨 — "${command}"\n허용 명령어: ${CMD_ALLOW.join(' | ')}`
  }

  try {
    const output = execSync(command, {
      cwd: ROOT,
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return output || '(출력 없음 — 명령어 성공)'
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; message?: string }
    return [e.stdout, e.stderr, e.message].filter(Boolean).join('\n').slice(0, 2000)
  }
}
