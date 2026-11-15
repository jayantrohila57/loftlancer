import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server"
import {
  userNotificationPreference,
  userPrivacyConsent,
} from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import type { z } from "zod"
import type { notificationPreferencesUpdateSchema } from "../../utils/validation/notifications.schema"

const defaultPrefs = {
  billingEmailEnabled: true,
  organizationInvitesEnabled: true,
  productEmailEnabled: false,
}

export async function readNotificationPreferences(userId: string) {
  const [row] = await requireSecurityDb()
    .select()
    .from(userNotificationPreference)
    .where(eq(userNotificationPreference.userId, userId))
    .limit(1)

  const [privacy] = await requireSecurityDb()
    .select({
      marketingEmailEnabled: userPrivacyConsent.marketingEmailEnabled,
    })
    .from(userPrivacyConsent)
    .where(eq(userPrivacyConsent.userId, userId))
    .limit(1)

  const productEmailEnabled =
    row?.productEmailEnabled ??
    privacy?.marketingEmailEnabled ??
    defaultPrefs.productEmailEnabled

  return {
    billingEmailEnabled:
      row?.billingEmailEnabled ?? defaultPrefs.billingEmailEnabled,
    organizationInvitesEnabled:
      row?.organizationInvitesEnabled ??
      defaultPrefs.organizationInvitesEnabled,
    productEmailEnabled,
  }
}

async function syncMarketingWithProduct(
  tx: Parameters<
    Parameters<ReturnType<typeof requireSecurityDb>["transaction"]>[0]
  >[0],
  userId: string,
  productEmailEnabled: boolean
) {
  await tx
    .insert(userPrivacyConsent)
    .values({ userId, marketingEmailEnabled: productEmailEnabled })
    .onConflictDoUpdate({
      target: userPrivacyConsent.userId,
      set: {
        marketingEmailEnabled: productEmailEnabled,
        updatedAt: new Date(),
      },
    })
}

export async function writeNotificationPreferences(
  userId: string,
  input: z.infer<typeof notificationPreferencesUpdateSchema>,
  options: { readonly isOrgOwner: boolean }
) {
  const activity = beginActivity({
    actionId: "notifications.preference.update",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })

  return requireSecurityDb().transaction(async (tx) => {
    const [previous] = await tx
      .select()
      .from(userNotificationPreference)
      .where(eq(userNotificationPreference.userId, userId))
      .limit(1)

    const patch = {
      ...(input.billingEmailEnabled !== undefined && options.isOrgOwner
        ? { billingEmailEnabled: input.billingEmailEnabled }
        : {}),
      ...(input.organizationInvitesEnabled !== undefined
        ? { organizationInvitesEnabled: input.organizationInvitesEnabled }
        : {}),
      ...(input.productEmailEnabled !== undefined
        ? { productEmailEnabled: input.productEmailEnabled }
        : {}),
    }

    if (!Object.keys(patch).length) {
      return readNotificationPreferences(userId)
    }

    const [row] = await tx
      .insert(userNotificationPreference)
      .values({ userId, ...defaultPrefs, ...patch })
      .onConflictDoUpdate({
        target: userNotificationPreference.userId,
        set: { ...patch, updatedAt: new Date() },
      })
      .returning()

    if (!row) throw new Error("Preference update did not return a row")

    if (input.productEmailEnabled !== undefined) {
      await syncMarketingWithProduct(tx, userId, input.productEmailEnabled)
    }

    const changed = Object.keys(patch).filter((key) => {
      const field = key as keyof typeof patch
      const prior =
        previous?.[field as keyof typeof previous] ??
        defaultPrefs[field as keyof typeof defaultPrefs]
      return prior !== patch[field]
    })

    if (changed.length) {
      await recordActivity(
        activity,
        {
          outcome: "success",
          sourceApp: "auth",
          sourceModule: "notifications",
          metadata: { changedFields: changed },
        },
        tx
      )
    }

    return {
      billingEmailEnabled: row.billingEmailEnabled,
      organizationInvitesEnabled: row.organizationInvitesEnabled,
      productEmailEnabled: row.productEmailEnabled,
    }
  })
}
