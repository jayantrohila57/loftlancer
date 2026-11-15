"use client"

import type { ActionToolbarItem } from "@features/action"
import { createActionRegistry, toActionToolbarItems } from "@features/action"
import { Button } from "@packages/ui/components/button"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

function HistoryToolbarButton({ item }: { readonly item: ActionToolbarItem }) {
  const onClick = () => {
    if (item.handler.kind !== "run") {
      return
    }

    void item.handler.run()
  }

  const Icon = item.icon

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={item.label}
            onClick={onClick}
            size="icon"
            variant="ghost"
          />
        }
      >
        {Icon !== undefined ? <Icon aria-hidden="true" /> : null}
      </TooltipTrigger>
      <TooltipPopup>{item.label}</TooltipPopup>
    </Tooltip>
  )
}

export function ShellHistoryControls() {
  const t = useTranslations("ui")

  const toolbarItems = useMemo(() => {
    const registry = createActionRegistry({
      items: [
        {
          handler: { kind: "run", run: () => window.history.back() },
          icon: ArrowLeft,
          id: "history.back",
          label: t("goBack"),
          order: 0,
          placements: ["toolbar"],
        },
        {
          handler: { kind: "run", run: () => window.history.forward() },
          icon: ArrowRight,
          id: "history.forward",
          label: t("goForward"),
          order: 1,
          placements: ["toolbar"],
        },
      ],
    })

    return toActionToolbarItems(registry)
  }, [t])

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {toolbarItems.map((item) => (
          <HistoryToolbarButton item={item} key={item.id} />
        ))}
      </div>
    </TooltipProvider>
  )
}
