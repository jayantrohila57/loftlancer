import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import { db } from "@loftlancer/drizzle";
import {
  organizationStoragePolicy,
  storedFile,
} from "@loftlancer/drizzle/schema/files";
import { env } from "@loftlancer/t3-env/server";
import { TRPCError } from "@trpc/server";
import { del } from "@vercel/blob";
import { and, eq, sql } from "drizzle-orm";
import type { FileContext } from "./file-context";

export async function deleteFile(context: FileContext, fileId: string) {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token)
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "File storage is not configured on this server.",
    });
  await requireAction("file.delete", { ...context, entityId: fileId });
  const [file] = await db
    .select()
    .from(storedFile)
    .where(
      and(
        eq(storedFile.id, fileId),
        eq(storedFile.organizationId, context.organizationId),
        eq(storedFile.projectId, context.projectId),
      ),
    )
    .limit(1);
  if (!file || file.deletedAt)
    throw new TRPCError({ code: "NOT_FOUND", message: "File not found." });
  if (file.blobUrl) await del(file.blobUrl, { token });

  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .update(storedFile)
      .set({ status: "deleted", deletedAt: new Date() })
      .where(and(eq(storedFile.id, file.id), eq(storedFile.status, "complete")))
      .returning({ id: storedFile.id });
    if (!deleted) return;
    await tx
      .update(organizationStoragePolicy)
      .set({
        storageUsedBytes: sql`greatest(${organizationStoragePolicy.storageUsedBytes} - ${file.sizeBytes}, 0)`,
        updatedAt: new Date(),
      })
      .where(
        eq(organizationStoragePolicy.organizationId, context.organizationId),
      );
  });
  return { id: file.id, deleted: true as const };
}
