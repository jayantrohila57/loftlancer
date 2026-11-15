import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server"
import {
  userNotificationPreference,
  userPrivacyConsent,
} from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import type { z } from "zod"
import type { privacyConsentsUpdateSchema } from "../../utils/validation/privacy.schema"

const defaults = {
  marketingEmailEnabled: false,
  analyticsEnabled: false,
}

export async function readPrivacyConsents(userId: string) {
  const [row] = await requireSecurityDb()
    .select()
    .from(userPrivacyConsent)
    .where(eq(userPrivacyConsent.userId, userId))
    .limit(1)

  return {
    marketingEmailEnabled:
      row?.marketingEmailEnabled ?? defaults.marketingEmailEnabled,
    analyticsEnabled: row?.analyticsEnabled ?? defaults.analyticsEnabled,
  }
}

async function syncProductMarketing(
  tx: Parameters<
    Parameters<ReturnType<typeof requireSecurityDb>["transaction"]>[0]
  >[0],
  userId: string,
  marketingEmailEnabled: boolean
) {
  await tx
    .insert(userNotificationPreference)
    .values({
      userId,
      productEmailEnabled: marketingEmailEnabled,
    })
    .onConflictDoUpdate({
      target: userNotificationPreference.userId,
      set: {
        productEmailEnabled: marketingEmailEnabled,
        updatedAt: new Date(),
      },
    })
}

export async function writePrivacyConsents(
  userId: string,
  input: z.infer<typeof privacyConsentsUpdateSchema>
) {
  const activity = beginActivity({
    actionId: "privacy.consent.update",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })

  return requireSecurityDb().transaction(async (tx) => {
    const [previous] = await tx
      .select()
      .from(userPrivacyConsent)
      .where(eq(userPrivacyConsent.userId, userId))
      .limit(1)

    const patch = {
      ...(input.marketingEmailEnabled !== undefined
        ? { marketingEmailEnabled: input.marketingEmailEnabled }
        : {}),
      ...(input.analyticsEnabled !== undefined
        ? { analyticsEnabled: input.analyticsEnabled }
        : {}),
    }

    if (!Object.keys(patch).length) {
      return readPrivacyConsents(userId)
    }

    const [row] = await tx
      .insert(userPrivacyConsent)
      .values({ userId, ...defaults, ...patch })
      .onConflictDoUpdate({
        target: userPrivacyConsent.userId,
        set: { ...patch, updatedAt: new Date() },
      })
      .returning()

    if (!row) throw new Error("Consent update did not return a row")

    if (input.marketingEmailEnabled !== undefined) {
      await syncProductMarketing(tx, userId, input.marketingEmailEnabled)
    }

    const changed = Object.keys(patch).filter((key) => {
      const field = key as keyof typeof patch
      const prior =
        previous?.[field as keyof typeof previous] ??
        defaults[field as keyof typeof defaults]
      return prior !== patch[field]
    })

    if (changed.length) {
      await recordActivity(
        activity,
        {
          outcome: "success",
          sourceApp: "auth",
          sourceModule: "privacy",
          metadata: { changedFields: changed },
        },
        tx
      )
    }

    return {
      marketingEmailEnabled: row.marketingEmailEnabled,
      analyticsEnabled: row.analyticsEnabled,
    }
  })
}
