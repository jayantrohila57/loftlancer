import { logger } from "@loftlancer/sentry";
import { purgeExpiredApps } from "@modules/apps/server/purge";
import { dbPurgeDeps } from "@modules/apps/server/purge-db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Daily Vercel cron (#257): hard-delete app data 30 days after uninstall.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is 401.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await purgeExpiredApps(dbPurgeDeps);
  logger.info("cron purge-apps finished", { result: JSON.stringify(result) });
  return NextResponse.json(result);
}
