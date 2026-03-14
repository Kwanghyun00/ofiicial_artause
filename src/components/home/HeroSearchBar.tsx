"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

export function HeroSearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    trackEvent("home_click_search", { query: q })
    router.push(q ? `/shows?q=${encodeURIComponent(q)}` : "/shows")
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="공연명·장르·지역으로 검색"
          className="h-12 w-full rounded-full border-2 border-border bg-background/60 pl-12 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary focus:outline-none sm:h-14 sm:text-base"
        />
      </div>
      <button
        type="submit"
        className="h-12 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90 sm:h-14 sm:px-8 sm:text-base"
      >
        검색
      </button>
    </form>
  )
}
