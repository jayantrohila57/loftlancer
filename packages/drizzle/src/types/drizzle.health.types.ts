export type HealthCheckState = "ok" | "error";

export type HealthReport = {
  status: HealthCheckState;
  app: string;
  version: string;
  checks: Record<string, { status: HealthCheckState; latencyMs: number }>;
  time: string;
};
