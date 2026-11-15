"use client"

import { Button } from "@packages/ui/components/button"
import { CommandShortcut } from "@packages/ui/components/command"
import { SearchIcon } from "lucide-react"
import { useShellCommandMenu } from "./shell.command-menu.context"

export function ShellCommandMenuTrigger() {
  const commandMenu = useShellCommandMenu()

  if (commandMenu === undefined) {
    return null
  }

  const { labels, openPalette, registerTrigger } = commandMenu

  return (
    <Button
      aria-label={labels.triggerLabel}
      className="inline-flex size-9 shrink-0 justify-center gap-0 rounded-lg px-0 text-muted-foreground shadow-none sm:h-8 sm:w-auto sm:max-w-xs sm:gap-2 sm:rounded-full sm:bg-border sm:px-2 md:min-w-52 md:justify-start"
      ref={registerTrigger}
      onClick={() => {
        openPalette()
      }}
      size="sm"
      type="button"
      variant="ghost"
    >
      <SearchIcon aria-hidden="true" className="size-4 shrink-0 opacity-72" />
      <span className="hidden min-w-0 flex-1 truncate text-left font-normal md:inline">
        {labels.placeholder}
      </span>
      <CommandShortcut className="hidden md:inline-flex">
        {labels.footerOpenShortcut}
      </CommandShortcut>
    </Button>
  )
}
