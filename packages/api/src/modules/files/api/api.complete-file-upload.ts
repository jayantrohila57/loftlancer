import { db } from "@loftlancer/db";
import {
  organizationStoragePolicy,
  storedFile,
} from "@loftlancer/db/schema/files";
import { env } from "@loftlancer/env/server";
import { TRPCError } from "@trpc/server";
import { head } from "@vercel/blob";
import { and, eq, sql } from "drizzle-orm";
import { requireAction } from "../../../actions/require-action";
import type { FileContext } from "./file-context";

export async function completeFileUpload(context: FileContext, fileId: string) {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "File uploads are not configured on this server.",
    });
  }
  await requireAction("file.upload", { ...context, entityId: fileId });

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
  if (!file)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "File upload not found.",
    });
  if (file.status === "complete") return file;
  if (file.status !== "pending" || file.uploadExpiresAt <= new Date()) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "This upload has expired. Start a new upload.",
    });
  }

  const blob = await head(file.pathname, { token });
  if (blob.size > file.sizeBytes || blob.contentType !== file.contentType) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Uploaded file does not match its authorized upload.",
    });
  }

  const [completed] = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(storedFile)
      .set({
        status: "complete",
        blobUrl: blob.url,
        sizeBytes: blob.size,
        completedAt: new Date(),
      })
      .where(and(eq(storedFile.id, file.id), eq(storedFile.status, "pending")))
      .returning();
    if (!updated) return [];
    await tx
      .update(organizationStoragePolicy)
      .set({
        storageReservedBytes: sql`greatest(${organizationStoragePolicy.storageReservedBytes} - ${file.sizeBytes}, 0)`,
        storageUsedBytes: sql`${organizationStoragePolicy.storageUsedBytes} + ${blob.size}`,
        updatedAt: new Date(),
      })
      .where(
        eq(organizationStoragePolicy.organizationId, context.organizationId),
      );
    return [updated];
  });

  return completed ?? file;
}
