"use client"

import type { AccountSidebarNavItem } from "@modules/shell"
import {
  accountHubSectionDescription,
  accountSidebarNavGroups,
  ShellAccountFrame,
} from "@modules/shell"
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@packages/ui/components/frame"
import { ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"
import { Link } from "@/shared/i18n/auth.i18n"

function AccountHubCategoryCard({
  item,
}: {
  readonly item: AccountSidebarNavItem
}) {
  const t = useTranslations("ui")
  const destinations =
    item.subItems && item.subItems.length > 0
      ? item.subItems
      : [{ href: item.href, icon: item.icon, label: item.label }]
  const description = accountHubSectionDescription(t, item.href)

  return (
    <Frame>
      <FramePanel className="h-full space-y-2 p-2">
        <FrameHeader>
          <FrameTitle>{item.label}</FrameTitle>
          <FrameDescription>{description}</FrameDescription>
        </FrameHeader>
        <div className="flex flex-col gap-2">
          {destinations.map((destination) => {
            const DestinationIcon = destination.icon ?? item.icon
            return (
              <Link
                key={destination.href}
                href={destination.href}
                className="group flex w-full min-w-0 items-center gap-3 rounded-lg border bg-background/50 px-3 py-2.5 text-left outline-hidden transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <DestinationIcon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm leading-snug font-medium">
                  {destination.label}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                />
              </Link>
            )
          })}
        </div>
      </FramePanel>
    </Frame>
  )
}

export function AccountHubSections() {
  const t = useTranslations("ui")
  const groups = accountSidebarNavGroups(t)

  return (
    <ShellAccountFrame>
      <div className="space-y-6">
        {groups.map((group) => (
          <section
            key={group.label}
            className="grid grid-cols-6 p-2"
            aria-label={group.label}
          >
            <div className="col-span-1 flex flex-col">
              <h2 className="text-sm font-semibold">{group.label}</h2>
            </div>
            <div className="col-span-5 grid grid-cols-1 gap-2">
              {group.items
                .filter((item) => item.href !== "/account")
                .map((item) => (
                  <AccountHubCategoryCard key={item.href} item={item} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </ShellAccountFrame>
  )
}
