"use client"

import { useShellNavigation } from "@features/shell"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"
import { Button } from "@packages/ui/components/button"
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@packages/ui/components/popover"
import { Skeleton } from "@packages/ui/components/skeleton"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import {
  activityTargetPaths,
  getActivityAction,
} from "../../utils/config/activity.actions"
import {
  isActivityDetailLoadFailure,
  isActivityDetailNotFound,
} from "../utils/activity.detail-load-state"
import { ActivityDetailContent } from "./activity.unified.client"

const highlightClass = "ring-2 ring-ring bg-accent/30"

function pathnameMatchesTarget(pathname: string, targetPath: string) {
  const normalized = pathname.replace(/\/$/, "")
  return normalized === targetPath
}

export function ActivityDestinationHighlight() {
  const t = useTranslations("ui")
  const searchParams = useSearchParams()
  const queryActivityId = searchParams.get("activityId")
  const [activityId, setActivityId] = useState<string | null>(null)
  const strippedRef = useRef(false)
  const { usePathname } = useShellNavigation()
  const pathname = usePathname()
  const lastPathname = useRef(pathname)
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const [status, setStatus] = useState<"idle" | "unavailable">("idle")
  useEffect(() => {
    if (lastPathname.current !== pathname) {
      lastPathname.current = pathname
      if (!queryActivityId) setActivityId(null)
    }
  }, [pathname, queryActivityId])
  useEffect(() => {
    if (!queryActivityId) {
      strippedRef.current = false
      return
    }
    setActivityId(queryActivityId)
    if (strippedRef.current || typeof window === "undefined") return
    const url = new URL(window.location.href)
    if (!url.searchParams.has("activityId")) return
    url.searchParams.delete("activityId")
    window.history.replaceState(window.history.state, "", url.toString())
    strippedRef.current = true
  }, [queryActivityId])
  const query = useQuery({
    queryKey: ["security", "activity", userId, "destination", activityId],
    enabled: Boolean(activityId && userId),
    queryFn: () =>
      securityRpc.security.activity.detail({
        query: { activityId: activityId ?? "" },
      }),
  })
  const detail = query.data?.status === "success" ? query.data.data : null
  const missingEvent = isActivityDetailNotFound(query.data)
  const loadFailed = isActivityDetailLoadFailure(query.data, query.isError)

  useEffect(() => {
    if (activityId && (missingEvent || loadFailed)) {
      setStatus("unavailable")
      setOpen(true)
      return
    }
    if (!activityId || !detail) {
      setOpen(false)
      setStatus("idle")
      return
    }
    const definition = getActivityAction(detail.actionId)
    const routeKey = detail.actionId.startsWith("account.avatar.")
      ? "account.avatar"
      : definition?.target
    const targetPath = definition?.target
      ? activityTargetPaths[definition.target]
      : undefined
    const onTargetPage =
      targetPath && pathnameMatchesTarget(pathname, targetPath)
    if (!detail.canViewTarget || !routeKey || !onTargetPage) {
      setStatus("unavailable")
      setOpen(true)
      return
    }
    let selected: HTMLElement | null = null
    const findTarget = () => {
      const element = document.querySelector<HTMLElement>(
        `[data-activity-target="${routeKey}"]`
      )
      if (!element || selected === element) return
      selected?.classList.remove(...highlightClass.split(" "))
      selected = element
      setAnchor(element)
      setStatus("idle")
      element.scrollIntoView({ behavior: "smooth", block: "center" })
      element.classList.add(...highlightClass.split(" "))
      setOpen(true)
    }
    findTarget()
    const observer = new MutationObserver(findTarget)
    observer.observe(document.body, { childList: true, subtree: true })
    const timeout = window.setTimeout(() => {
      if (!selected) {
        setStatus("unavailable")
        setOpen(true)
      }
    }, 2000)
    return () => {
      window.clearTimeout(timeout)
      observer.disconnect()
      selected?.classList.remove(...highlightClass.split(" "))
      setAnchor(null)
    }
  }, [activityId, detail, loadFailed, missingEvent, pathname])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  if (!activityId) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:justify-end sm:pe-6">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              className="pointer-events-auto shadow-md"
              size="sm"
              variant="secondary"
            />
          }
        >
          {t("activityShowDetails")}
        </PopoverTrigger>
        <PopoverPopup
          align="end"
          anchor={anchor}
          className="pointer-events-auto"
        >
          {query.isPending ? (
            <Skeleton className="h-20 w-48" />
          ) : status === "unavailable" ? (
            <div className="min-w-48 space-y-2 text-sm">
              <p>
                {missingEvent
                  ? t("activityEventUnavailable")
                  : loadFailed
                    ? t("couldNotLoadActivityPleaseTryAgain")
                    : t("activityTargetUnavailable")}
              </p>
              {detail ? <ActivityDetailContent item={detail} /> : null}
            </div>
          ) : detail ? (
            <ActivityDetailContent item={detail} />
          ) : (
            <p className="text-sm">{t("couldNotLoadActivityPleaseTryAgain")}</p>
          )}
        </PopoverPopup>
      </Popover>
    </div>
  )
}
