"use client"

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@packages/ui/components/collapsible"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@packages/ui/components/sidebar"
import { Skeleton } from "@packages/ui/components/skeleton"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"
import { lazy, Suspense, useEffect, useState } from "react"
import type { ShellSidebarNavGroup } from "../types/shell-nav.types"
import {
  isShellSidebarHrefActive,
  isShellSidebarSubItemActive,
} from "../utils/shell-nav.utils"
import { useShellNavigation } from "./shell.navigation-context"

const ShellSidebarToggle = lazy(() =>
  import("./shell.sidebar-toggle").then((module) => ({
    default: module.ShellSidebarToggle,
  }))
)

const ShellSidebarRail = lazy(() =>
  import("./shell.sidebar-rail").then((module) => ({
    default: module.ShellSidebarRail,
  }))
)

export interface ShellSidebarNavProps {
  /** Slot at the top of the sidebar body, below the header (collapse) row. */
  readonly leading?: ReactNode
  /** Optional group label above `leading`; omit for an unlabeled block (e.g. org switcher). */
  readonly leadingLabel?: string
  readonly groups: readonly ShellSidebarNavGroup[]
}

function SidebarSection({
  children,
  initiallyOpen,
}: {
  readonly children: ReactNode
  readonly initiallyOpen: boolean
}) {
  const [open, setOpen] = useState(initiallyOpen)

  return (
    <Collapsible
      className="group/collapsible"
      onOpenChange={setOpen}
      open={open}
    >
      {children}
    </Collapsible>
  )
}

export function ShellSidebarNav({
  leading,
  leadingLabel,
  groups,
}: ShellSidebarNavProps) {
  const { Link, usePathname } = useShellNavigation()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <SidebarHeader className="flex h-12 shrink-0 flex-row items-center gap-2 border-b p-2">
        <Suspense
          fallback={<Skeleton aria-hidden="true" className="size-8 shrink-0" />}
        >
          {mounted ? (
            <ShellSidebarToggle />
          ) : (
            <Skeleton aria-hidden="true" className="size-8 shrink-0" />
          )}
        </Suspense>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {leading ? (
          <div className="border-b border-sidebar-border p-2">
            {leadingLabel ? (
              <span className="sr-only">{leadingLabel}</span>
            ) : null}
            {leading}
          </div>
        ) : null}
        {groups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const subItems = item.subItems ?? []
                  const sectionActive =
                    subItems.length > 0
                      ? subItems.some((sub) =>
                          isShellSidebarSubItemActive(
                            pathname,
                            sub.href,
                            subItems
                          )
                        )
                      : isShellSidebarHrefActive(pathname, item.href)

                  if (subItems.length === 0) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={sectionActive}
                          render={<Link href={item.href} />}
                          tooltip={item.label}
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  return (
                    <SidebarSection
                      key={item.href}
                      initiallyOpen={sectionActive}
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          className="data-panel-open:[&_svg:last-child]:rotate-90"
                          render={
                            <SidebarMenuButton
                              isActive={sectionActive}
                              tooltip={item.label}
                            />
                          }
                        >
                          <Icon />
                          <span>{item.label}</span>
                          <ChevronRight className="ms-auto size-4 shrink-0 transition-transform duration-200" />
                        </CollapsibleTrigger>
                        <CollapsiblePanel>
                          <SidebarMenuSub>
                            {subItems.map((sub) => (
                              <SidebarMenuSubItem key={sub.href}>
                                <SidebarMenuSubButton
                                  isActive={isShellSidebarSubItemActive(
                                    pathname,
                                    sub.href,
                                    subItems
                                  )}
                                  render={<Link href={sub.href} />}
                                >
                                  {sub.icon && <sub.icon aria-hidden="true" />}
                                  <span>{sub.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsiblePanel>
                      </SidebarMenuItem>
                    </SidebarSection>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <Suspense fallback={null}>
        {mounted ? <ShellSidebarRail /> : null}
      </Suspense>
    </>
  )
}
