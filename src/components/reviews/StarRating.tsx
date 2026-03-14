"use client"

import { Star } from "lucide-react"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
}

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const isInteractive = Boolean(onChange)
  const starClass = sizeMap[size]

  return (
    <div
      className="flex gap-0.5"
      role={isInteractive ? "radiogroup" : "img"}
      aria-label={`별점 ${value}점`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value
        return (
          <button
            key={star}
            type="button"
            onClick={isInteractive ? () => onChange!(star) : undefined}
            disabled={!isInteractive}
            aria-label={`${star}점`}
            className={`transition-transform ${
              isInteractive ? "cursor-pointer hover:scale-110" : "cursor-default"
            }`}
          >
            <Star
              className={`${starClass} ${
                filled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground"
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
