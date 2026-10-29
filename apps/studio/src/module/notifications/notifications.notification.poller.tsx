"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { withBasePath } from "@/lib/base-path";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { toast } from "@/lib/toast";
import { NOTIFICATIONS_POLL_MS } from "@/module/notifications/notifications.constants";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

const MAX_TOASTS = 3;

export function NotificationPoller() {
  const enabled = isNotificationsEnabledOnClient();
  const queryClient = useQueryClient();
  const seenIdsRef = useRef<Set<string> | null>(null);

  const listQuery = useQuery({
    ...trpc.notifications.list.queryOptions({ limit: 10 }),
    enabled,
    refetchInterval: () => {
      if (typeof document !== "undefined" && document.hidden) {
        return false;
      }
      return NOTIFICATIONS_POLL_MS;
    },
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!enabled || !listQuery.data?.data.items) {
      return;
    }

    const items = listQuery.data.data.items;
    if (!seenIdsRef.current) {
      seenIdsRef.current = new Set(items.map((item) => item.id));
      return;
    }

    const newcomers = items.filter(
      (item) => !seenIdsRef.current?.has(item.id) && !item.readAt,
    );

    if (newcomers.length > 0) {
      void queryClient.invalidateQueries({
        queryKey: trpc.notifications.unreadCount.queryKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: trpc.notifications.list.queryKey(),
      });
    }

    for (const item of newcomers.slice(0, MAX_TOASTS)) {
      const href = item.href;
      toast(item.title, {
        description: item.body,
        ...(href
          ? {
              action: {
                label: "View",
                onClick: () => {
                  window.location.assign(withBasePath(href));
                },
              },
            }
          : {}),
      });
      seenIdsRef.current.add(item.id);
    }

    if (newcomers.length > MAX_TOASTS) {
      toast(`${newcomers.length - MAX_TOASTS} more notifications`, {
        action: {
          label: "View all",
          onClick: () => {
            window.location.assign(withBasePath(routes.notifications()));
          },
        },
      });
    }

    for (const item of items) {
      seenIdsRef.current.add(item.id);
    }
  }, [enabled, listQuery.data, queryClient]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const onFocus = () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.notifications.unreadCount.queryKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: trpc.notifications.list.queryKey(),
      });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [enabled, queryClient]);

  return null;
}
