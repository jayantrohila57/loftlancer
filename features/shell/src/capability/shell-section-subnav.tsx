"use client"

import Shell from "@packages/ui/components/shell"
import { Tabs, TabsList, TabsTab } from "@packages/ui/components/tabs"
import { useEffect, useRef } from "react"
import type { ShellSectionTabItem } from "../types/shell-nav.types"
import { resolveShellSectionTabValue } from "../utils/shell-nav.utils"
import { useShellNavigation } from "./shell.navigation-context"

export interface ShellSectionSubnavProps {
  readonly resolveTabValue?: (
    pathname: string,
    tabs: readonly ShellSectionTabItem[]
  ) => string
  readonly tabs: readonly ShellSectionTabItem[]
}

export function ShellSectionSubnav({
  tabs,
  resolveTabValue = resolveShellSectionTabValue,
}: ShellSectionSubnavProps) {
  const { Link, usePathname } = useShellNavigation()
  const pathname = usePathname()
  const activeValue = resolveTabValue(pathname, tabs)
  const activeIndex = tabs.findIndex((tab) => tab.value === activeValue)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    const activeTab =
      container?.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex]
    if (!container || !activeTab) return

    function showActiveTab() {
      if (!container || !activeTab) return
      const containerBounds = container.getBoundingClientRect()
      const tabBounds = activeTab.getBoundingClientRect()
      if (tabBounds.left < containerBounds.left) {
        container.scrollBy({ left: tabBounds.left - containerBounds.left })
      } else if (tabBounds.right > containerBounds.right) {
        container.scrollBy({ left: tabBounds.right - containerBounds.right })
      }
    }
    showActiveTab()
    const observer = new ResizeObserver(showActiveTab)
    observer.observe(container)
    return () => observer.disconnect()
  }, [activeIndex])

  return (
    <Shell.Subnav
      ref={scrollRef}
      className="min-w-0 [scrollbar-width:none] overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden"
    >
      <Tabs className="w-max min-w-full items-start" value={activeValue}>
        <TabsList className="w-max" variant="underline">
          {tabs.map((tab) => {
            return (
              <TabsTab
                key={tab.value}
                className="gap-1.5"
                nativeButton={false}
                render={<Link href={tab.href} />}
                value={tab.value}
              >
                {tab.label}
              </TabsTab>
            )
          })}
        </TabsList>
      </Tabs>
    </Shell.Subnav>
  )
}
