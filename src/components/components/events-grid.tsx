"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, MapPin, Calendar, Users, ArrowUpDown, LayoutGrid, Rows } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const events = [
  {
    id: 1,
    title: "뮤지컬 <드림라이크>",
    subtitle: "서울 초연 10주년 기념",
    location: "블루스퀘어 신한카드홀",
    date: "2025.03.15 - 04.07",
    genre: "뮤지컬",
    applicants: "1,247 / 2,000",
    deadline: "D-3",
    image: "/musical.jpg",
    featured: true,
  },
  {
    id: 2,
    title: "데이비드 호크니 디지털 전",
    subtitle: "Bigger & Closer",
    location: "시티아트룸 서울",
    date: "2025.02.01 - 05.31",
    genre: "전시",
    applicants: "892 / 1,500",
    deadline: "D-5",
    image: "/art-exhibition.png",
    featured: false,
  },
  {
    id: 3,
    title: "연극 <행복을 찾아서>",
    subtitle: "스릴러 심리 드라마",
    location: "대학로 TOM 2관",
    date: "2025.03.01 - 04.28",
    genre: "연극",
    applicants: "543 / 800",
    deadline: "D-1",
    image: "/grand-theater.png",
    featured: false,
  },
  {
    id: 4,
    title: "국립발레단 <백조의 호수>",
    subtitle: "2025 스페셜 갈라",
    location: "예술의전당 오페라극장",
    date: "2025.03.27 - 03.31",
    genre: "무용",
    applicants: "1,456 / 2,000",
    deadline: "오늘 마감",
    image: "/ballet.jpg",
    featured: true,
  },
  {
    id: 5,
    title: "국제 아트페어 미리보기",
    subtitle: "빛과 그림자의 미래",
    location: "코엑스 A홀",
    date: "2025.02.01 - 04.30",
    genre: "전시",
    applicants: "723 / 1,000",
    deadline: "D-7",
    image: "/art-exhibition.png",
    featured: false,
  },
  {
    id: 6,
    title: "서울시향 정기연주회",
    subtitle: "베토벤 교향곡 시리즈",
    location: "롯데콘서트홀",
    date: "2025.03.20 (목) 19:30",
    genre: "클래식",
    applicants: "234 / 500",
    deadline: "D-10",
    image: "/musical.jpg",
    featured: false,
  },
]

export function EventsGrid() {
  const [sortBy, setSortBy] = useState("popular")
  const [savedEvents, setSavedEvents] = useState<number[]>([])
  const [displayCount, setDisplayCount] = useState(6)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const toggleSave = (id: number) => {
    setSavedEvents((prev) => (prev.includes(id) ? prev.filter((eventId) => eventId !== id) : [...prev, id]))
  }

  const sortedEvents = useMemo(() => {
    const sorted = [...events]

    switch (sortBy) {
      case "latest":
        return sorted.reverse()
      case "deadline":
        return sorted.sort((a, b) => {
          const parseDeadline = (deadline: string) => {
            if (deadline === "오늘 마감") return 0
            if (deadline.startsWith("D-")) return Number.parseInt(deadline.substring(2))
            return 999
          }
          return parseDeadline(a.deadline) - parseDeadline(b.deadline)
        })
      case "match":
        return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
      case "popular":
      default:
        return sorted.sort((a, b) => {
          const getApplicants = (str: string) => Number.parseInt(str.split(" / ")[0].replace(/,/g, ""))
          return getApplicants(b.applicants) - getApplicants(a.applicants)
        })
    }
  }, [sortBy])

  const displayedEvents = sortedEvents.slice(0, displayCount)
  const hasMore = displayCount < sortedEvents.length

  const loadMore = () => {
    setDisplayCount((prev) => prev + 6)
  }

  const parseApplicants = (value: string) => {
    const [current, total] = value.split(" / ").map((item) => Number.parseInt(item.replace(/,/g, "")))
    const ratio = Math.min(100, Math.round((current / total) * 100))
    return { current, total, ratio }
  }

  return (
    <div className="flex-1">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">전체 초대 프로그램</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {displayedEvents.length}건 노출 · 총 {sortedEvents.length}개의 초대가 열려있어요
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border/80 p-1">
            {[
              { mode: "grid", icon: LayoutGrid, label: "카드" },
              { mode: "list", icon: Rows, label: "리스트" },
            ].map((option) => (
              <button
                key={option.mode}
                onClick={() => setViewMode(option.mode as "grid" | "list")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition ${
                  viewMode === option.mode
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-secondary/70"
                }`}
                aria-pressed={viewMode === option.mode}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[170px]" aria-label="정렬 방식 선택">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">신청 많은 순</SelectItem>
                <SelectItem value="latest">최신 등록</SelectItem>
                <SelectItem value="deadline">마감 임박</SelectItem>
                <SelectItem value="match">추천도 순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : ""}`}>
        {displayedEvents.map((event) => {
          const { ratio } = parseApplicants(event.applicants)
          return (
            <Link key={event.id} href={`/events/${event.id}/apply`}>
              <Card
                className={`group h-full cursor-pointer overflow-hidden border-border transition-all duration-300 hover:border-primary/30 hover:shadow-xl ${
                  viewMode === "list" ? "flex flex-col md:flex-row" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    viewMode === "list" ? "h-56 w-full md:h-auto md:w-64" : "h-64"
                  }`}
                >
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                    <Badge className="border-0 bg-white/90 text-foreground backdrop-blur-sm">{event.genre}</Badge>
                    <div className="flex gap-2">
                      <Badge
                        className={`border-0 font-bold ${
                          event.deadline === "오늘 마감" ? "bg-red-500 text-white" : "bg-primary text-white"
                        }`}
                      >
                        {event.deadline}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault()
                          toggleSave(event.id)
                        }}
                        className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white"
                        aria-label={savedEvents.includes(event.id) ? "저장 취소" : "저장하기"}
                      >
                        <Heart className={`h-5 w-5 ${savedEvents.includes(event.id) ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="mb-1 line-clamp-1 text-xl font-bold">{event.title}</h3>
                    <p className="line-clamp-1 text-sm text-white/90">{event.subtitle}</p>
                  </div>
                </div>

                <CardContent className={`space-y-3 p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                    {event.featured && <Badge className="bg-primary/10 text-primary">추천</Badge>}
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground/80">{event.location}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{event.applicants} 신청</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>신청 진행률</span>
                      <span>{ratio}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>

                  <Button className="w-full rounded-xl bg-primary font-bold text-primary-foreground hover:bg-primary/90">
                    초대 신청하기
                  </Button>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {hasMore && (
        <div className="mt-12 text-center">
          <Button variant="outline" size="lg" className="rounded-full border-2 px-12" onClick={loadMore}>
            더 보기 ({sortedEvents.length - displayCount}개 남음)
          </Button>
        </div>
      )}

      {displayedEvents.length === 0 && (
        <div className="py-16 text-center">
          <p className="mb-2 text-lg text-muted-foreground">검색 결과가 없습니다.</p>
          <p className="text-sm text-muted-foreground">다른 조건으로 다시 찾아보세요.</p>
        </div>
      )}
    </div>
  )
}
