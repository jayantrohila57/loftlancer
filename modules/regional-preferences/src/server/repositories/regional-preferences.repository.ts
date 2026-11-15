import { beginActivity, recordActivity } from "@modules/activity/server"
import { requireSecurityDb } from "@modules/security/server"
import { regionalPreferences, user } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import type { z } from "zod"
import type { regionalPreferencesUpdateSchema } from "../../utils/validation/regional-preferences.schema"

function preferenceText(value: string | null | undefined): string | null {
  return value == null || value === "" ? null : value
}

function toRegionalPreferencesRecord(row: {
  currency: string | null
  dateStyle: string | null
  hourCycle: string | null
  language: string | null
  measurementSystem: string | null
  numberGrouping: string | null
  region: string | null
  timeZone: string | null
}) {
  return {
    language: preferenceText(row.language),
    region: preferenceText(row.region),
    timeZone: preferenceText(row.timeZone),
    dateStyle: preferenceText(row.dateStyle),
    hourCycle: preferenceText(row.hourCycle),
    currency: preferenceText(row.currency),
    numberGrouping: preferenceText(row.numberGrouping),
    measurementSystem: preferenceText(row.measurementSystem),
  }
}

export async function readRegionalPreferences(userId: string) {
  const [row] = await requireSecurityDb()
    .select()
    .from(regionalPreferences)
    .where(eq(regionalPreferences.userId, userId))
    .limit(1)
  if (!row) {
    return {
      language: null,
      region: null,
      timeZone: null,
      dateStyle: null,
      hourCycle: null,
      currency: null,
      numberGrouping: null,
      measurementSystem: null,
    }
  }
  return toRegionalPreferencesRecord(row)
}

export async function writeRegionalPreferences(
  userId: string,
  input: z.infer<typeof regionalPreferencesUpdateSchema>
) {
  const activity = beginActivity({
    actionId: "preferences.regional.update",
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
      .from(regionalPreferences)
      .where(eq(regionalPreferences.userId, userId))
      .limit(1)
    const fields = Object.keys(input).filter((key) => {
      const field = key as keyof typeof input
      return (
        input[field] !== undefined &&
        (previous?.[field] ?? null) !== input[field]
      )
    })
    const [row] = await tx
      .insert(regionalPreferences)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: regionalPreferences.userId,
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
          sourceModule: "regional-preferences",
          metadata: { changedFields: fields },
        },
        tx
      )
    return toRegionalPreferencesRecord(row)
  })
}
