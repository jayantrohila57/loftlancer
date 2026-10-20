"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@loftlancer/ui/menu";
import { CountBadge } from "@loftlancer/ui/patterns/count-badge";
import { LoadingButton } from "@loftlancer/ui/patterns/loading-button";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { routes } from "@loftlancer/ui/studio-routes";
import { headerIconButtonClassName } from "@loftlancer/ui/utils";
import { AppIcon } from "@/components/patterns/app-icon";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { studioDashboardPath } from "@/lib/studio-url";
import { cn } from "@/lib/utils";
import {
  useNotificationMutations,
  useNotificationsList,
  useNotificationsUnreadCount,
} from "../hooks/use-notifications";
import { NotificationListItem } from "./notification-list-item";

/**
 * Same header bell as studio (#319). Notification links point into studio,
 * so they are absolute studio URLs here.
 */
export function NotificationBell() {
  const enabled = isNotificationsEnabledOnClient();
  const unreadQuery = useNotificationsUnreadCount();
  const listQuery = useNotificationsList({ limit: 10, poll: true });
  const {
    markReadWithToast,
    markAllReadWithToast,
    isMarkingAllRead,
    isMarkingRead,
  } = useNotificationMutations();

  if (!enabled) {
    return null;
  }

  const unread = unreadQuery.data?.data ?? 0;
  const items = listQuery.data?.data.items ?? [];

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={cn("relative", headerIconButtonClassName)}
            aria-label={
              unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
            }
          />
        }
      >
        <AppIcon name="bell" className="text-foreground" />
        <CountBadge
          count={unread}
          tone="primary"
          className="absolute -end-1.5 -top-1.5 ring-2 ring-background"
        />
      </MenuTrigger>
      <MenuPopup align="end" className="w-[min(100vw-2rem,24rem)] p-2">
        {/* Header after ReUI Sheet 7: title + mark all read.
            The action is always rendered (disabled at 0) so nothing reflows. */}
        <div className="flex h-8 items-center justify-between gap-2 px-1 pb-1">
          <span className="font-medium text-sm">Notifications</span>
          <LoadingButton
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            loading={isMarkingAllRead}
            loadingLabel="Updating…"
            disabled={unread === 0}
            onClick={() => void markAllReadWithToast()}
          >
            Mark all read
          </LoadingButton>
        </div>
        <div
          role="list"
          className="flex h-80 flex-col divide-y divide-border/60 overflow-y-auto overflow-x-hidden"
        >
          {listQuery.isError ? (
            <p className="px-2 py-6 text-center text-muted-foreground text-sm">
              Could not load notifications. Try again shortly.
            </p>
          ) : listQuery.isLoading ? (
            <>
              <span className="sr-only">Loading…</span>
              {["w-2/3", "w-1/2", "w-3/5", "w-2/5", "w-1/2"].map((w, i) => (
                <div
                  key={`${w}-${String(i)}`}
                  className="flex items-start gap-3 px-2 py-2"
                  aria-hidden
                >
                  <Skeleton className="mt-0.5 size-8 shrink-0 rounded-full" />
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex h-5 items-center">
                      <Skeleton className={cn("h-3.5", w)} />
                    </span>
                    <span className="flex h-4 items-center">
                      <Skeleton className="h-3 w-32" />
                    </span>
                  </div>
                  <span className="flex h-5 w-16 shrink-0 items-center justify-end">
                    <Skeleton className="h-3 w-10" />
                  </span>
                </div>
              ))}
            </>
          ) : items.length === 0 ? (
            <p className="flex flex-1 items-center justify-center px-2 text-center text-muted-foreground text-sm">
              {unread > 0
                ? "Unread notifications could not be displayed."
                : "You're all caught up."}
            </p>
          ) : (
            items.map((item) => (
              <NotificationListItem
                key={item.id}
                item={item}
                compact
                href={item.href ? studioDashboardPath(item.href) : null}
                onClick={() => {
                  if (!item.readAt)
                    void markReadWithToast({ id: item.id }).catch(() => {});
                }}
                onMarkRead={() => void markReadWithToast({ id: item.id })}
                disabled={isMarkingRead}
              />
            ))
          )}
        </div>
        <MenuSeparator />
        <MenuItem
          render={<a href={studioDashboardPath(routes.notifications())} />}
        >
          View all
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
