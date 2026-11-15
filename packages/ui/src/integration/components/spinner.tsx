"use client"

import { cn } from "@packages/ui/lib/utils"
import { useTranslations } from "next-intl"
import type React from "react"

const spokes = Array.from({ length: 8 }, (_, index) => {
  const step = index
  return {
    id: `spoke-${step}`,
    opacity: +(1 - (step / 8) * 0.85).toFixed(2),
    rotate: step * 45,
  }
})

export function Spinner({
  className,
  ...props
}: React.ComponentProps<"svg">): React.ReactElement {
  const t = useTranslations("ui")

  return (
    <svg
      aria-label={t("loading")}
      className={cn("text-foreground", className)}
      fill="none"
      height="24"
      role="status"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      style={{ animation: "spin 0.8s steps(8, end) infinite", ...props.style }}
    >
      {spokes.map((spoke) => (
        <rect
          fill="currentColor"
          fillOpacity={spoke.opacity}
          height="5"
          key={spoke.id}
          rx="1"
          transform={`rotate(${spoke.rotate} 12 12)`}
          width="2"
          x="11"
          y="2.5"
        />
      ))}
    </svg>
  )
}
