import { logger } from "@loftlancer/sentry";
import { cleanupExpiredFileUploads } from "@modules/files/server/api/api.cleanup-expired-file-uploads";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Daily cleanup for abandoned direct uploads and their reserved quota (#766). */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await cleanupExpiredFileUploads();
  logger.info("cron cleanup-file-uploads finished", {
    result: JSON.stringify(result),
  });
  return NextResponse.json(result);
}
