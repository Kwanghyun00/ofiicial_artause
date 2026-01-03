import { Megaphone, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export function AnnouncementBar() {
  return (
    <div className="bg-primary/10 border-b border-primary/20 text-sm">
      <div className="container mx-auto px-4 md:px-6 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Megaphone className="h-4 w-4" />
          </span>
          <div className="space-y-0.5">
            <p className="font-semibold">
              2025 S/S 문화 초청 프로그램이 오픈됐어요.
              <span className="ml-1 font-normal text-muted-foreground">신규 기획 18개 · 도시 6곳 확대</span>
            </p>
            <p className="text-xs text-muted-foreground">아트하우스 멤버라면 사전 신청 기간에 우선 초대됩니다.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Badge variant="secondary" className="rounded-full bg-white text-primary shadow">
            만족도 4.9 / 5.0
          </Badge>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10"
          >
            브리핑 보기
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
