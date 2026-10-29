"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { actionToast } from "@/lib/action-toast";
import { isNotificationsEnabledOnClient } from "@/lib/notifications-enabled";
import { NOTIFICATIONS_POLL_MS } from "@/module/notifications/notifications.constants";
import { trpc } from "@/utils/trpc";

function pollIntervalWhenVisible(queryStatus: string) {
  if (typeof document !== "undefined" && document.hidden) {
    return false;
  }
  return queryStatus === "error" ? false : NOTIFICATIONS_POLL_MS;
}

export function useNotificationsUnreadCount() {
  const enabled = isNotificationsEnabledOnClient();
  return useQuery({
    ...trpc.notifications.unreadCount.queryOptions(),
    enabled,
    refetchInterval: (query) => pollIntervalWhenVisible(query.state.status),
    refetchOnWindowFocus: true,
  });
}

export function useNotificationsList(options?: {
  unreadOnly?: boolean;
  limit?: number;
  poll?: boolean;
}) {
  const enabled = isNotificationsEnabledOnClient();
  const poll = options?.poll ?? false;
  return useQuery({
    ...trpc.notifications.list.queryOptions({
      limit: options?.limit ?? 15,
      unreadOnly: options?.unreadOnly,
    }),
    enabled,
    // Tab switches keep the previous list on screen (dimmed) instead of blanking.
    placeholderData: keepPreviousData,
    refetchInterval: poll
      ? (query) => pollIntervalWhenVisible(query.state.status)
      : false,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({
      queryKey: trpc.notifications.unreadCount.queryKey(),
    });
    void queryClient.invalidateQueries({
      queryKey: trpc.notifications.list.queryKey(),
    });
  };

  const markRead = useMutation(
    trpc.notifications.markRead.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  const markAllRead = useMutation(
    trpc.notifications.markAllRead.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  const syncInvitationReceived = useMutation(
    trpc.notifications.syncInvitationReceived.mutationOptions(),
  );

  const syncInvitationAccepted = useMutation(
    trpc.notifications.syncInvitationAccepted.mutationOptions({
      onSuccess: invalidate,
    }),
  );

  const markReadWithToast = (input: { id: string }) =>
    actionToast(markRead.mutateAsync(input), {
      loading: "Updating notification…",
      success: "Marked as read",
      error: "Could not update notification",
    });

  const markAllReadWithToast = () =>
    actionToast(markAllRead.mutateAsync(), {
      loading: "Marking all as read…",
      success: "All notifications marked read",
      error: "Could not mark notifications read",
    });

  return {
    markRead,
    markAllRead,
    markReadWithToast,
    markAllReadWithToast,
    syncInvitationReceived,
    syncInvitationAccepted,
    isMarkingRead: markRead.isPending,
    isMarkingAllRead: markAllRead.isPending,
  };
}
