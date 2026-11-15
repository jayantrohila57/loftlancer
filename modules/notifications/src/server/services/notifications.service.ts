import type { ActiveOrgMembershipAuth } from "@modules/org/server/shared/org.membership-context"
import { resolveActiveOrgMembershipContext } from "@modules/org/server/shared/org.membership-context"
import { logger } from "@packages/logger/server"
import { createError, createSuccess } from "@packages/orpc"
import type { z } from "zod"
import type { notificationPreferencesUpdateSchema } from "../../utils/validation/notifications.schema"
import { notificationPreferencesSchema } from "../../utils/validation/notifications.schema"
import {
  readNotificationPreferences,
  writeNotificationPreferences,
} from "../repositories/notifications.repository"

type SessionAuth = ActiveOrgMembershipAuth

async function resolveIsOrgOwner(auth: SessionAuth): Promise<boolean> {
  try {
    const membership = await resolveActiveOrgMembershipContext(auth)
    return membership.isOrgOwner
  } catch {
    return false
  }
}

export const notificationPreferencesService = {
  async get(auth: SessionAuth) {
    try {
      const prefs = await readNotificationPreferences(auth.user.id)
      const isOrgOwner = await resolveIsOrgOwner(auth)
      const data = notificationPreferencesSchema.parse({
        securityEmailRequired: true as const,
        ...prefs,
        isOrgOwner,
      })
      return createSuccess(data, "Notification preferences loaded.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "notifications",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not load notification preferences.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
  async update(
    auth: SessionAuth,
    input: z.infer<typeof notificationPreferencesUpdateSchema>
  ) {
    try {
      const isOrgOwner = await resolveIsOrgOwner(auth)
      if (input.billingEmailEnabled !== undefined && !isOrgOwner) {
        return createError(
          "Only the organization owner can change billing emails.",
          { code: "FORBIDDEN" }
        )
      }
      const prefs = await writeNotificationPreferences(auth.user.id, input, {
        isOrgOwner,
      })
      const data = notificationPreferencesSchema.parse({
        securityEmailRequired: true as const,
        ...prefs,
        isOrgOwner,
      })
      return createSuccess(data, "Notification preferences updated.")
    } catch {
      logger.error("service.failed", {
        app: "auth",
        module: "notifications",
        outcome: "error",
        errorCode: "PREFERENCES_UNAVAILABLE",
      })
      return createError("Could not update notification preferences.", {
        code: "PREFERENCES_UNAVAILABLE",
      })
    }
  },
}
