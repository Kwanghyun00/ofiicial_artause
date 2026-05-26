import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { Bookmark, CalendarDays, LogOut, MapPin } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/config"
import { getMyBookmarks } from "./actions"
import { signOut } from "./login/actions"
import { getPosterFallback } from "@/constants/posters"

export const metadata: Metadata = {
  title: "내 페이지",
  description: "북마크한 공연과 초대권 응모 내역을 확인하세요.",
}

export default async function MyPage() {
  /* ── 인증 체크 ── */
  if (!isSupabaseConfigured) {
    redirect("/my/login")
  }

  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/my/login")
  }

  const bookmarks = await getMyBookmarks()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 space-y-12">
      {/* 프로필 헤더 */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">My Page</p>
          <h1 className="text-2xl font-bold">안녕하세요 👋</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" />
            로그아웃
          </button>
        </form>
      </header>

      {/* 북마크 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">북마크한 공연</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {bookmarks.length}
          </span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border bg-muted/30 px-6 py-12 text-center space-y-3">
            <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">아직 북마크한 공연이 없습니다.</p>
            <Link
              href="/shows"
              className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              공연 탐색하기
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {bookmarks.map((bm) => {
              const perf = Array.isArray(bm.performances) ? bm.performances[0] : bm.performances
              if (!perf) return null

              const poster = perf.poster_url ?? getPosterFallback(0)
              const period =
                perf.period_start
                  ? `${perf.period_start.slice(0, 10).replace(/-/g, ".")}${perf.period_end ? ` ~ ${perf.period_end.slice(0, 10).replace(/-/g, ".")}` : ""}`
                  : null

              return (
                <li key={bm.id}>
                  <Link
                    href={`/shows/${perf.slug}`}
                    className="group flex gap-4 rounded-2xl border bg-card p-4 transition hover:shadow-md"
                  >
                    <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={poster}
                        alt={perf.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold leading-snug">{perf.title}</p>
                      {perf.category && (
                        <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {perf.category}
                        </span>
                      )}
                      {period && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3 shrink-0" />
                          {period}
                        </p>
                      )}
                      {perf.venue && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {perf.venue}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* 응모 내역 — Phase 3에서 채울 예정 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">응모 내역</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            준비 중
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          응모 내역 조회는 곧 지원될 예정입니다.
        </p>
      </section>
    </div>
  )
}
