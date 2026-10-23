import { logger } from "@loftlancer/logger";

import {
  type MonitorState,
  overallFromMonitors,
  type PlatformIncident,
  type PlatformMonitor,
  type PlatformStatus,
} from "@loftlancer/ui/platform-status";

/**
 * Better Stack Uptime API → public PlatformStatus (#369). Server-only: the
 * token never leaves this module. Responses are cached for 60s.
 */
const API = "https://uptime.betterstack.com";
const REVALIDATE_SECONDS = 60;
const PUBLIC_HOST = "loftlancer.com";

type MonitorResource = {
  id: string;
  attributes: {
    url: string | null;
    pronounceable_name: string | null;
    status: string;
    last_checked_at: string | null;
    check_frequency: number | null;
  };
};

type SlaResource = { attributes: { availability: number | null } };

type IncidentResource = {
  id: string;
  attributes: {
    name: string | null;
    cause: string | null;
    started_at: string;
    resolved_at: string | null;
  };
  relationships?: { monitor?: { data?: { id: string } | null } };
};

/** Friendly names for the four public surfaces, by URL path. */
const NAMES_BY_PATH: Record<string, string> = {
  "/": "Landing",
  "/docs": "Documentation",
  "/studio": "Dashboard",
  "/auth": "Sign-in",
};
const ORDER = ["Landing", "Documentation", "Dashboard", "Sign-in"];

/** Only monitors on loftlancer.com (skips e.g. the auto-created google.com one). */
export function isPublicMonitorUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host === PUBLIC_HOST || host.endsWith(`.${PUBLIC_HOST}`);
  } catch {
    return false;
  }
}

export function monitorName(url: string, fallback: string | null): string {
  try {
    const path = new URL(url).pathname.replace(/\/+$/, "") || "/";
    return NAMES_BY_PATH[path] ?? fallback ?? path;
  } catch {
    return fallback ?? url;
  }
}

export function toMonitorState(status: string): MonitorState {
  switch (status) {
    case "up":
    case "down":
    case "paused":
    case "maintenance":
    case "pending":
      return status;
    case "validating":
      return "pending";
    default:
      return "degraded";
  }
}

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function api<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Better Stack ${path}: ${res.status}`);
  return (await res.json()) as T;
}

async function availability(
  token: string,
  id: string,
  days: number,
): Promise<number | null> {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  try {
    const sla = await api<{ data: SlaResource }>(
      `/api/v2/monitors/${id}/sla?from=${isoDay(from)}&to=${isoDay(to)}`,
      token,
    );
    const value = sla.data.attributes.availability;
    return typeof value === "number" ? value : null;
  } catch {
    return null;
  }
}

export async function getPlatformStatus(
  token: string | undefined,
): Promise<PlatformStatus> {
  const generatedAt = new Date().toISOString();
  if (!token) {
    return { available: false, reason: "not-configured", generatedAt };
  }
  try {
    const list = await api<{ data: MonitorResource[] }>(
      "/api/v2/monitors?per_page=50",
      token,
    );
    const publicMonitors = list.data.filter((m) =>
      isPublicMonitorUrl(m.attributes.url),
    );

    const monitors: PlatformMonitor[] = await Promise.all(
      publicMonitors.map(async (m) => {
        const [uptime30d, uptime90d] = await Promise.all([
          availability(token, m.id, 30),
          availability(token, m.id, 90),
        ]);
        const url = m.attributes.url ?? "";
        return {
          id: m.id,
          name: monitorName(url, m.attributes.pronounceable_name),
          url,
          status: toMonitorState(m.attributes.status),
          lastCheckedAt: m.attributes.last_checked_at,
          checkFrequency: m.attributes.check_frequency,
          uptime30d,
          uptime90d,
        };
      }),
    );
    monitors.sort((a, b) => {
      const ia = ORDER.indexOf(a.name);
      const ib = ORDER.indexOf(b.name);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    const byId = new Map(monitors.map((m) => [m.id, m.name]));
    let incidents: PlatformIncident[] = [];
    try {
      const from = isoDay(new Date(Date.now() - 90 * 86_400_000));
      const res = await api<{ data: IncidentResource[] }>(
        `/api/v3/incidents?from=${from}&per_page=50`,
        token,
      );
      incidents = res.data
        .filter((i) => {
          const monitorId = i.relationships?.monitor?.data?.id;
          return monitorId ? byId.has(monitorId) : false;
        })
        .map((i) => ({
          id: i.id,
          monitorName:
            byId.get(i.relationships?.monitor?.data?.id ?? "") ??
            i.attributes.name ??
            "Monitor",
          cause: i.attributes.cause,
          startedAt: i.attributes.started_at,
          resolvedAt: i.attributes.resolved_at,
        }))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
        .slice(0, 10);
    } catch {
      incidents = [];
    }

    return {
      available: true,
      overall: overallFromMonitors(monitors),
      generatedAt,
      monitors,
      incidents,
    };
  } catch (err) {
    logger.error("Better Stack status request failed", err);
    return { available: false, reason: "upstream-error", generatedAt };
  }
}
