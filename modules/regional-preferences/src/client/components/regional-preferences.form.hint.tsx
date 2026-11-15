"use client"

import { Button } from "@packages/ui/components/button"
import {
  PreviewCard,
  PreviewCardPopup,
  PreviewCardTrigger,
} from "@packages/ui/components/preview-card"
import { Info } from "lucide-react"

export function RegionalFieldHint({
  ariaLabel,
  body,
}: {
  readonly ariaLabel: string
  readonly body: string
}) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={ariaLabel}
            className="size-7 shrink-0 text-muted-foreground"
          />
        }
      >
        <Info className="size-4" aria-hidden="true" />
      </PreviewCardTrigger>
      <PreviewCardPopup className="max-w-sm text-sm">{body}</PreviewCardPopup>
    </PreviewCard>
  )
}
