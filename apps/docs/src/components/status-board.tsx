"use client";

import { errorAttributes, logger } from "@loftlancer/logger";
import { resolveAuthAppOrigin } from "@loftlancer/ui/auth-links";
import { Badge, type BadgeProps } from "@loftlancer/ui/badge";
import type {
  MonitorState,
  OverallState,
  PlatformIncident,
  PlatformMonitor,
  PlatformStatus,
} from "@loftlancer/ui/platform-status";
import { Skeleton } from "@loftlancer/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import { cn } from "@loftlancer/ui/utils";
import { useEffect, useState } from "react";

/** Monitored services with fixed rows so the status table does not shift. */
const SURFACES = ["Documentation", "Dashboard", "Sign-in"] as const;
const REFRESH_MS = 60_000;

const OVERALL: Record<
  OverallState,
  { label: string; dot: string; variant: BadgeProps["variant"] }
> = {
  operational: {
    label: "All systems operational",
    dot: "bg-success",
    variant: "success",
  },
  degraded: {
    label: "Some systems are down",
    dot: "bg-warning",
    variant: "warning",
  },
  outage: { label: "Major outage", dot: "bg-destructive", variant: "error" },
  unknown: {
    label: "Status unknown",
    dot: "bg-muted-foreground",
    variant: "secondary",
  },
};

const MONITOR: Record<
  MonitorState,
  { label: string; dot: string; variant: BadgeProps["variant"] }
> = {
  up: { label: "Up", dot: "bg-success", variant: "success" },
  down: { label: "Down", dot: "bg-destructive", variant: "error" },
  degraded: { label: "Degraded", dot: "bg-warning", variant: "warning" },
  maintenance: { label: "Maintenance", dot: "bg-info", variant: "info" },
  paused: {
    label: "Paused",
    dot: "bg-muted-foreground",
    variant: "secondary",
  },
  pending: {
    label: "Pending",
    dot: "bg-muted-foreground",
    variant: "secondary",
  },
};

type LoadState =
  | { phase: "loading" }
  | { phase: "ready"; status: PlatformStatus }
  | { phase: "error" };

function percent(value: number | null | undefined): string {
  return typeof value === "number" ? `${value.toFixed(2)}%` : "—";
}

function relative(iso: string | null | undefined, now: number): string {
  if (!iso) return "—";
  const seconds = Math.max(0, Math.round((now - Date.parse(iso)) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function absolute(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function duration(startIso: string, endIso: string | null, now: number) {
  const end = endIso ? Date.parse(endIso) : now;
  const minutes = Math.max(1, Math.round((end - Date.parse(startIso)) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${minutes % 60} min`;
}

/** Fixed-height placeholder text: same box as the loaded value. */
function Value({
  loading,
  children,
  className,
  width = "w-12",
}: {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  width?: string;
}) {
  if (loading) {
    return <Skeleton className={cn("h-4 rounded-sm", width)} />;
  }
  return <span className={className}>{children}</span>;
}

function MonitorRow({
  name,
  monitor,
  loading,
  now,
}: {
  name: string;
  monitor: PlatformMonitor | undefined;
  loading: boolean;
  now: number;
}) {
  const state = monitor ? MONITOR[monitor.status] : null;
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 px-4 py-3 sm:grid-cols-[1fr_4.5rem_4.5rem_5.5rem_5.5rem]">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-full",
            state?.dot ?? "bg-muted-foreground/40",
          )}
        />
        <span className="font-medium text-sm">{name}</span>
        {monitor ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <a
                  aria-label={`Open ${name} monitor at ${monitor.url}`}
                  className="hidden min-w-0 cursor-help truncate text-muted-foreground text-xs md:inline"
                  href={monitor.url}
                  rel="noreferrer"
                  target="_blank"
                  title={monitor.url}
                />
              }
            >
              {monitor.url.replace(/^https?:\/\//, "")}
            </TooltipTrigger>
            <TooltipContent>{monitor.url}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <div className="hidden text-right text-sm tabular-nums sm:block">
        <Value loading={loading}>{percent(monitor?.uptime30d)}</Value>
      </div>
      <div className="hidden text-right text-sm tabular-nums sm:block">
        <Value loading={loading}>{percent(monitor?.uptime90d)}</Value>
      </div>
      <div className="hidden text-right text-muted-foreground text-xs tabular-nums sm:block">
        <Value loading={loading} width="w-14">
          {relative(monitor?.lastCheckedAt, now)}
        </Value>
      </div>
      <div className="flex justify-end">
        {loading ? (
          <Skeleton className="h-5 w-12 rounded-sm sm:h-4" />
        ) : (
          <Badge variant={state?.variant ?? "secondary"} size="sm">
            {state?.label ?? "No data"}
          </Badge>
        )}
      </div>
    </li>
  );
}

function IncidentList({
  incidents,
  now,
}: {
  incidents: PlatformIncident[];
  now: number;
}) {
  if (incidents.length === 0) {
    return (
      <p className="px-4 py-3 text-muted-foreground text-sm">
        No incidents in the last 90 days.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border/60">
      {incidents.map((incident) => (
        <li
          key={incident.id}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-3"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium text-sm">
              {incident.monitorName}
              {incident.cause ? (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {incident.cause}
                </span>
              ) : null}
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {absolute(incident.startedAt)} ·{" "}
              {duration(incident.startedAt, incident.resolvedAt, now)}
            </span>
          </div>
          <Badge
            variant={incident.resolvedAt ? "secondary" : "error"}
            size="sm"
          >
            {incident.resolvedAt ? "Resolved" : "Ongoing"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/**
 * Status board after ReUI status/stat list layouts: an overall banner, one
 * dense row per surface with 30/90-day uptime and last check, then recent
 * incidents. Data comes from /auth/api/status (server-side Better Stack call,
 * token never in the browser, cached 60s). The four rows and the incident
 * panel always render, so loading, unavailable and loaded share one layout.
 */
export function StatusBoard() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const url = `${resolveAuthAppOrigin()}/api/status`;
    const load = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const status = (await res.json()) as PlatformStatus;
        if (alive) setState({ phase: "ready", status });
      } catch (error) {
        // Status fetch failures reach Sentry Logs from the browser (#355).
        logger.warn("Status board fetch failed", errorAttributes(error));
        if (alive) setState({ phase: "error" });
      }
      if (alive) setNow(Date.now());
    };
    void load();
    const timer = window.setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const loading = state.phase === "loading";
  const status = state.phase === "ready" ? state.status : null;
  const available = status?.available === true ? status : null;
  const overall = available ? OVERALL[available.overall] : null;
  const byName = new Map(available?.monitors.map((m) => [m.name, m]) ?? []);
  const extra =
    available?.monitors.filter(
      (m) => !(SURFACES as readonly string[]).includes(m.name),
    ) ?? [];

  return (
    <div className="not-prose flex flex-col gap-4" data-testid="status-board">
      {/* Overall */}
      <section
        aria-live="polite"
        className="flex items-center justify-between gap-4 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              overall?.dot ?? "bg-muted-foreground/40",
            )}
          />
          {loading ? (
            <Skeleton className="h-5 w-44 rounded-sm" />
          ) : (
            <span className="truncate font-medium text-sm">
              {overall?.label ?? "Status unavailable"}
            </span>
          )}
        </div>
        <span className="shrink-0 text-muted-foreground text-xs tabular-nums">
          {loading ? (
            <Skeleton className="h-4 w-24 rounded-sm" />
          ) : available ? (
            `Updated ${relative(available.generatedAt, now)}`
          ) : (
            "Try again in a minute"
          )}
        </span>
      </section>

      {/* Monitors */}
      <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="hidden grid-cols-[1fr_4.5rem_4.5rem_5.5rem_5.5rem] gap-x-4 border-border/60 border-b bg-muted/40 px-4 py-2 text-muted-foreground text-xs sm:grid">
          <span>Service</span>
          <span className="text-right">30 days</span>
          <span className="text-right">90 days</span>
          <span className="text-right">Checked</span>
          <span className="text-right">Status</span>
        </div>
        <ul className="divide-y divide-border/60">
          {SURFACES.map((name) => (
            <MonitorRow
              key={name}
              name={name}
              monitor={byName.get(name)}
              loading={loading}
              now={now}
            />
          ))}
          {extra.map((monitor) => (
            <MonitorRow
              key={monitor.id}
              name={monitor.name}
              monitor={monitor}
              loading={false}
              now={now}
            />
          ))}
        </ul>
      </section>

      {/* Incidents */}
      <section className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <h2 className="mt-0! border-border/60 border-b bg-muted/40 px-4 py-2 font-normal! text-muted-foreground! text-xs! tracking-normal!">
          Recent incidents
        </h2>
        {available ? (
          <IncidentList incidents={available.incidents} now={now} />
        ) : (
          <div className="px-4 py-3">
            {loading ? (
              <Skeleton className="h-5 w-56 rounded-sm" />
            ) : (
              <p className="text-muted-foreground text-sm">
                Incident history is unavailable.
              </p>
            )}
          </div>
        )}
      </section>
      <p className="text-muted-foreground text-xs">
        Checks run every 3 minutes from Better Stack. View monitor status and
        incident history on the{" "}
        <a
          href="https://loftlancer.betteruptime.com/"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Better Stack status page
        </a>
        .
      </p>
    </div>
  );
}
