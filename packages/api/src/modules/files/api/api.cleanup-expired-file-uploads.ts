import { db } from "@loftlancer/db";
import {
  organizationStoragePolicy,
  storedFile,
} from "@loftlancer/db/schema/files";
import { env } from "@loftlancer/env/server";
import { del } from "@vercel/blob";
import { and, eq, lte, sql } from "drizzle-orm";

/** Releases storage reservations and removes any object left by expired uploads. */
export async function cleanupExpiredFileUploads(now = new Date(), limit = 200) {
  const pending = await db
    .select()
    .from(storedFile)
    .where(
      and(
        eq(storedFile.status, "pending"),
        lte(storedFile.uploadExpiresAt, now),
      ),
    )
    .limit(limit);
  let cleaned = 0;
  for (const file of pending) {
    const [claimed] = await db
      .update(storedFile)
      .set({ status: "failed" })
      .where(and(eq(storedFile.id, file.id), eq(storedFile.status, "pending")))
      .returning({ id: storedFile.id });
    if (!claimed) continue;
    if (env.BLOB_READ_WRITE_TOKEN) {
      await del(file.pathname, { token: env.BLOB_READ_WRITE_TOKEN }).catch(
        () => undefined,
      );
    }
    await db
      .update(organizationStoragePolicy)
      .set({
        storageReservedBytes: sql`greatest(${organizationStoragePolicy.storageReservedBytes} - ${file.sizeBytes}, 0)`,
        updatedAt: now,
      })
      .where(eq(organizationStoragePolicy.organizationId, file.organizationId));
    cleaned++;
  }
  return { checked: pending.length, cleaned };
}
