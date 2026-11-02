import { db } from "@loftlancer/db";
import { storedFile } from "@loftlancer/db/schema/files";
import { env } from "@loftlancer/env/server";
import { TRPCError } from "@trpc/server";
import { get } from "@vercel/blob";
import { and, eq, isNull } from "drizzle-orm";
import { requireAction } from "../../../actions/require-action";

export async function getPrivateFile(input: {
  userId: string;
  organizationId: string;
  fileId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const token = env.BLOB_READ_WRITE_TOKEN;
  if (!token)
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: "File storage is not configured on this server.",
    });
  const [file] = await db
    .select()
    .from(storedFile)
    .where(
      and(
        eq(storedFile.id, input.fileId),
        eq(storedFile.organizationId, input.organizationId),
        eq(storedFile.status, "complete"),
        isNull(storedFile.deletedAt),
      ),
    )
    .limit(1);
  if (!file?.projectId)
    throw new TRPCError({ code: "NOT_FOUND", message: "File not found." });
  await requireAction("file.view", {
    userId: input.userId,
    organizationId: input.organizationId,
    projectId: file.projectId,
    entityId: file.id,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    audit: false,
  });
  const result = await get(file.pathname, { access: "private", token });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "File object not found.",
    });
  }
  return { file, stream: result.stream };
}
