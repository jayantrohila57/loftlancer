/**
 * Public platform status (#369): the JSON served by `/auth/api/status` and
 * rendered by loftlancer.com/status. Built server-side from Better Stack.
 */

export type MonitorState =
  | "up"
  | "down"
  | "degraded"
  | "paused"
  | "maintenance"
  | "pending";

export type OverallState = "operational" | "degraded" | "outage" | "unknown";

export type PlatformMonitor = {
  id: string;
  name: string;
  url: string;
  status: MonitorState;
  lastCheckedAt: string | null;
  /** Seconds between checks. */
  checkFrequency: number | null;
  /** Availability %, or null when Better Stack has no data for the range. */
  uptime30d: number | null;
  uptime90d: number | null;
};

export type PlatformIncident = {
  id: string;
  monitorName: string;
  cause: string | null;
  startedAt: string;
  resolvedAt: string | null;
};

export type PlatformStatus =
  | {
      available: true;
      overall: OverallState;
      generatedAt: string;
      monitors: PlatformMonitor[];
      incidents: PlatformIncident[];
    }
  | {
      available: false;
      reason: "not-configured" | "upstream-error";
      generatedAt: string;
    };

export function overallFromMonitors(
  monitors: Pick<PlatformMonitor, "status">[],
): OverallState {
  const active = monitors.filter(
    (m) => m.status !== "paused" && m.status !== "pending",
  );
  if (active.length === 0) return "unknown";
  const down = active.filter((m) => m.status === "down").length;
  if (down === active.length) return "outage";
  if (down > 0 || active.some((m) => m.status === "degraded")) {
    return "degraded";
  }
  return "operational";
}
