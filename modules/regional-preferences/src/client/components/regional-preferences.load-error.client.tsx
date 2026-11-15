"use client"

import { Button } from "@packages/ui/components/button"
import { useTranslations } from "next-intl"

export function RegionalLoadError({
  className,
  message,
  onRetry,
}: {
  readonly className?: string
  readonly message: string
  readonly onRetry?: () => void
}) {
  const tUi = useTranslations("ui")

  return (
    <div
      className={
        className ??
        "flex min-h-[12rem] flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4"
      }
      role="alert"
    >
      <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      {onRetry ? (
        <Button onClick={onRetry} size="sm" type="button" variant="secondary">
          {tUi("tryAgain")}
        </Button>
      ) : null}
    </div>
  )
}
