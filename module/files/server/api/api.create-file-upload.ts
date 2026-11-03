import { requireAction } from "@features/authorization/core/server/authorization.require-action";
import { db } from "@loftlancer/drizzle";
import {
  organizationStoragePolicy,
  storedFile,
} from "@loftlancer/drizzle/schema/files";
import { env } from "@loftlancer/t3-env/server";
import { TRPCError } from "@trpc/server";
import { generateClientTokenFromReadWriteToken } from "@vercel/blob/client";
import { and, eq, sql } from "drizzle-orm";
import type { FileContext } from "./file-context";
import {
  type FileUploadRequest,
  fileUploadRequestSchema,
  safeFilename,
} from "./file-input";

const UPLOAD_TTL_MS = 15 * 60 * 1000;

export async function createFileUpload(
  context: FileContext,
  request: FileUploadRequest,
) {
  const input = fileUploadRequestSchema.parse(request);
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "File uploads are not configured on this server.",
    });
  }

  await requireAction("file.upload", {
    ...context,
    entityId: context.projectId,
    payload: { contentType: input.contentType, sizeBytes: input.sizeBytes },
  });

  const id = crypto.randomUUID();
  const pathname = `organizations/${context.organizationId}/projects/${context.projectId}/${id}/${safeFilename(input.filename)}`;
  const expiresAt = new Date(Date.now() + UPLOAD_TTL_MS);

  await db.transaction(async (tx) => {
    await tx
      .insert(organizationStoragePolicy)
      .values({ organizationId: context.organizationId })
      .onConflictDoNothing();

    const [reserved] = await tx
      .update(organizationStoragePolicy)
      .set({
        storageReservedBytes: sql`${organizationStoragePolicy.storageReservedBytes} + ${input.sizeBytes}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(organizationStoragePolicy.organizationId, context.organizationId),
          sql`${organizationStoragePolicy.storageUsedBytes} + ${organizationStoragePolicy.storageReservedBytes} + ${input.sizeBytes} <= ${organizationStoragePolicy.storageLimitBytes}`,
        ),
      )
      .returning({ organizationId: organizationStoragePolicy.organizationId });
    if (!reserved) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message:
          "This organization does not have enough file storage available.",
      });
    }

    await tx.insert(storedFile).values({
      id,
      organizationId: context.organizationId,
      projectId: context.projectId,
      createdBy: context.userId,
      pathname,
      originalName: input.filename,
      contentType: input.contentType,
      sizeBytes: input.sizeBytes,
      uploadExpiresAt: expiresAt,
    });
  });

  try {
    const clientToken = await generateClientTokenFromReadWriteToken({
      token,
      pathname,
      maximumSizeInBytes: input.sizeBytes,
      allowedContentTypes: [input.contentType],
      validUntil: expiresAt.getTime(),
      addRandomSuffix: false,
      allowOverwrite: false,
    });
    return { id, pathname, clientToken, expiresAt, access: "private" as const };
  } catch (error) {
    await db.transaction(async (tx) => {
      await tx
        .update(storedFile)
        .set({ status: "failed" })
        .where(and(eq(storedFile.id, id), eq(storedFile.status, "pending")));
      await tx
        .update(organizationStoragePolicy)
        .set({
          storageReservedBytes: sql`greatest(${organizationStoragePolicy.storageReservedBytes} - ${input.sizeBytes}, 0)`,
          updatedAt: new Date(),
        })
        .where(
          eq(organizationStoragePolicy.organizationId, context.organizationId),
        );
    });
    throw error;
  }
}
