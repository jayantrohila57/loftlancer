"use client"

import { useShellNavigation } from "@features/shell"
import { AuthSessionEndedNotice, capturePermittedLocation } from "@modules/auth"
import { useLocationApi } from "@modules/location/client"
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
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@packages/ui/components/collapsible"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Spinner } from "@packages/ui/components/spinner"
import { toastManager } from "@packages/ui/components/toast"
import {
  CalendarClock,
  CalendarDays,
  ChevronDown,
  Globe,
  Laptop,
  LogOut,
  MapPin,
  MapPinOff,
  Monitor,
  Network,
  Smartphone,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { Component, lazy, Suspense, useEffect, useState } from "react"
import {
  canRevokeListedSession,
  countOtherSessions,
  sessionHasExpired,
} from "../../utils/sessions.revocation-guards"
import type { Session } from "../../utils/types/sessions.types.sessions"
import { useSessionsApi } from "../hooks/sessions.sessions.hooks"

const SessionMap = lazy(() => import("./sessions.session-map.client"))
function SessionMapUnavailable() {
  const t = useTranslations("ui")
  return (
    <p
      role="status"
      className="rounded-lg border p-4 text-sm text-muted-foreground"
    >
      {t("mapUnavailable")}
    </p>
  )
}
class MapErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <SessionMapUnavailable /> : this.props.children
  }
}

function describeDevice(
  userAgent: string | null | undefined,
  t: ReturnType<typeof useTranslations<"ui">>
) {
  if (!userAgent)
    return {
      name: t("unknownDevice"),
      mobile: false,
      browser: t("unknown"),
      os: t("unknown"),
    }
  const mobile = /Android|iPhone|iPad|Mobile/i.test(userAgent)
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : t("browser")
  const os = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : t("unknown")
  const pattern =
    browser === "Edge"
      ? /Edg\/([\d.]+)/
      : browser === "Opera"
        ? /OPR\/([\d.]+)/
        : browser === "Firefox"
          ? /Firefox\/([\d.]+)/
          : browser === "Chrome"
            ? /Chrome\/([\d.]+)/
            : browser === "Safari"
              ? /Version\/([\d.]+)/
              : null
  const version = pattern?.exec(userAgent)?.[1]
  return {
    name: t("deviceOnSystem", { browser, os }),
    mobile,
    browser: version ? `${browser} ${version}` : browser,
    os,
  }
}

export function SecuritySessionsScreen() {
  const t = useTranslations("ui")

  const format = useFormatter()
  const { Link } = useShellNavigation()
  const {
    data: current,
    isPending: sessionPending,
    error: sessionError,
    refetch,
  } = authClient.useSession()
  const [, setSessionExpiryTick] = useState(0)
  const sessionRecord = current?.session
  const sessionLive =
    current?.user &&
    sessionRecord &&
    !sessionHasExpired(sessionRecord.expiresAt)
      ? current
      : null
  const expiresAt = sessionRecord?.expiresAt

  useEffect(() => {
    if (!expiresAt || sessionHasExpired(expiresAt)) return
    const expiryTime = new Date(expiresAt).getTime()
    let timer: number
    function scheduleExpiry() {
      const remaining = expiryTime - Date.now()
      if (!Number.isFinite(remaining)) return
      if (remaining <= 0) {
        setSessionExpiryTick((value) => value + 1)
        refetch().catch(() => {})
        return
      }
      timer = window.setTimeout(
        scheduleExpiry,
        Math.min(remaining, 2_147_483_647)
      )
    }
    scheduleExpiry()
    return () => window.clearTimeout(timer)
  }, [expiresAt, refetch])
  const { data: locationResponse, refetch: refreshLocation } =
    useLocationApi.useGet(sessionLive?.user.id)
  const locationState =
    locationResponse?.status === "success" ? locationResponse.data : null
  const [browserPermission, setBrowserPermission] = useState<
    PermissionState | "unavailable"
  >("unavailable")
  const {
    data: sessionsResponse,
    isPending: sessionsPending,
    error,
    refetch: load,
  } = useSessionsApi.useList(sessionLive?.user.id)
  const sessions =
    sessionsResponse?.status === "success" ? sessionsResponse.data : []
  const responseError =
    sessionsResponse && sessionsResponse.status !== "success"
      ? sessionsResponse.message
      : undefined
  const revokeSession = useSessionsApi.useRevoke(sessionLive?.user.id)
  const revokeOtherSessions = useSessionsApi.useRevokeOthers(
    sessionLive?.user.id
  )
  const [selected, setSelected] = useState<Session | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [revokeOthersOpen, setRevokeOthersOpen] = useState(false)
  const [revokingOthers, setRevokingOthers] = useState(false)
  const otherSessionCount = countOtherSessions(
    sessions,
    sessionLive?.session.id
  )

  useEffect(() => {
    if (navigator.permissions)
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => setBrowserPermission(permission.state))
        .catch(() => {})
    if (sessionLive?.user.id)
      void capturePermittedLocation()
        .then(() => refreshLocation())
        .catch(() => {})
  }, [sessionLive?.user.id, refreshLocation])

  async function revokeOthers() {
    if (!sessionLive?.session || revokingOthers || otherSessionCount === 0)
      return
    setRevokingOthers(true)
    try {
      await toastManager.promise(
        (async () => {
          await revokeOtherSessions.mutateAsync()
        })(),
        {
          loading: t("revokingOtherSessions"),
          success: t("otherSessionsRevoked"),
          error: t("couldNotRevokeOtherSessions"),
        }
      )
      setRevokeOthersOpen(false)
    } catch {
      // The toast reports the failure and the dialog stays open.
    } finally {
      setRevokingOthers(false)
    }
  }

  async function revoke() {
    if (
      !selected ||
      !sessionLive?.session ||
      !canRevokeListedSession({
        currentSessionId: sessionLive.session.id,
        targetSessionId: selected.id,
      }) ||
      revoking
    )
      return
    setRevoking(true)
    try {
      await toastManager.promise(
        (async () => {
          await revokeSession.mutateAsync(selected.token)
        })(),
        {
          loading: t("signingOutSession"),
          success: t("sessionSignedOut"),
          error: t("couldNotRevokeSession"),
        }
      )
      setSelected(null)
    } catch {
      // The toast reports the failure and the dialog stays open.
    } finally {
      setRevoking(false)
    }
  }

  return (
    <>
      {locationState &&
        (!locationState.enabled || browserPermission !== "granted") && (
          <div className="mb-4 rounded-lg border p-3 text-sm">
            {t("locationDisabled")}{" "}
            <Link className="underline" href="/account/security/permissions">
              {t("permissions")}
            </Link>{" "}
            {t("locationReviewHelp")}
          </div>
        )}
      {(Boolean(sessionLive?.user.id) && sessionsPending) || sessionPending ? (
        <Skeleton className="h-16 w-full" />
      ) : error || sessionError || responseError ? (
        <div>
          {t("unableToLoadSessions")}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
              void load()
              void refetch()
            }}
          >
            {t("tryAgain")}
          </button>
        </div>
      ) : !sessionLive?.session ? (
        <AuthSessionEndedNotice />
      ) : sessions.length === 0 ? (
        <p>{t("noActiveSessionsFound")}</p>
      ) : (
        <div className="space-y-5">
          <section aria-label={t("currentSession")}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-foreground">
                {t("currentSession")}
              </h3>
              <Badge variant="success">{t("thisDevice")}</Badge>
            </div>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
              <div className="min-w-0">
                {locationState?.enabled && locationState.location ? (
                  <div className="space-y-2">
                    <MapErrorBoundary>
                      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                        <SessionMap
                          location={{
                            ...locationState.location,
                            capturedAt:
                              locationState.location.capturedAt.toISOString(),
                          }}
                        />
                      </Suspense>
                    </MapErrorBoundary>
                    <p className="text-xs text-muted-foreground">
                      {t("locationAccuracyPrivacy", {
                        accuracy: Math.round(
                          locationState.location.accuracyMeters
                        ),
                      })}
                    </p>
                  </div>
                ) : (
                  <Empty className="h-64 rounded-lg border bg-muted/30 px-4 py-4">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <MapPinOff />
                      </EmptyMedia>
                      <EmptyTitle className="text-base">
                        {locationState && !locationState.enabled
                          ? t("locationIsTurnedOff")
                          : t("locationUnavailable")}
                      </EmptyTitle>
                      <EmptyDescription>
                        {locationState && !locationState.enabled
                          ? t("turnOnLocationToShowAMapForThisSession")
                          : t(
                              "noLocationIsCurrentlyAvailableForThisSessionCheckYourBrowsersLocationPermission"
                            )}{" "}
                        <Link href="/account/security/permissions">
                          {t("manageLocation")}
                        </Link>
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
              <div className="min-w-0">
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="size-3.5" aria-hidden="true" />
                      {t("browser")}
                    </dt>
                    <dd className="text-foreground">
                      {describeDevice(sessionLive.session.userAgent, t).browser}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Monitor className="size-3.5" aria-hidden="true" />
                      {t("operatingSystem")}
                    </dt>
                    <dd className="text-foreground">
                      {describeDevice(sessionLive.session.userAgent, t).os}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Laptop className="size-3.5" aria-hidden="true" />
                      {t("deviceType")}
                    </dt>
                    <dd className="text-foreground">
                      {sessionLive.session.userAgent
                        ? describeDevice(sessionLive.session.userAgent, t)
                            .mobile
                          ? t("mobileOrTablet")
                          : t("desktopOrOther")
                        : t("unknown")}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Network className="size-3.5" aria-hidden="true" />
                      {t("iPAddress")}
                    </dt>
                    <dd className="break-all text-foreground">
                      {sessionLive.session.ipAddress || t("unavailable")}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {t("signedIn")}
                    </dt>
                    <dd className="text-foreground">
                      {format.dateTime(
                        new Date(sessionLive.session.createdAt),
                        "dateTime"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="size-3.5" aria-hidden="true" />
                      {t("expires")}
                    </dt>
                    <dd className="text-foreground">
                      {format.dateTime(
                        new Date(sessionLive.session.expiresAt),
                        "dateTime"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {t("location")}
                    </dt>
                    <dd className="text-foreground">
                      {locationState?.enabled && locationState.location
                        ? t("locationWithinAccuracyMetres", {
                            accuracy: Math.round(
                              locationState.location.accuracyMeters
                            ),
                          })
                        : t("unavailable")}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <Collapsible className="mt-4 border-t pt-3">
              <CollapsibleTrigger
                className="data-panel-open:[&_svg]:rotate-180"
                render={<Button variant="ghost" size="sm" />}
              >
                <ChevronDown className="size-4 transition-transform" />
                {t("fullUserAgent")}
              </CollapsibleTrigger>
              <CollapsiblePanel>
                <p className="mt-2 text-sm break-all text-muted-foreground">
                  {sessionLive.session.userAgent || t("unavailable")}
                </p>
              </CollapsiblePanel>
            </Collapsible>
          </section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-medium text-foreground">
              {t("activeSessions")}
            </h3>
            {otherSessionCount > 0 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRevokeOthersOpen(true)}
              >
                {t("revokeOtherSessions")}
              </Button>
            ) : null}
          </div>
          <ul className="space-y-3">
            {[...sessions]
              .sort(
                (a, b) =>
                  Number(b.id === sessionLive.session.id) -
                  Number(a.id === sessionLive.session.id)
              )
              .map((item) => {
                const device = describeDevice(item.userAgent, t)
                const Icon = device.mobile ? Smartphone : Laptop
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <Icon
                        className="mt-0.5 size-4 shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">
                            {device.name}
                          </p>
                          {item.id === sessionLive.session.id && (
                            <Badge variant="success">
                              {t("currentSession")}
                            </Badge>
                          )}
                        </div>
                        <p>
                          {t("signedIn")}{" "}
                          {format.dateTime(
                            new Date(item.createdAt),
                            "dateTime"
                          )}
                        </p>
                        <p>
                          {t("expires")}{" "}
                          {format.dateTime(
                            new Date(item.expiresAt),
                            "dateTime"
                          )}
                        </p>
                      </div>
                    </div>
                    {item.id !== sessionLive.session.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected(item)}
                      >
                        {t("signOut")}
                      </Button>
                    )}
                  </li>
                )
              })}
          </ul>
        </div>
      )}
      <AlertDialog
        open={revokeOthersOpen}
        onOpenChange={(open) => {
          if (!open && !revokingOthers) setRevokeOthersOpen(false)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("revokeOtherSessionsConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("revokeOtherSessionsDescription", {
                count: otherSessionCount,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={revokingOthers} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button
              variant="destructive"
              disabled={revokingOthers}
              onClick={() => void revokeOthers()}
            >
              {revokingOthers ? <Spinner /> : <LogOut />}{" "}
              {revokingOthers
                ? t("revokingOtherSessions")
                : t("revokeOtherSessions")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
      <AlertDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open && !revoking) setSelected(null)
        }}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("signOutThisSessionConfirm")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("signOutSessionDescription")}
              {selected
                ? ` ${t("sessionDeviceDate", { device: describeDevice(selected.userAgent, t).name, date: format.dateTime(new Date(selected.createdAt), "dateTime") })}`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose
              render={<Button variant="outline" disabled={revoking} />}
            >
              {t("cancel")}
            </AlertDialogClose>
            <Button variant="destructive" disabled={revoking} onClick={revoke}>
              {revoking ? <Spinner /> : <LogOut />}{" "}
              {revoking ? t("signingOut") : t("signOutSession")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
