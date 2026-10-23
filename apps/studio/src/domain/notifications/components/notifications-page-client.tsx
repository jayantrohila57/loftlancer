"use client";

import { Button } from "@loftlancer/ui/button";
import { localDayKey, localDayLabel } from "@loftlancer/ui/local-day";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { LoadingButton } from "@loftlancer/ui/patterns/loading-button";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import DashboardSection from "@/components/section-dashboard";
import { accountSettingsUrl } from "@/lib/account-url";
import { appIcons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { routes } from "@/utils/navigation";
import {
  useNotificationMutations,
  useNotificationsList,
  useNotificationsUnreadCount,
} from "../hooks/use-notifications";
import {
  NotificationListItem,
  type NotificationListItemData,
} from "./notification-list-item";

const LIST_MIN_H = "min-h-[22rem]";

/**
 * Newest-first items grouped by local calendar day. Labels and row stamps
 * (ClientRelativeTime → formatRelativeShort) share the same local-day helpers,
 * so a "Yesterday" group can never hold "Today" rows (#325).
 */
function groupByDay<T extends NotificationListItemData>(items: T[]) {
  const now = Date.now();
  const groups: { key: string; label: string; items: T[] }[] = [];
  for (const item of items) {
    const key = localDayKey(item.createdAt);
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(item);
    else
      groups.push({
        key,
        label: localDayLabel(item.createdAt, now),
        items: [item],
      });
  }
  return groups;
}

/** Mirrors NotificationListItem: size-8 icon + title line + body line. */
function NotificationRowSkeleton({ width }: { width: string }) {
  return (
    <div className="flex items-start gap-3 px-2 py-2" aria-hidden>
      <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex h-5 items-center">
          <Skeleton className={cn("h-3.5", width)} />
        </span>
        <span className="flex h-4 items-center">
          <Skeleton className="h-3 w-40" />
        </span>
      </div>
      <span className="flex h-5 w-16 shrink-0 items-center justify-end">
        <Skeleton className="h-3 w-10" />
      </span>
    </div>
  );
}

export function NotificationsPageClient() {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const unreadOnly = tab === "unread";
  const listQuery = useNotificationsList({
    unreadOnly,
    limit: 40,
    poll: true,
  });
  const unreadQuery = useNotificationsUnreadCount();
  const {
    markReadWithToast,
    markAllReadWithToast,
    isMarkingAllRead,
    isMarkingRead,
  } = useNotificationMutations();

  const items = listQuery.data?.data.items ?? [];
  const unreadCount = unreadQuery.data?.data ?? 0;
  const groups = useMemo(() => groupByDay(items), [items]);
  const firstLoad = listQuery.isPending && !listQuery.data;
  const refetching = listQuery.isPlaceholderData;

  return (
    <DashboardSection
      title="Notifications"
      description="Updates about invitations, your organizations, and project activity."
      back={routes.home()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Filter notifications"
          className="flex items-center gap-1"
        >
          <Button
            type="button"
            variant={tab === "all" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={tab === "all"}
            onClick={() => setTab("all")}
          >
            All
          </Button>
          <Button
            type="button"
            variant={tab === "unread" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={tab === "unread"}
            onClick={() => setTab("unread")}
          >
            Unread
          </Button>
        </div>
        <LoadingButton
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          loading={isMarkingAllRead}
          loadingLabel="Marking all read"
          disabled={unreadCount === 0}
          onClick={() => void markAllReadWithToast()}
          data-testid="mark-all-read"
        >
          <AppIcon name="markAllRead" className="text-current" />
          Mark all read
        </LoadingButton>
      </div>
      <div
        className={cn("relative", LIST_MIN_H)}
        aria-busy={firstLoad || refetching || undefined}
        data-testid="notifications-list"
      >
        {firstLoad ? (
          <div className="flex flex-col gap-2">
            <AccordionSection
              title={
                <>
                  <span className="sr-only">Loading notifications</span>
                  <Skeleton aria-hidden="true" className="h-3 w-20" />
                </>
              }
            >
              <div
                className="flex flex-col divide-y divide-border/60"
                aria-hidden="true"
              >
                {["w-2/3", "w-1/2", "w-3/5", "w-2/5", "w-1/2", "w-3/5"].map(
                  (w, i) => (
                    <NotificationRowSkeleton
                      key={`${w}-${String(i)}`}
                      width={w}
                    />
                  ),
                )}
              </div>
            </AccordionSection>
          </div>
        ) : listQuery.isError ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center",
              LIST_MIN_H,
            )}
          >
            <div className="space-y-1">
              <p className="font-medium text-sm">
                Could not load notifications
              </p>
              <p className="text-muted-foreground text-xs">
                Check your connection and try again.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-8"
              onClick={() => void listQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            bare
            className={cn("rounded-xl border bg-card", LIST_MIN_H)}
            data-testid="notifications-empty"
            icon={unreadOnly ? appIcons.markAllRead : appIcons.bell}
            title={unreadOnly ? "You're all caught up" : "No notifications yet"}
            description={
              unreadOnly
                ? "There are no unread notifications."
                : "When something needs your attention, it will show up here."
            }
            action={
              unreadOnly ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTab("all")}
                >
                  View all
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  render={
                    <a href={accountSettingsUrl("/settings/notifications")} />
                  }
                >
                  Notification settings
                </Button>
              )
            }
          />
        ) : (
          <div
            className={cn(
              "flex flex-col gap-2 transition-opacity motion-reduce:transition-none",
              refetching && "opacity-60",
            )}
          >
            {groups.map((g) => (
              <AccordionSection key={g.key} title={g.label}>
                <div
                  role="list"
                  aria-label={g.label}
                  className="flex flex-col divide-y divide-border/60"
                >
                  {g.items.map((item) => (
                    <NotificationListItem
                      key={item.id}
                      item={item}
                      href={item.href}
                      onClick={() => {
                        if (!item.readAt)
                          void markReadWithToast({ id: item.id }).catch(
                            () => {},
                          );
                      }}
                      onMarkRead={() => void markReadWithToast({ id: item.id })}
                      disabled={isMarkingRead}
                    />
                  ))}
                </div>
              </AccordionSection>
            ))}
          </div>
        )}
      </div>
    </DashboardSection>
  );
}
