import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server"
import { userDataExportRequest } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import type { z } from "zod"
import type { dataExportRequestInputSchema } from "../../utils/validation/privacy.schema"

export async function createDataExportRequest(
  userId: string,
  input: z.infer<typeof dataExportRequestInputSchema>
) {
  const requestId = crypto.randomUUID()
  const submittedAt = new Date()

  const activity = beginActivity({
    actionId: "privacy.data_export.request",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })

  await requireSecurityDb().transaction(async (tx) => {
    await tx.insert(userDataExportRequest).values({
      id: requestId,
      userId,
      message: input.message?.trim() ? input.message.trim() : null,
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

  logger.info("privacy.data_export.request_recorded", {
    app: "auth",
    module: "privacy",
    requestId,
    procedure: "privacy.dataExport.request",
    input: { messageLength: input.message?.length ?? 0 },
  })

  return {
    requestId,
    submittedAt: submittedAt.toISOString(),
  }
}
