"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"

type SyncResult = {
  ok: boolean
  synced_at?: string
  list_synced?: number
  detail_synced?: number
  errors?: number
  error?: string
}

export function KopisSyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [result, setResult] = useState<SyncResult | null>(null)

  const handleSync = async () => {
    setStatus("loading")
    setResult(null)
    try {
      const res = await fetch("/api/kopis-sync", { method: "POST" })
      let data: SyncResult
      try {
        data = await res.json()
      } catch {
        // 503 등으로 빈 바디가 오는 경우
        data = {
          ok: false,
          error: res.status === 503
            ? "KOPIS API 키가 Vercel 환경변수에 설정되지 않았습니다 (KOPIS_SERVICE_KEY)"
            : `서버 오류 (HTTP ${res.status})`,
        }
      }
      setResult(data)
      setStatus(data.ok ? "success" : "error")
    } catch (err) {
      setResult({ ok: false, error: String(err) })
      setStatus("error")
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground">KOPIS 공연 데이터 동기화</h3>
          <p className="text-sm text-muted-foreground mt-1">
            매일 오전 6시 KST에 자동 실행됩니다. 수동으로 즉시 동기화할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={status === "loading"}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          {status === "loading" ? "동기화 중..." : "지금 동기화"}
        </button>
      </div>

      {status === "success" && result && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          ✅ 동기화 완료 —
          목록 <strong>{result.list_synced}건</strong>,
          상세 <strong>{result.detail_synced}건</strong>
          {result.errors ? `, 오류 ${result.errors}건` : ""}
          <span className="ml-2 text-emerald-600 text-xs">
            {result.synced_at ? new Date(result.synced_at).toLocaleString("ko-KR") : ""}
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">
          ❌ 동기화 실패 — {result?.error ?? "알 수 없는 오류"}
        </div>
      )}
    </div>
  )
}
