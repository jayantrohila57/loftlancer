"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { Button } from "@loftlancer/ui/button";
import type { Route } from "next";
import Link from "next/link";
import { AppIcon } from "@/components/patterns/app-icon";
import { ClientRelativeTime } from "@/components/patterns/client-relative-time";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type NotificationListItemData = {
  id: string;
  title: string;
  body: string;
  readAt: Date | string | null;
  createdAt: Date | string;
  icon: string;
  actorUser?: {
    id: string;
    name: string;
    image?: string | null;
  } | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function resolveIcon(icon: string): AppIconName {
  if (icon === "invite" || icon === "member" || icon === "variable") {
    return icon;
  }
  return "organization";
}

const notificationRowContentClass =
  "flex min-w-0 flex-1 flex-col gap-0.5 text-start outline-none before:absolute before:inset-0 before:rounded-md focus-visible:before:ring-2 focus-visible:before:ring-ring disabled:cursor-default";

/** Ghost Button overrides so multi-line rows are not clipped (#253, #38). */
export const notificationRowButtonClass = cn(
  notificationRowContentClass,
  "static h-auto min-h-0 shrink items-stretch justify-start whitespace-normal border-0 border-transparent bg-transparent px-0 py-0 font-normal shadow-none before:pointer-events-auto hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 data-pressed:bg-transparent sm:h-auto",
);

/**
 * Notification row after ReUI c-item-12 (activity feed item: avatar media,
 * title, muted description, trailing relative time) inside the Sheet 7
 * notifications feed pattern. Dense: two fixed lines (title, then one muted
 * line of sender + message), trailing time + unread dot. A per-row
 * "Mark read" action swaps in over the time on hover/focus in the same fixed
 * slot, so nothing shifts.
 */
export function NotificationListItem({
  item,
  href,
  onClick,
  onMarkRead,
  compact = false,
  disabled = false,
}: {
  item: NotificationListItemData;
  /** Entity page; renders a real link (cmd-click opens a new tab). */
  href?: string | null;
  onClick?: () => void;
  onMarkRead?: () => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const unread = !item.readAt;
  const actor = item.actorUser;
  const canMarkRead = unread && Boolean(onMarkRead);

  return (
    <div
      role="listitem"
      data-slot="notification-row"
      data-unread={unread || undefined}
      className={cn(
        "group/notif relative flex min-w-0 items-start gap-3 rounded-md px-2 transition-colors hover:bg-accent/60 has-focus-visible:bg-accent/60",
        compact ? "py-2" : "py-2.5",
        unread && "bg-muted/30",
      )}
    >
      <span className="relative mt-0.5 shrink-0">
        {actor ? (
          <Avatar className="size-8">
            {actor.image ? <AvatarImage src={actor.image} alt="" /> : null}
            <AvatarFallback className="text-[10px]">
              {initials(actor.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="flex size-8 items-center justify-center rounded-full border border-border/60 bg-card">
            <AppIcon name={resolveIcon(item.icon)} className="size-4" />
          </span>
        )}
      </span>

      {href ? (
        <Link
          href={href as Route}
          onClick={onClick}
          className={notificationRowContentClass}
        >
          <span
            className={cn(
              "truncate text-sm leading-5",
              unread ? "font-medium" : "text-foreground/90",
            )}
          >
            {item.title}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs leading-4">
            {actor ? (
              <>
                <span className="max-w-[40%] shrink-0 truncate text-muted-foreground">
                  {actor.name}
                </span>
                <span aria-hidden>·</span>
              </>
            ) : null}
            <span className="min-w-0 truncate" title={item.body}>
              {item.body}
            </span>
          </span>
        </Link>
      ) : (
        <Button
          variant="ghost"
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={notificationRowButtonClass}
        >
          <span
            className={cn(
              "truncate text-sm leading-5",
              unread ? "font-medium" : "text-foreground/90",
            )}
          >
            {item.title}
          </span>
          <span className="flex min-w-0 items-center gap-1 text-muted-foreground text-xs leading-4">
            {actor ? (
              <>
                <span className="max-w-[40%] shrink-0 truncate text-muted-foreground">
                  {actor.name}
                </span>
                <span aria-hidden>·</span>
              </>
            ) : null}
            <span className="min-w-0 truncate" title={item.body}>
              {item.body}
            </span>
          </span>
        </Button>
      )}

      {/* Fixed-width trailing slot: time + dot, or the mark-read action. */}
      <span className="relative flex h-5 w-16 shrink-0 items-center justify-end gap-1.5">
        <span
          className={cn(
            "text-muted-foreground text-xs tabular-nums transition-opacity",
            canMarkRead &&
              "group-focus-within/notif:opacity-0 group-hover/notif:opacity-0",
          )}
        >
          <ClientRelativeTime value={item.createdAt} />
        </span>
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            unread ? "bg-primary" : "bg-transparent",
          )}
          aria-hidden
        />
        {canMarkRead ? (
          <Button
            variant="ghost"
            size="xs"
            type="button"
            onClick={onMarkRead}
            disabled={disabled}
            aria-label={`Mark "${item.title}" as read`}
            className="pointer-events-none absolute inset-y-0 end-0 z-10 h-auto gap-1 border-transparent px-1.5 font-normal text-muted-foreground text-xs opacity-0 shadow-none transition-opacity hover:bg-background hover:text-foreground focus-visible:pointer-events-auto focus-visible:opacity-100 group-hover/notif:pointer-events-auto group-hover/notif:opacity-100 sm:h-auto"
          >
            <AppIcon name="markAllRead" className="size-3.5" />
            Read
          </Button>
        ) : null}
      </span>
    </div>
  );
}
