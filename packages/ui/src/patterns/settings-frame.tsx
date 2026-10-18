"use client";

import { Check, Copy } from "lucide-react";
import type React from "react";
import { type ReactNode, useState } from "react";
import { formatDate } from "../lib/format-date";
import {
  pageHeaderTabActiveClass,
  pageHeaderTabClass,
  pageHeaderTabInactiveClass,
  pageHeaderTabsListClass,
  pageHeaderTabsRowClass,
} from "../lib/page-header-classes";
import { cn } from "../lib/utils";
import {
  PageHeaderBackLink,
  PageHeaderLayout,
  PageHeaderTabsRow,
} from "./page-header";

/**
 * Settings page frame: blends ReUI form-5 (centered container, back link,
 * identity row, line tabs, sticky right rail) with profile-2 (H2 + description
 * sections of hairline-separated label/control rows). Rebuilt from our own
 * shadcn primitives; no ReUI source is used.
 */

type LinkLike = React.ElementType<{
  href: string;
  className?: string;
  children?: ReactNode;
  "aria-current"?: "page";
}>;

export type SettingsTab = {
  href: string;
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
};

export function SettingsAvatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name?: string | null;
  className?: string;
}) {
  const initials =
    (name ?? "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  return (
    <span
      className={cn(
        "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium text-muted-foreground text-sm",
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export function SettingsTabs({
  tabs,
  LinkComponent = "a",
}: {
  tabs: SettingsTab[];
  LinkComponent?: LinkLike | "a";
}) {
  const L = LinkComponent as React.ElementType;
  return (
    <div className={pageHeaderTabsRowClass} data-slot="page-header-tabs">
      <nav aria-label="Sections" className={pageHeaderTabsListClass}>
        {tabs.length === 0 ? (
          <span
            aria-current="page"
            className={cn(pageHeaderTabClass, pageHeaderTabActiveClass)}
          >
            All
          </span>
        ) : null}
        {tabs.map((tab) =>
          tab.disabled ? (
            <span
              key={tab.href}
              aria-disabled="true"
              className={pageHeaderTabClass}
            >
              {tab.icon}
              {tab.label}
            </span>
          ) : (
            <L
              key={tab.href}
              href={tab.href}
              aria-current={tab.active ? "page" : undefined}
              className={cn(
                pageHeaderTabClass,
                tab.active
                  ? pageHeaderTabActiveClass
                  : pageHeaderTabInactiveClass,
              )}
            >
              {tab.icon}
              {tab.label}
            </L>
          ),
        )}
      </nav>
    </div>
  );
}

export type SettingsFrameProps = {
  back?: { href: string; label: string };
  avatar?: { src?: string | null; name?: string | null };
  title: ReactNode;
  subtitle?: ReactNode;
  /** Owner name shown in the meta row next to the avatar. */
  identity?: ReactNode;
  description?: ReactNode;
  /** Meta row content (badges, links); defaults to `subtitle`. */
  meta?: ReactNode;
  actions?: ReactNode;
  tabs?: SettingsTab[];
  LinkComponent?: LinkLike | "a";
  /** Full-width block under the tabs (e.g. activity heatmap). */
  top?: ReactNode;
  /** Sticky right rail (audit rail, health). */
  aside?: ReactNode;
  children: ReactNode;
};

export function SettingsFrame({
  back,
  avatar,
  title,
  subtitle,
  identity,
  description,
  meta,
  actions,
  tabs,
  LinkComponent = "a",
  top,
  aside,
  children,
}: SettingsFrameProps) {
  const metaContent =
    meta ??
    (avatar || identity || subtitle ? (
      <span className="flex min-w-0 items-center gap-1.5">
        {avatar ? (
          <SettingsAvatar
            src={avatar.src}
            name={avatar.name}
            className="size-5 text-[9px]"
          />
        ) : null}
        {identity ? (
          <span className="truncate font-medium text-foreground">
            {identity}
          </span>
        ) : null}
        {subtitle ? (
          <span className="truncate font-mono">{subtitle}</span>
        ) : null}
      </span>
    ) : null);
  return (
    <div data-testid="settings-frame" className="w-full min-w-0 space-y-6">
      <PageHeaderLayout
        back={
          <PageHeaderBackLink href={back?.href} LinkComponent={LinkComponent} />
        }
        title={title}
        description={description}
        actions={actions}
        meta={metaContent}
        tabs={
          <PageHeaderTabsRow
            LinkComponent={LinkComponent}
            tabs={(tabs ?? []).map((t) => ({
              value: t.href,
              href: t.href,
              label: (
                <>
                  {t.icon}
                  {t.label}
                </>
              ),
              disabled: t.disabled,
            }))}
            activeTab={tabs?.find((t) => t.active)?.href}
          />
        }
      />
      {top}
      {aside ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="min-w-0 space-y-8">{children}</div>
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {aside}
          </aside>
        </div>
      ) : (
        <div className="min-w-0 space-y-8">{children}</div>
      )}
    </div>
  );
}

export function SettingsSection({
  title,
  description,
  actions,
  children,
  bare = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** Skip the bordered card (content brings its own, e.g. a table). */
  bare?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-base">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-sm">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {bare ? (
        children
      ) : (
        <div className="divide-y rounded-xl border bg-card text-card-foreground">
          {children}
        </div>
      )}
    </section>
  );
}

export function SettingsRow({
  label,
  helper,
  children,
}: {
  label: ReactNode;
  helper?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 sm:w-55 sm:shrink-0">
        <div className="font-medium text-sm">{label}</div>
        {helper ? (
          <div className="text-muted-foreground text-xs">{helper}</div>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label="Copy"
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

/** `copy` applies to string values only (ids, slugs). */
export type RailItem = { label: string; value: ReactNode; copy?: boolean };

export function SettingsRailCard({
  title,
  items,
  children,
}: {
  title: string;
  items?: RailItem[];
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 text-card-foreground">
      <div className="mb-3 font-medium text-sm">{title}</div>
      {items?.length ? (
        <dl className="space-y-3">
          {items.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-muted-foreground text-xs">{item.label}</dt>
              <dd className="flex items-center gap-1">
                <span className="truncate font-mono text-xs">{item.value}</span>
                {item.copy && typeof item.value === "string" ? (
                  <CopyButton value={item.value} />
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {children}
    </div>
  );
}

/* ---------- Activity heatmap (GitHub-style, 53 week columns) ---------- */

export type HeatmapDay = { date: string; count: number };

function level(count: number, max: number) {
  if (count <= 0) return 0;
  if (max <= 4) return Math.min(4, count);
  return Math.min(4, Math.ceil((count / max) * 4));
}

const levelClass = [
  "bg-muted",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-300",
];

export function computeStreaks(days: HeatmapDay[]) {
  const active = new Set(days.filter((d) => d.count > 0).map((d) => d.date));
  let longest = 0;
  let run = 0;
  const sorted = [...active].sort();
  let prev: number | null = null;
  for (const date of sorted) {
    const t = Date.parse(`${date}T00:00:00Z`);
    run = prev !== null && t - prev === 86_400_000 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = t;
  }
  return { activeDays: active.size, longestStreak: longest };
}

export function ActivityHeatmap({
  year,
  days,
}: {
  year: number;
  days: HeatmapDay[];
}) {
  const counts = new Map(days.map((d) => [d.date, d.count]));
  const max = days.reduce((m, d) => Math.max(m, d.count), 0);
  const start = new Date(Date.UTC(year, 0, 1));
  const startDow = start.getUTCDay();
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const cells: ({ date: string; count: number } | null)[] = Array.from(
    { length: startDow },
    () => null,
  );
  for (let t = start.getTime(); t < end.getTime(); t += 86_400_000) {
    const date = new Date(t).toISOString().slice(0, 10);
    cells.push({ date, count: counts.get(date) ?? 0 });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  // Month label sits above the first week column that contains the 1st of that month.
  const monthLabels = weeks.map((week) => {
    const first = week.find((c) => c?.date.endsWith("-01"));
    return first
      ? new Date(`${first.date}T00:00:00Z`).toLocaleString("en", {
          month: "short",
          timeZone: "UTC",
        })
      : "";
  });

  // Stable keys: a week is identified by its first dated cell; padding cells by position in the trailing week.
  const weekRows = weeks.map((week, wi) => {
    const id = week.find((c) => c !== null)?.date ?? `pad-week-${wi}`;
    return {
      id,
      label: monthLabels[wi],
      cells: week.map((cell, di) => ({
        id: cell?.date ?? `${id}-pad-${di}`,
        cell,
      })),
    };
  });

  return (
    <div className="overflow-x-auto" data-testid="activity-heatmap">
      <div className="inline-flex flex-col gap-1.5">
        <div
          className="flex gap-0.75 text-[10px] text-muted-foreground"
          aria-hidden
        >
          {weekRows.map(({ id, label: m }) => (
            <span key={id} className="relative h-3 w-2.5 shrink-0">
              {m ? (
                <span className="absolute left-0 whitespace-nowrap">{m}</span>
              ) : null}
            </span>
          ))}
        </div>
        <div className="flex gap-0.75">
          {weekRows.map((week) => (
            <div key={week.id} className="flex flex-col gap-0.75">
              {week.cells.map(({ id, cell }) =>
                cell ? (
                  <span
                    key={id}
                    title={`${cell.count} event${cell.count === 1 ? "" : "s"} on ${formatDate(`${cell.date}T12:00:00.000Z`)}`}
                    className={cn(
                      "size-2.5 rounded-[2px]",
                      levelClass[level(cell.count, max)],
                    )}
                  />
                ) : (
                  <span key={id} className="size-2.5" />
                ),
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          Less
          {levelClass.map((c) => (
            <span key={c} className={cn("size-2.5 rounded-[2px]", c)} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

export function StatChip({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
      <span className="font-semibold tabular-nums">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
