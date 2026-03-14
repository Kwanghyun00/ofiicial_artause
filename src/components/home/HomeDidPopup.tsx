"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Instagram, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const INSTAGRAM_URL = "https://www.instagram.com/artause_official/"

const DID_POPUP_HIDE_UNTIL_KEY = "home_did_popup_hide_until"

export function HomeDidPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DID_POPUP_HIDE_UNTIL_KEY)
      const hideUntil = stored ? Number(stored) : 0
      if (Number.isFinite(hideUntil) && hideUntil > Date.now()) {
        return
      }
    } catch {
      // Ignore localStorage access failures in restricted environments.
    }

    setOpen(true)
  }, [])

  const handleHideToday = () => {
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    try {
      window.localStorage.setItem(DID_POPUP_HIDE_UNTIL_KEY, String(endOfToday.getTime()))
    } catch {
      // Ignore localStorage access failures in restricted environments.
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[92vw] overflow-hidden border-primary/20 p-0 sm:max-w-md">
        <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50/80 p-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/90 px-3 py-1 text-xs font-semibold text-purple-700">
            <Instagram className="h-3.5 w-3.5" />
            @artause_official
          </div>
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              가장 빠른 공연 정보,<br />알터즈에서 먼저 확인하세요
            </DialogTitle>
            <DialogDescription className="mt-2 leading-relaxed text-slate-700">
              인스타그램 팔로우하면 초대권 이벤트 오픈 소식을 가장 먼저 받아볼 수 있어요.
            </DialogDescription>
          </DialogHeader>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              신규 초대권 이벤트 오픈 알림
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              공연 추천 & 관람 후기
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-purple-500 shrink-0" />
              팔로워 전용 특별 혜택
            </li>
          </ul>
        </div>

        <DialogFooter className="border-t border-slate-200 bg-white p-4 sm:justify-between">
          <Button type="button" variant="ghost" onClick={handleHideToday}>
            오늘 하루 보지 않기
          </Button>
          <div className="flex w-full gap-2 sm:w-auto">
            <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => setOpen(false)}>
              닫기
            </Button>
            <Button asChild className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <Instagram className="mr-1.5 h-4 w-4" />
                팔로우하기
              </a>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
