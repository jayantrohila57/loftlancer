"use client"

import { authClient } from "@packages/better-auth/client"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@packages/ui/components/alert-dialog"
import { Button } from "@packages/ui/components/button"
import { Frame, FrameFooter } from "@packages/ui/components/frame"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import { Shield, Trash2, User } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import type { ListActivityOutput } from "../../utils/types/activity.types.activity"
import { useActivityApi } from "../hooks/activity.activity.hooks"

type ActivityItem = NonNullable<ListActivityOutput["data"]>["items"][number]

export function ActivityTimeline({
  items,
}: {
  readonly items: readonly ActivityItem[]
}) {
  const t = useTranslations("ui")
  const format = useFormatter()
  const events: Readonly<Record<string, string>> = {
    sign_in: t("signInEvent"),
    sign_out: t("signOutEvent"),
    session_revoked: t("sessionRevokedEvent"),
    session_ended: t("sessionEndedEvent"),
    provider_disconnected: t("providerDisconnected"),
    profile_updated: t("profileUpdated"),
    avatar_updated: t("avatarUpdated"),
    avatar_removed: t("avatarRemoved"),
  }
  const outcomes: Readonly<Record<string, string>> = {
    success: t("successOutcome"),
    failed: t("failedOutcome"),
    failure: t("failedOutcome"),
    error: t("failedOutcome"),
  }
  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li
          key={`${item.id}-${item.type}`}
          className="relative flex gap-3 pb-6 last:pb-0"
        >
          {index < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute start-[15px] top-8 bottom-0 w-px bg-border"
            />
          )}
          <span
            aria-hidden="true"
            className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            {item.ipAddress || item.userAgent || item.location ? (
              <Shield className="size-4" />
            ) : (
              <User className="size-4" />
            )}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="font-medium">
              {events[item.type] ?? t("unknownEvent")}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.resourceType === "profile" ? t("profile") : t("account")}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <time dateTime={new Date(item.occurredAt).toISOString()}>
                {format.dateTime(new Date(item.occurredAt), "dateTime")}
              </time>
              <span className="rounded-md border px-1.5 py-0.5">
                {outcomes[item.outcome] ?? t("unknown")}
              </span>
            </div>
            {(item.ipAddress || item.userAgent || item.location) && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">
                  {t("deviceDetails")}
                </summary>
                <p>
                  {t("iPLabel")} {item.ipAddress || t("unavailable")}
                </p>
                <p className="break-all">
                  {t("userAgentLabel")} {item.userAgent || t("unavailable")}
                </p>
                <p>
                  {t("locationLabel")}{" "}
                  {item.location
                    ? t("activityLocation", {
                        latitude: format.number(item.location.latitude, {
                          maximumFractionDigits: 4,
                        }),
                        longitude: format.number(item.location.longitude, {
                          maximumFractionDigits: 4,
                        }),
                        accuracy: format.number(
                          Math.round(item.location.accuracyMeters),
                          "integer"
                        ),
                      })
                    : t("unavailableForThisEvent")}
                </p>
              </details>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

function createTypes(t: ReturnType<typeof useTranslations<"ui">>) {
  return {
    security: [
      { value: "sign_in", label: t("signIns") },
      { value: "sign_out", label: t("signOuts") },
      { value: "session_revoked", label: t("revocations") },
      { value: "session_ended", label: t("otherSessionEndings") },
      { value: "provider_disconnected", label: t("providerDisconnected") },
    ],
  }
}

export function SecurityActivityScreen({
  kind,
}: {
  kind: "user" | "security"
}) {
  const t = useTranslations("ui")

  const types = createTypes(t)
  const { data: current, isPending: sessionPending } = authClient.useSession()
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState("")
  const [days, setDays] = useState(0)
  const [since, setSince] = useState<string | undefined>()
  const query = useActivityApi.useList(current?.user.id, {
    kind,
    page,
    type: kind === "security" && filter ? filter : undefined,
    since: kind === "security" ? since : undefined,
  })
  const deleteActivity = useActivityApi.useDelete(current?.user.id)
  const result = query.data
  const items = result?.status === "success" ? result.data.items : []
  const hasMore = result?.status === "success" && result.data.hasMore
  const loading =
    sessionPending || (Boolean(current?.user.id) && query.isPending)
  const busy = deleteActivity.isPending
  const error = query.error
    ? t("couldNotLoadActivityPleaseTryAgain")
    : result?.status === "error"
      ? t("operationFailed")
      : ""
  const failed = result?.status === "failed" ? t("operationFailed") : ""
  const [confirm, setConfirm] = useState(false)
  async function load() {
    await query.refetch()
  }
  async function remove() {
    try {
      const result = await deleteActivity.mutateAsync(kind)
      toastManager.add({
        title:
          result.status === "success"
            ? t("activityDeleted")
            : t("operationFailed"),
        type:
          result.status === "success"
            ? "success"
            : result.status === "failed"
              ? "warning"
              : "error",
      })
      if (result.status === "success") {
        setConfirm(false)
        setPage(0)
      }
    } catch {
      toastManager.add({
        title: t("couldNotDeleteActivityHistory"),
        type: "error",
      })
    }
  }
  return (
    <>
      <div className="space-y-4">
        {kind === "security" && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filter === "" ? "default" : "outline"}
                onClick={() => {
                  setFilter("")
                  setPage(0)
                }}
              >
                {t("allEvents")}
              </Button>
              {types.security.map((entry) => (
                <Button
                  key={entry.value}
                  size="sm"
                  variant={filter === entry.value ? "default" : "outline"}
                  onClick={() => {
                    setFilter(entry.value)
                    setPage(0)
                  }}
                >
                  {entry.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { n: 0, label: t("allTime") },
                { n: 7, label: t("lastDays", { count: 7 }) },
                { n: 30, label: t("lastDays", { count: 30 }) },
              ].map((entry) => (
                <Button
                  key={entry.n}
                  size="sm"
                  variant={days === entry.n ? "default" : "outline"}
                  onClick={() => {
                    setDays(entry.n)
                    setSince(
                      entry.n
                        ? new Date(
                            Date.now() - entry.n * 86400000
                          ).toISOString()
                        : undefined
                    )
                    setPage(0)
                  }}
                >
                  {entry.label}
                </Button>
              ))}
            </div>
          </>
        )}
        <Frame className="w-full">
          {loading ? (
            <p>{t("loadingActivity")}</p>
          ) : failed ? (
            <p role="alert">{failed}</p>
          ) : error ? (
            <div role="alert">
              {error}{" "}
              <Button size="sm" variant="outline" onClick={() => void load()}>
                {t("tryAgain")}
              </Button>
            </div>
          ) : items.length === 0 ? (
            <p>{t("noActivityFound")}</p>
          ) : (
            <ActivityTimeline items={items} />
          )}
          <FrameFooter className="flex flex-wrap items-center justify-between gap-2 p-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0 || loading}
                onClick={() => setPage((value) => value - 1)}
              >
                {t("previous")}
              </Button>
              <span className="py-1 text-sm">
                {t("pageNumber", { page: page + 1 })}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={!hasMore || loading}
                onClick={() => setPage((value) => value + 1)}
              >
                {t("next")}
              </Button>
            </div>
            {kind === "security" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirm(true)}
              >
                <Trash2 />
                {t("deleteHistory")}
              </Button>
            )}
          </FrameFooter>
        </Frame>
      </div>
      <AlertDialog
        open={confirm}
        onOpenChange={(open) => {
          if (!busy) setConfirm(open)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteActivityTitle", { kind })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteActivityDescription", { kind })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={busy} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? <Spinner /> : <Trash2 />}{" "}
              {busy ? t("deleting") : t("deleteHistory")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}

export function SecurityActivityDataManagement() {
  const t = useTranslations("ui")

  const { data: current } = authClient.useSession()
  const clearActivity = useActivityApi.useClear(current?.user.id)
  const [confirm, setConfirm] = useState(false)
  const busy = clearActivity.isPending
  async function remove() {
    try {
      const cleared = await clearActivity.mutateAsync({ scope: "all" })
      const ok = cleared.status === "success"
      toastManager.add({
        title: ok ? t("activityDeleted") : t("operationFailed"),
        type: ok
          ? "success"
          : cleared.status === "failed"
            ? "warning"
            : "error",
      })
      if (ok) setConfirm(false)
    } catch {
      toastManager.add({
        title: t("couldNotDeleteUserActivityHistory"),
        type: "error",
      })
    }
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">{t("activityClearAll")}</p>
          <p className="text-sm text-muted-foreground">
            {t("activityClearAllDescription")}
          </p>
        </div>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setConfirm(true)}
        >
          <Trash2 />
          {t("activityClearAll")}
        </Button>
      </div>
      <AlertDialog
        open={confirm}
        onOpenChange={(open) => {
          if (!busy) setConfirm(open)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("activityClearAllTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("activityClearAllDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={busy} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? <Spinner /> : <Trash2 />}{" "}
              {busy ? t("deleting") : t("activityClearAll")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
