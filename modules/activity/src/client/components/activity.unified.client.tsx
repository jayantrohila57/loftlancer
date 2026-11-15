"use client"

import { useShellNavigation } from "@features/shell"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@packages/ui/components/avatar"
import { Button } from "@packages/ui/components/button"
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@packages/ui/components/popover"
import { Skeleton } from "@packages/ui/components/skeleton"
import { Shield, User } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useState } from "react"
import type { z } from "zod"
import type {
  activityDetailOutputSchema,
  activityItemSchema,
} from "../../utils/validation/activity.events.schema"
import {
  isActivityDetailLoadFailure,
  isActivityDetailNotFound,
} from "../utils/activity.detail-load-state"

type ActivityItem = z.infer<typeof activityItemSchema>
type Detail = NonNullable<z.infer<typeof activityDetailOutputSchema>["data"]>
type Scope = "account" | "security" | "resource"

function isCrossAppActivityTarget(href: string) {
  return /^https?:\/\//i.test(href)
}

function ActivityTargetLink({
  href,
  children,
  Link,
}: {
  readonly href: string
  readonly children: ReactNode
  readonly Link: ReturnType<typeof useShellNavigation>["Link"]
}) {
  const className = "underline underline-offset-2"
  if (isCrossAppActivityTarget(href)) {
    return (
      <a href={href} className={className} rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

export function activityLabel(
  actionId: string,
  t: ReturnType<typeof useTranslations<"ui">>
) {
  switch (actionId) {
    case "account.profile.update":
      return t("profileUpdated")
    case "account.avatar.update":
      return t("avatarUpdated")
    case "account.avatar.remove":
      return t("avatarRemoved")
    case "auth.sign_in":
      return t("signInEvent")
    case "auth.sign_out":
      return t("signOutEvent")
    case "auth.session.revoke":
      return t("sessionRevokedEvent")
    case "auth.session.end":
      return t("sessionEndedEvent")
    case "security.provider.unlink":
      return t("providerDisconnected")
    case "security.provider.link":
      return t("activityProviderLinked")
    case "security.account.delete":
      return t("activityAccountDeleted")
    case "privacy.location_preference.update":
      return t("activityLocationPreference")
    case "privacy.location_history.delete":
      return t("activityLocationDeleted")
    case "preferences.regional.update":
      return t("activityRegionalUpdated")
    case "preferences.appearance.update":
      return t("activityAppearanceUpdated")
    default:
      return t("unknownEvent")
  }
}

export function ActivityDetailContent({ item }: { readonly item: Detail }) {
  const t = useTranslations("ui")
  const format = useFormatter()
  const locationBefore = item.beforeValue?.locationEnabled
  const locationAfter = item.afterValue?.locationEnabled
  return (
    <div className="min-w-56 space-y-2 text-sm">
      <p className="font-medium">{activityLabel(item.actionId, t)}</p>
      <p>
        {item.actorName ??
          (item.actorType === "system" ? t("system") : t("unknown"))}
      </p>
      <time dateTime={new Date(item.occurredAt).toISOString()}>
        {format.dateTime(new Date(item.occurredAt), "dateTime")}
      </time>
      {typeof locationBefore === "boolean" &&
        typeof locationAfter === "boolean" && (
          <p>
            {t("activityLocationChange", {
              before: locationBefore
                ? t("activityEnabled")
                : t("activityDisabled"),
              after: locationAfter
                ? t("activityEnabled")
                : t("activityDisabled"),
            })}
          </p>
        )}
      {item.ipAddress && (
        <p>
          {t("iPLabel")} {item.ipAddress}
        </p>
      )}
      {item.userAgent && (
        <p className="break-all">
          {t("userAgentLabel")} {item.userAgent}
        </p>
      )}
      {item.location && (
        <p>
          {t("activityLocation", {
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
          })}
        </p>
      )}
    </div>
  )
}

function ActivityDetailsButton({
  item,
  userId,
}: {
  readonly item: ActivityItem
  readonly userId: string
}) {
  const t = useTranslations("ui")
  const [open, setOpen] = useState(false)
  const query = useQuery({
    queryKey: ["security", "activity", userId, "detail", item.activityId],
    enabled: open,
    queryFn: () =>
      securityRpc.security.activity.detail({
        query: { activityId: item.activityId },
      }),
  })
  const detail = query.data?.status === "success" ? query.data.data : null
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button size="sm" variant="ghost" />}>
        {t("details")}
      </PopoverTrigger>
      <PopoverPopup align="start">
        {query.isPending ? (
          <Skeleton className="h-20 w-48" />
        ) : detail ? (
          <ActivityDetailContent item={detail} />
        ) : isActivityDetailNotFound(query.data) ? (
          <p className="text-sm">{t("activityEventUnavailable")}</p>
        ) : isActivityDetailLoadFailure(query.data, query.isError) ? (
          <p className="text-sm">{t("couldNotLoadActivityPleaseTryAgain")}</p>
        ) : (
          <p className="text-sm">{t("activityEventUnavailable")}</p>
        )}
      </PopoverPopup>
    </Popover>
  )
}

export function UnifiedActivityFeed({ scope }: { readonly scope?: Scope }) {
  const t = useTranslations("ui")
  const format = useFormatter()
  const { Link } = useShellNavigation()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  const [category, setCategory] = useState("")
  const [actionId, setActionId] = useState("")
  const [days, setDays] = useState(0)
  const [since, setSince] = useState<string | undefined>()
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined])
  const cursor = cursors.at(-1)
  const securityActionFilters =
    scope === "security"
      ? [
          { value: "auth.sign_in", label: t("signIns") },
          { value: "auth.sign_out", label: t("signOuts") },
          { value: "auth.session.revoke", label: t("revocations") },
          { value: "auth.session.end", label: t("otherSessionEndings") },
          {
            value: "security.provider.unlink",
            label: t("providerDisconnected"),
          },
        ]
      : []
  const categories =
    scope === "security"
      ? ["authentication", "security"]
      : scope === "account"
        ? ["account", "preferences", "privacy"]
        : scope === "resource"
          ? ["resource"]
          : [
              "account",
              "authentication",
              "security",
              "privacy",
              "preferences",
              "resource",
            ]
  const categoryLabels: Record<string, string> = {
    account: t("account"),
    authentication: t("activityAuthentication"),
    security: t("security"),
    privacy: t("activityPrivacy"),
    preferences: t("activityPreferences"),
    resource: t("resourceActivity"),
  }
  const query = useQuery({
    queryKey: [
      "security",
      "activity",
      userId,
      "feed",
      scope,
      category,
      actionId,
      since,
      cursor,
    ],
    enabled: Boolean(userId),
    queryFn: () =>
      securityRpc.security.activity.feed({
        query: {
          scope,
          category: category || undefined,
          actionId: actionId || undefined,
          since,
          cursor,
          limit: 20,
        },
      }),
  })
  const result = query.data?.status === "success" ? query.data.data : null
  const loading = sessionPending || (Boolean(userId) && query.isPending)
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["", ...categories].map((value) => (
          <Button
            key={value || "all"}
            size="sm"
            variant={category === value ? "default" : "outline"}
            onClick={() => {
              setCategory(value)
              setActionId("")
              setCursors([undefined])
            }}
          >
            {value ? categoryLabels[value] : t("allEvents")}
          </Button>
        ))}
      </div>
      {scope === "security" && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={actionId === "" ? "default" : "outline"}
              onClick={() => {
                setActionId("")
                setCursors([undefined])
              }}
            >
              {t("allEvents")}
            </Button>
            {securityActionFilters.map((entry) => (
              <Button
                key={entry.value}
                size="sm"
                variant={actionId === entry.value ? "default" : "outline"}
                onClick={() => {
                  setActionId(entry.value)
                  setCursors([undefined])
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
                          Date.now() - entry.n * 86_400_000
                        ).toISOString()
                      : undefined
                  )
                  setCursors([undefined])
                }}
              >
                {entry.label}
              </Button>
            ))}
          </div>
        </>
      )}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : query.isError || (query.data && query.data.status !== "success") ? (
        <div>
          <p role="alert">{t("couldNotLoadActivityPleaseTryAgain")}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              query.refetch().catch(() => undefined)
            }}
          >
            {t("tryAgain")}
          </Button>
        </div>
      ) : !result?.items.length ? (
        <p className="text-sm text-muted-foreground">{t("noActivityFound")}</p>
      ) : (
        <ol>
          {result.items.map((item, index) => (
            <li
              key={item.activityId}
              className="relative flex gap-3 pb-6 last:pb-0"
            >
              {index < result.items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute start-[15px] top-8 bottom-0 w-px bg-border"
                />
              )}
              <Avatar aria-hidden="true">
                <AvatarFallback>
                  {item.category === "security" ||
                  item.category === "authentication" ? (
                    <Shield className="size-4" />
                  ) : (
                    <User className="size-4" />
                  )}
                </AvatarFallback>
                {item.actorImage && (
                  <AvatarImage src={item.actorImage} alt="" />
                )}
              </Avatar>
              <div className="min-w-0 space-y-1">
                <p>
                  <span className="font-medium">
                    {item.actorName ??
                      (item.actorType === "system"
                        ? t("system")
                        : t("unknown"))}
                  </span>{" "}
                  {item.canViewTarget && item.targetUrl ? (
                    <ActivityTargetLink href={item.targetUrl} Link={Link}>
                      {activityLabel(item.actionId, t)}
                    </ActivityTargetLink>
                  ) : (
                    <span>{activityLabel(item.actionId, t)}</span>
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <time dateTime={new Date(item.occurredAt).toISOString()}>
                    {format.dateTime(new Date(item.occurredAt), "dateTime")}
                  </time>
                  <span className="rounded-md border px-1.5 py-0.5">
                    {categoryLabels[item.category] ?? item.category}
                  </span>
                  <span className="rounded-md border px-1.5 py-0.5">
                    {item.outcome === "success"
                      ? t("successOutcome")
                      : item.outcome === "unknown"
                        ? t("unknown")
                        : t("failedOutcome")}
                  </span>
                </div>
                {userId && (
                  <ActivityDetailsButton item={item} userId={userId} />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {result && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={cursors.length <= 1}
            onClick={() => setCursors((values) => values.slice(0, -1))}
          >
            {t("previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!result.nextCursor}
            onClick={() => {
              if (result.nextCursor)
                setCursors((values) => [
                  ...values,
                  result.nextCursor ?? undefined,
                ])
            }}
          >
            {t("next")}
          </Button>
        </div>
      )}
    </div>
  )
}
