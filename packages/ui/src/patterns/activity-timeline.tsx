"use client";

import { formatActionLabel } from "@loftlancer/actions";
import { ChevronDown } from "lucide-react";
import { type ComponentType, type ReactNode, useId } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import { Switch } from "../components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { useHydrated } from "../hooks/use-hydrated";
import { formatDate, formatDateTime } from "../lib/format-date";
import { localDayKey, localDayLabel } from "../lib/local-day";
import { cn } from "../lib/utils";
import { PageHeaderActionsPortal } from "./page-header";
import { SearchableCombobox } from "./searchable-combobox";
import { SettingsAvatar } from "./settings-frame";

/**
 * Activity feed in the style of ReUI timeline-3 ("Finance Activity"), built on
 * our shadcn primitives: avatar nodes on a vertical connector, "Actor verb
 * target" rows, one-line detail, relative time (absolute in a tooltip),
 * category + result badges, day-group headers, filters and load-more.
 * Shared by account Activity (auth) and org Activity (studio).
 */

export type ActivityResult = "success" | "failure" | "denied";

export type ActivityItem = {
  id: string;
  actor: { name: string; image?: string | null };
  verb: string;
  target?: { label: string; href?: string | null } | null;
  detail?: string | null;
  createdAt: Date | string;
  category: string;
  result: ActivityResult;
};

/** Raw audit_event row shape returned by `auditEvents.list`. */
export type AuditEventRow = {
  id: string;
  action: string;
  result: string;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorImage?: string | null;
  projectId: string | null;
  projectName: string | null;
  projectSlug: string | null;
  /** Org the event belongs to; project links are /[org]/[project]. */
  organizationSlug?: string | null;
  entityType: string | null;
  entitySlug: string | null;
  targetUserId: string | null;
  targetUserName?: string | null;
  denialReason: string | null;
  errorCode: string | null;
  createdAt: Date | string;
};

const PAST: Record<string, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
  restore: "restored",
  invite: "invited",
  remove: "removed",
  add: "added",
  accept: "accepted",
  reject: "rejected",
  cancel: "cancelled",
  reveal: "revealed",
  export: "exported",
  import: "imported",
  sign_in: "signed in",
  sign_out: "signed out",
  set_role: "changed the role of",
  transfer_ownership: "transferred ownership of",
  revoke: "revoked",
  rotate: "rotated",
  mark_read: "marked as read",
  leave: "left",
  switch: "switched",
  read: "read",
  view: "viewed",
  list: "listed",
};

function words(s: string) {
  return s.replace(/[_.]/g, " ").trim();
}

/** Map an audit row to a timeline item. `projectHref(slug, orgSlug)` builds app links. */
export function auditRowToActivityItem(
  row: AuditEventRow,
  opts: {
    projectHref: (slug: string, orgSlug: string | null) => string | null;
    memberHref?: (userId: string) => string | null;
  },
): ActivityItem {
  const parts = row.action.split(".");
  const category = parts[0] ?? "event";
  const last = parts[parts.length - 1] ?? "";
  const noun = words(parts.slice(0, -1).join(" "));
  const pastVerb = PAST[last];
  const verb = pastVerb
    ? category === "session"
      ? pastVerb
      : `${pastVerb} ${noun}`.trim()
    : formatActionLabel(row.action);

  let target: ActivityItem["target"] = null;
  if (row.projectSlug) {
    const label =
      (category === "environment" || category === "variable") && row.entitySlug
        ? `${row.projectName ?? row.projectSlug} / ${row.entitySlug}`
        : (row.projectName ?? row.projectSlug);
    target = {
      label,
      href: opts.projectHref(row.projectSlug, row.organizationSlug ?? null),
    };
  } else if (row.targetUserId) {
    target = {
      label: row.targetUserName ?? row.entitySlug ?? "member",
      href: opts.memberHref?.(row.targetUserId) ?? null,
    };
  } else if (row.entitySlug && category !== "session") {
    target = { label: row.entitySlug, href: null };
  }

  const result: ActivityResult =
    row.result === "failure" || row.result === "denied"
      ? row.result
      : "success";
  const detail =
    result === "failure"
      ? `Failed${row.errorCode ? `: ${row.errorCode}` : ""}`
      : result === "denied"
        ? `Denied${row.denialReason ? `: ${words(row.denialReason)}` : ""}`
        : row.entityType && row.entityType !== category
          ? words(row.entityType)
          : null;

  return {
    id: row.id,
    actor: {
      name: row.actorName ?? row.actorEmail ?? "Unknown user",
      image: row.actorImage ?? null,
    },
    verb,
    target,
    detail,
    createdAt: row.createdAt,
    category: words(category),
    result,
  };
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
export function formatRelative(date: Date, now = Date.now()) {
  const diff = (date.getTime() - now) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diff / 3600), "hour");
  if (abs < 86_400 * 30) return rtf.format(Math.round(diff / 86_400), "day");
  return formatDate(date);
}

/**
 * Items grouped by calendar day. Local days once hydrated; the server and
 * the hydration pass group by UTC day (deterministic) with hidden labels, so
 * there is no mismatch and no label in the wrong timezone (#325, #327).
 */
export function groupByDay(items: ActivityItem[], utc = false) {
  const now = Date.now();
  const groups: { key: string; label: string; items: ActivityItem[] }[] = [];
  for (const item of items) {
    const key = localDayKey(item.createdAt, utc);
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else
      groups.push({
        key,
        label: utc ? "" : localDayLabel(item.createdAt, now, "long"),
        items: [item],
      });
  }
  return groups;
}

const resultVariant = {
  success: "success",
  failure: "error",
  denied: "warning",
} as const;

type LinkLike = ComponentType<{
  href: string;
  className?: string;
  children: ReactNode;
}>;

/** Mirrors ActivityRow 1:1 (avatar, sentence line, meta line, connector). */
function ActivityRowSkeleton({
  isLast,
  width,
}: {
  isLast: boolean;
  width: string;
}) {
  return (
    <li className="relative flex gap-3 pb-6 last:pb-0" aria-hidden>
      {!isLast ? (
        <span className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-border" />
      ) : null}
      <Skeleton className="z-10 size-8 shrink-0 rounded-full ring-4 ring-background motion-reduce:animate-none" />
      <div className="min-w-0 flex-1 space-y-1 pt-1">
        <Skeleton className={cn("h-4 motion-reduce:animate-none", width)} />
        <Skeleton className="h-3 w-24 motion-reduce:animate-none" />
      </div>
    </li>
  );
}

const SKELETON_WIDTHS = ["w-2/3", "w-1/2", "w-3/5", "w-2/5", "w-1/2"];

function ActivityRow({
  item,
  LinkComponent,
  isLast,
  hydrated,
}: {
  item: ActivityItem;
  LinkComponent?: LinkLike;
  isLast: boolean;
  /** Relative time depends on the viewer's clock: render it after hydration. */
  hydrated: boolean;
}) {
  const date = new Date(item.createdAt);
  const L = LinkComponent;
  const target = item.target;
  return (
    <li
      className="relative flex gap-3 pb-6 last:pb-0"
      data-testid="activity-row"
    >
      {!isLast ? (
        <span
          aria-hidden
          className="absolute top-8 bottom-0 left-[0.9375rem] w-px bg-border"
        />
      ) : null}
      <SettingsAvatar
        src={item.actor.image}
        name={item.actor.name}
        className="z-10 size-8 text-xs ring-4 ring-background"
      />
      <div className="min-w-0 flex-1 space-y-1 pt-1">
        <p className="text-sm leading-snug">
          <span className="font-medium">{item.actor.name}</span>{" "}
          <span className="text-muted-foreground">{item.verb}</span>
          {target ? (
            <>
              {" "}
              {target.href ? (
                L ? (
                  <L
                    href={target.href}
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    {target.label}
                  </L>
                ) : (
                  <a
                    href={target.href}
                    className="font-medium underline underline-offset-4 hover:text-primary"
                  >
                    {target.label}
                  </a>
                )
              ) : (
                <span className="font-medium">{target.label}</span>
              )}
            </>
          ) : null}
        </p>
        {item.detail ? (
          <p className="truncate text-muted-foreground text-xs">
            {item.detail}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-muted-foreground text-xs">
          <Tooltip>
            <TooltipTrigger
              render={
                <time
                  dateTime={date.toISOString()}
                  className={cn("cursor-default", !hydrated && "invisible")}
                />
              }
            >
              {hydrated ? formatRelative(date) : "just now"}
            </TooltipTrigger>
            <TooltipContent>{formatDateTime(date)}</TooltipContent>
          </Tooltip>
          <Badge variant="outline" size="sm" className="gap-1 capitalize">
            <span aria-hidden className="size-1.5 rounded-full bg-primary/70" />
            {item.category}
          </Badge>
          <Badge
            variant={resultVariant[item.result]}
            size="sm"
            className="capitalize"
            data-testid="activity-result"
          >
            {item.result}
          </Badge>
        </div>
      </div>
    </li>
  );
}

export type ActivityFilterOption = { value: string; label: string };

function mergeFilterOptions(
  rows: AuditEventRow[],
  seen: ActivityFilterOption[],
  selected: string,
  pick: (row: AuditEventRow) => string | null | undefined,
  label: (value: string, row: AuditEventRow) => string,
): ActivityFilterOption[] {
  const byValue = new Map<string, string>();
  for (const { value, label: seenLabel } of seen) {
    byValue.set(value, seenLabel);
  }
  for (const row of rows) {
    const value = pick(row);
    if (!value) continue;
    byValue.set(value, label(value, row));
  }
  if (selected && !byValue.has(selected)) {
    const row = rows.find((r) => pick(r) === selected);
    byValue.set(selected, row ? label(selected, row) : selected);
  }
  return [...byValue.entries()]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, lbl]) => ({ value, label: lbl }));
}

export function auditActionFilterOptions(
  rows: AuditEventRow[],
  seen: ActivityFilterOption[],
  selected: string,
): ActivityFilterOption[] {
  const codes = mergeFilterOptions(
    rows,
    seen,
    selected,
    (r) => r.action,
    (value) => formatActionLabel(value),
  );
  return codes;
}

export function auditActorFilterOptions(
  rows: AuditEventRow[],
  seen: ActivityFilterOption[],
  selected: string,
): ActivityFilterOption[] {
  return mergeFilterOptions(
    rows,
    seen,
    selected,
    (r) => r.actorUserId,
    (_value, row) =>
      row.actorName ?? row.actorEmail ?? row.actorUserId ?? "Unknown user",
  );
}

export function auditProjectFilterOptions(
  rows: AuditEventRow[],
  seen: ActivityFilterOption[],
  selected: string,
): ActivityFilterOption[] {
  return mergeFilterOptions(
    rows,
    seen,
    selected,
    (r) => r.projectId,
    (_value, row) =>
      row.projectName ?? row.projectSlug ?? row.projectId ?? "Project",
  );
}

const ALL = "__all";
const RESULT_OPTIONS = [
  { value: ALL, label: "All results" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
  { value: "denied", label: "Denied" },
];

export function ActivityTimeline({
  title,
  description,
  items,
  actionOptions,
  action,
  onActionChange,
  actorOptions,
  actor,
  onActorChange,
  projectOptions,
  project,
  onProjectChange,
  includePassive,
  onIncludePassiveChange,
  result,
  onResultChange,
  hasMore,
  onLoadMore,
  loadingMore,
  loading,
  empty,
  toolbar,
  LinkComponent,
  className,
  filtersInHeader = false,
}: {
  /** Render the filters in the page header's actions slot. */
  filtersInHeader?: boolean;
  title?: string;
  description?: string;
  items: ActivityItem[];
  actionOptions: ActivityFilterOption[];
  action: string;
  onActionChange: (value: string) => void;
  actorOptions?: ActivityFilterOption[];
  actor?: string;
  onActorChange?: (value: string) => void;
  projectOptions?: ActivityFilterOption[];
  project?: string;
  onProjectChange?: (value: string) => void;
  /** When set, shows a toggle to include passive read/view audit events. */
  includePassive?: boolean;
  onIncludePassiveChange?: (value: boolean) => void;
  result: ActivityResult | "";
  onResultChange: (value: ActivityResult | "") => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  loading?: boolean;
  empty?: ReactNode;
  toolbar?: ReactNode;
  LinkComponent?: LinkLike;
  className?: string;
}) {
  const hydrated = useHydrated();
  const includePassiveToggleId = useId();
  const groups = groupByDay(items, !hydrated);
  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <SearchableCombobox
        ariaLabel="Filter by action"
        className="w-44"
        value={action || ALL}
        onChange={(v) => onActionChange(v === ALL ? "" : v)}
        searchPlaceholder="Search actions…"
        options={[{ value: ALL, label: "All actions" }, ...actionOptions]}
      />
      {actorOptions && onActorChange ? (
        <SearchableCombobox
          ariaLabel="Filter by actor"
          className="w-40"
          value={actor || ALL}
          onChange={(v) => onActorChange(v === ALL ? "" : v)}
          searchPlaceholder="Search people…"
          options={[{ value: ALL, label: "All actors" }, ...actorOptions]}
        />
      ) : null}
      {projectOptions && onProjectChange ? (
        <SearchableCombobox
          ariaLabel="Filter by project"
          className="w-40"
          value={project || ALL}
          onChange={(v) => onProjectChange(v === ALL ? "" : v)}
          searchPlaceholder="Search projects…"
          options={[{ value: ALL, label: "All projects" }, ...projectOptions]}
        />
      ) : null}
      <SearchableCombobox
        ariaLabel="Filter by result"
        className="w-36"
        value={result || ALL}
        onChange={(v) => onResultChange(v === ALL ? "" : (v as ActivityResult))}
        searchPlaceholder="Search results…"
        options={RESULT_OPTIONS}
      />
      {onIncludePassiveChange ? (
        <div className="inline-flex h-8 items-center gap-2 rounded-md border border-border/60 px-2.5 text-sm">
          <Switch
            id={includePassiveToggleId}
            checked={includePassive ?? false}
            onCheckedChange={onIncludePassiveChange}
          />
          <Label
            htmlFor={includePassiveToggleId}
            className="text-muted-foreground text-sm"
          >
            Show views & reads
          </Label>
        </div>
      ) : null}
      {toolbar}
    </div>
  );
  return (
    <TooltipProvider delay={150}>
      <section
        className={cn("w-full min-w-0 space-y-4", className)}
        data-testid="activity-timeline"
      >
        {filtersInHeader ? (
          <PageHeaderActionsPortal>{filters}</PageHeaderActionsPortal>
        ) : null}
        {title || !filtersInHeader ? (
          <div className="flex flex-wrap items-end justify-between gap-3">
            {title ? (
              <div className="space-y-0.5">
                <h2 className="font-semibold text-base">{title}</h2>
                {description ? (
                  <p className="text-muted-foreground text-sm">{description}</p>
                ) : null}
              </div>
            ) : (
              <span />
            )}
            {filtersInHeader ? null : filters}
          </div>
        ) : null}

        {loading && items.length === 0 ? (
          <div className="min-h-80 space-y-3" aria-busy="true">
            <span className="sr-only">Loading…</span>
            <Skeleton className="h-3 w-20 motion-reduce:animate-none" />
            <ol className="relative">
              {SKELETON_WIDTHS.map((w, i) => (
                <ActivityRowSkeleton
                  key={w + String(i)}
                  width={w}
                  isLast={i === SKELETON_WIDTHS.length - 1}
                />
              ))}
            </ol>
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-80 flex-col justify-center">{empty}</div>
        ) : (
          <div
            className={cn(
              "min-h-80 space-y-6 transition-opacity motion-reduce:transition-none",
              loading && "opacity-60",
            )}
            aria-busy={loading || undefined}
          >
            {groups.map((g, index) => (
              <details
                key={g.key}
                className="group overflow-hidden rounded-xl border bg-card"
                open={index === 0}
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 font-medium text-sm marker:hidden hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                  <span className="text-muted-foreground text-xs uppercase tracking-wide">
                    {g.label}
                  </span>
                  <span className="flex items-center gap-2 text-muted-foreground text-xs">
                    {g.items.length} {g.items.length === 1 ? "event" : "events"}
                    <ChevronDown
                      aria-hidden
                      className="size-4 transition-transform group-open:rotate-180"
                    />
                  </span>
                </summary>
                <ol className="relative border-t px-4 pt-3">
                  {g.items.map((item, i) => (
                    <ActivityRow
                      key={item.id}
                      item={item}
                      LinkComponent={LinkComponent}
                      isLast={i === g.items.length - 1}
                      hydrated={hydrated}
                    />
                  ))}
                </ol>
              </details>
            ))}
            {hasMore ? (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  loading={loadingMore}
                >
                  Load more
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </TooltipProvider>
  );
}
