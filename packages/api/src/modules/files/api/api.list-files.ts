import { db } from "@loftlancer/db";
import { storedFile } from "@loftlancer/db/schema/files";
import { and, desc, eq, isNull } from "drizzle-orm";
import { requireAction } from "../../../actions/require-action";
import type { FileContext } from "./file-context";

export async function listFiles(context: FileContext) {
  await requireAction("file.view", { ...context, audit: false });
  return db
    .select({
      id: storedFile.id,
      originalName: storedFile.originalName,
      contentType: storedFile.contentType,
      sizeBytes: storedFile.sizeBytes,
      status: storedFile.status,
      createdAt: storedFile.createdAt,
      completedAt: storedFile.completedAt,
    })
    .from(storedFile)
    .where(
      and(
        eq(storedFile.organizationId, context.organizationId),
        eq(storedFile.projectId, context.projectId),
        isNull(storedFile.deletedAt),
      ),
    )
    .orderBy(desc(storedFile.createdAt));
}
