import { buildHealthReport, HEALTH_HEADERS } from "@loftlancer/drizzle/health";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Uptime probe for Better Stack (#356): app name, product version and a cheap
 * database ping. 503 when the database is unreachable. No secrets, no cache.
 */
export async function GET() {
  const { report, httpStatus } = await buildHealthReport(
    "studio",
    process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
  );
  return NextResponse.json(report, {
    status: httpStatus,
    headers: HEALTH_HEADERS,
  });
}
