"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@loftlancer/ui/avatar";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { cn } from "@/lib/utils";

export type ProvenanceUser = {
  id: string;
  name: string;
  image?: string | null;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function ProvenanceAttribution({
  user,
  at,
  label,
  className,
  compact = false,
}: {
  user: ProvenanceUser | null | undefined;
  at: Date | string;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  if (!user) {
    // No recorded actor (seeded/imported rows, deleted users): still show
    // when it happened instead of a bare dash (#318).
    const valid = at && !Number.isNaN(new Date(at).getTime());
    return (
      <span
        className={cn(
          "text-muted-foreground",
          compact ? "text-xs" : "text-sm",
          className,
        )}
      >
        {valid ? (
          <>
            {label ? `${label} ` : null}
            <LocalDateTime value={at} showTimeOnHover />
          </>
        ) : (
          "—"
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 text-muted-foreground",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <Avatar className={cn(compact ? "size-5" : "size-6", "shrink-0")}>
        {user.image ? <AvatarImage src={user.image} alt="" /> : null}
        <AvatarFallback className={cn(compact ? "text-[8px]" : "text-[9px]")}>
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 truncate">
        {label ? <span className="text-muted-foreground">{label} </span> : null}
        <span className="text-foreground">{user.name}</span>
        <span className="text-muted-foreground">
          {" · "}
          <LocalDateTime value={at} showTimeOnHover />
        </span>
      </span>
    </div>
  );
}

export function ProvenanceDetail({
  createdBy,
  createdAt,
  updatedBy,
  updatedAt,
  className,
}: {
  createdBy?: ProvenanceUser | null;
  createdAt: Date | string;
  updatedBy?: ProvenanceUser | null;
  updatedAt: Date | string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3",
        className,
      )}
    >
      <ProvenanceAttribution
        user={createdBy}
        at={createdAt}
        label="Created by"
        compact
      />
      <ProvenanceAttribution
        user={updatedBy}
        at={updatedAt}
        label="Updated by"
        compact
      />
    </div>
  );
}
