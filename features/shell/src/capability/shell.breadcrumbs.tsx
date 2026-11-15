"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@packages/ui/components/breadcrumb"
import { Button, buttonVariants } from "@packages/ui/components/button"
import {
  Menu,
  MenuLinkItem,
  MenuPopup,
  MenuTrigger,
} from "@packages/ui/components/menu"
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@packages/ui/components/tooltip"
import { cn } from "@packages/ui/lib/utils"
import {
  Check,
  Home,
  Link as LinkIcon,
  MoreHorizontal,
  Slash,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Fragment, useEffect, useRef, useState } from "react"
import type { ShellBreadcrumbItem } from "../utils/shell-breadcrumb.utils"
import {
  compressBreadcrumbs,
  generateBreadcrumbs,
} from "../utils/shell-breadcrumb.utils"
import { slugToTitle } from "../utils/shell-breadcrumb-label.utils"
import { useShellNavigation } from "./shell.navigation-context"

export interface ShellBreadcrumbsProps {
  readonly items?: ShellBreadcrumbItem[]
  readonly homeHref?: string
}

export function ShellBreadcrumbs({
  items,
  homeHref = "/",
}: ShellBreadcrumbsProps) {
  const t = useTranslations("ui")
  const labels: Readonly<Record<string, string>> = {
    account: t("account"),
    overview: t("overview"),
    profile: t("profile"),
    activity: t("activity"),
    security: t("security"),
    permissions: t("permissions"),
    sessions: t("sessions"),
    "connected-accounts": t("connectedAccounts"),
    "data-management": t("dataManagement"),
    appearance: t("appearance"),
    density: t("interfaceDensity"),
    "language-region": t("languageRegion"),
    sidebar: t("sidebarBehavior"),
    theme: t("theme"),
    zoom: t("zoomLevel"),
    language: t("language"),
    region: t("region"),
    "date-time": t("dateAndTime"),
    numbers: t("numbers"),
    currency: t("currency"),
    measurements: t("measurements"),
  }
  const labelFor = (value: string) => labels[value] ?? slugToTitle(value)

  const { Link, usePathname } = useShellNavigation()
  const pathname = usePathname()
  const { visible, hidden } = compressBreadcrumbs(
    items ?? generateBreadcrumbs(pathname)
  )
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  )
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopyState("idle"), 2000)
  }

  return (
    <Breadcrumb className="group/breadcrumbs hidden min-w-0 md:block">
      <TooltipProvider>
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <Tooltip>
              <TooltipTrigger
                render={
                  <BreadcrumbLink
                    render={<Link href={homeHref} />}
                    className={buttonVariants({
                      variant: "ghost",
                      size: "icon",
                    })}
                    aria-label={t("home")}
                  />
                }
              >
                <Home className="size-4" aria-hidden="true" />
              </TooltipTrigger>
              <TooltipPopup>{t("home")}</TooltipPopup>
            </Tooltip>
          </BreadcrumbItem>
          {visible.map((item, index) => (
            <Fragment key={item.href}>
              <BreadcrumbSeparator className="opacity-100">
                <Slash
                  className="-rotate-12 text-muted-foreground"
                  aria-hidden="true"
                />
              </BreadcrumbSeparator>
              {index === 1 && hidden.length > 0 && (
                <>
                  <BreadcrumbItem>
                    <Menu>
                      <MenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label={t("showHiddenBreadcrumbLinks")}
                          />
                        }
                      >
                        <MoreHorizontal aria-hidden="true" />
                      </MenuTrigger>
                      <MenuPopup align="start">
                        {hidden.map((crumb) => (
                          <MenuLinkItem
                            key={crumb.href}
                            render={<Link href={crumb.href} />}
                          >
                            {labelFor(crumb.label)}
                          </MenuLinkItem>
                        ))}
                      </MenuPopup>
                    </Menu>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="opacity-100">
                    <Slash
                      className="-rotate-12 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </BreadcrumbSeparator>
                </>
              )}
              <BreadcrumbItem>
                {index === visible.length - 1 ? (
                  <BreadcrumbPage className="font-normal text-muted-foreground">
                    {labelFor(item.label)}
                  </BreadcrumbPage>
                ) : (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <BreadcrumbLink render={<Link href={item.href} />} />
                      }
                    >
                      {labelFor(item.label)}
                    </TooltipTrigger>
                    <TooltipPopup>
                      {t("goToPage", { page: labelFor(item.label) })}
                    </TooltipPopup>
                  </Tooltip>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
          <BreadcrumbItem
            className={cn(
              "transition-opacity",
              copyState === "idle" &&
                "pointer-events-none opacity-0 group-hover/breadcrumbs:pointer-events-auto group-hover/breadcrumbs:opacity-100 focus-within:pointer-events-auto focus-within:opacity-100"
            )}
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("copyURL")}
                    onClick={copyUrl}
                  />
                }
              >
                {copyState === "copied" ? (
                  <Check aria-hidden="true" />
                ) : (
                  <LinkIcon aria-hidden="true" />
                )}
              </TooltipTrigger>
              <TooltipPopup>
                {copyState === "copied"
                  ? t("uRLCopied")
                  : copyState === "error"
                    ? t("couldNotCopyURL")
                    : t("copyURL")}
              </TooltipPopup>
            </Tooltip>
            <span className="sr-only" role="status">
              {copyState === "copied"
                ? t("uRLCopied")
                : copyState === "error"
                  ? t("couldNotCopyURL")
                  : ""}
            </span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </TooltipProvider>
    </Breadcrumb>
  )
}
