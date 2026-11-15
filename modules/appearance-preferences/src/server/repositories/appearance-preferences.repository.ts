import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server"
import { appearancePreferences, user } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import type { z } from "zod"
import type { appearancePreferencesUpdateSchema } from "../../utils/validation/appearance-preferences.schema"

function preferenceText(value: string | null | undefined): string | null {
  return value == null || value === "" ? null : value
}

function toAppearancePreferencesRecord(row: {
  theme: string | null
  interfaceDensity: string | null
  sidebarBehavior: string | null
  zoomLevel: string | null
}) {
  return {
    theme: preferenceText(row.theme),
    interfaceDensity: preferenceText(row.interfaceDensity),
    sidebarBehavior: preferenceText(row.sidebarBehavior),
    zoomLevel: preferenceText(row.zoomLevel),
  }
}

export async function readAppearancePreferences(userId: string) {
  const [row] = await requireSecurityDb()
    .select()
    .from(appearancePreferences)
    .where(eq(appearancePreferences.userId, userId))
    .limit(1)
  if (!row) {
    return {
      theme: null,
      interfaceDensity: null,
      sidebarBehavior: null,
      zoomLevel: null,
    }
  }
  return toAppearancePreferencesRecord(row)
}

export async function writeAppearancePreferences(
  userId: string,
  input: z.infer<typeof appearancePreferencesUpdateSchema>
) {
  const activity = beginActivity({
    actionId: "preferences.appearance.update",
    ownerUserId: userId,
    actor: { type: "user", userId },
  })
  return requireSecurityDb().transaction(async (tx) => {
    await tx
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, userId))
      .for("no key update")
    const [previous] = await tx
      .select()
      .from(appearancePreferences)
      .where(eq(appearancePreferences.userId, userId))
      .limit(1)
    const fields = Object.keys(input).filter((key) => {
      const field = key as keyof typeof input
      return (
        input[field] !== undefined &&
        (previous?.[field] ?? null) !== input[field]
      )
    })
    const [row] = await tx
      .insert(appearancePreferences)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: appearancePreferences.userId,
        set: { ...input, updatedAt: new Date() },
      })
      .returning()
    if (!row) throw new Error("Preference update did not return a row")
    if (fields.length)
      await recordActivity(
        activity,
        {
          outcome: "success",
          sourceApp: "auth",
          sourceModule: "appearance-preferences",
          metadata: { changedFields: fields },
        },
        tx
      )
    return toAppearancePreferencesRecord(row)
  })
}
