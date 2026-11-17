import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server"
import { put } from "@packages/blob"
import { userDataExportRequest } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { and, desc, eq, gte } from "drizzle-orm"
import type { z } from "zod"
import type { dataExportRequestInputSchema } from "../../utils/validation/privacy.schema"
import { buildPrivacyUserDataExport } from "../shared/privacy.data-export.build"
import { sendPrivacyDataExportReadyEmail } from "../shared/privacy.data-export.email"

const EXPORT_RATE_LIMIT_MS = 24 * 60 * 60 * 1000
const EXPORT_LINK_TTL_MS = 24 * 60 * 60 * 1000

function privacyExportBlobPath(userId: string, requestId: string) {
  return `loftlancer/privacy-exports/${userId}/${requestId}.json`
}

export class PrivacyDataExportRateLimitError extends Error {
  constructor() {
    super("DATA_EXPORT_RATE_LIMITED")
  }
}

export async function assertDataExportRateLimit(userId: string) {
  const since = new Date(Date.now() - EXPORT_RATE_LIMIT_MS)
  const [recent] = await requireSecurityDb()
    .select({ id: userDataExportRequest.id })
    .from(userDataExportRequest)
    .where(
      and(
        eq(userDataExportRequest.userId, userId),
        gte(userDataExportRequest.createdAt, since)
      )
    )
    .orderBy(desc(userDataExportRequest.createdAt))
    .limit(1)
  if (recent) throw new PrivacyDataExportRateLimitError()
}

export async function createDataExportRequest(
  userId: string,
  userEmail: string,
  input: z.infer<typeof dataExportRequestInputSchema>
) {
  await assertDataExportRateLimit(userId)

  const requestId = crypto.randomUUID()
  const submittedAt = new Date()
  const expiresAt = new Date(submittedAt.getTime() + EXPORT_LINK_TTL_MS)

  const activity = beginActivity({
    actionId: "privacy.data_export.request",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })

  const exportPayload = await buildPrivacyUserDataExport(userId)
  const json = `${JSON.stringify(exportPayload, null, 2)}\n`
  const path = privacyExportBlobPath(userId, requestId)
  const blob = await put(path, json, {
    access: "private",
    contentType: "application/json; charset=utf-8",
    addRandomSuffix: false,
  })

  await requireSecurityDb().transaction(async (tx) => {
    await tx.insert(userDataExportRequest).values({
      id: requestId,
      userId,
      message: input.message?.trim() ? input.message.trim() : null,
      artifactPath: path,
      artifactUrl: blob.url,
      expiresAt,
      deliveredAt: submittedAt,
      createdAt: submittedAt,
    })

    await recordActivity(
      activity,
      {
        outcome: "success",
        sourceApp: "auth",
        sourceModule: "privacy",
        metadata: { requestId },
      },
      tx
    )
  })

  await sendPrivacyDataExportReadyEmail({
    to: userEmail,
    userId,
    downloadUrl: blob.url,
    expiresAt: expiresAt.toISOString(),
  })

  logger.info("privacy.data_export.completed", {
    app: "auth",
    module: "privacy",
    requestId,
    procedure: "privacy.dataExport.request",
    input: { messageLength: input.message?.length ?? 0 },
  })

  return {
    requestId,
    submittedAt: submittedAt.toISOString(),
    downloadUrl: blob.url,
    expiresAt: expiresAt.toISOString(),
  }
}
