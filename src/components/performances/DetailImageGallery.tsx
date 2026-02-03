"use client"

import { useState } from "react"
import Image from "next/image"

type Props = {
  title: string
  images: string[]
}

export function DetailImageGallery({ title, images }: Props) {
  const [active, setActive] = useState<string | null>(null)

  if (!images.length) return null

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {images.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => setActive(url)}
            className="group relative h-64 w-full overflow-hidden rounded-2xl border border-black/10 bg-white"
            aria-label={`상세 이미지 ${index + 1} 확대`}
          >
            <Image src={url} alt={`${title} 상세 이미지 ${index + 1}`} fill className="object-cover transition group-hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black"
            onClick={() => setActive(null)}
          >
            닫기
          </button>
          <div className="relative h-[80vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-black">
            <Image src={active} alt={`${title} 상세 이미지 확대`} fill className="object-contain" />
          </div>
        </div>
      )}
    </>
  )
}
