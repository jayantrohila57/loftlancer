import "server-only"

import { getDb } from "@packages/drizzle"
import { regionalPreferences, user } from "@packages/drizzle/schema"
import { eq, sql } from "drizzle-orm"

import {
  defaultAppLocale,
  defaultSupportedLocales,
} from "../constants/i18n.constants"

type AppLocale = (typeof defaultSupportedLocales)[number]

function normalizeLocale(value: string | null | undefined): AppLocale {
  if (!value) return defaultAppLocale
  const normalized = value.trim().toLowerCase()
  if ((defaultSupportedLocales as readonly string[]).includes(normalized)) {
    return normalized as AppLocale
  }
  return defaultAppLocale
}

export async function resolveEmailLocaleForUserIds(input: {
  readonly recipientUserId?: string | null
  readonly inviterUserId?: string | null
}): Promise<AppLocale> {
  const db = getDb()
  if (!db) return defaultAppLocale

  if (input.recipientUserId) {
    const [row] = await db
      .select({ language: regionalPreferences.language })
      .from(regionalPreferences)
      .where(eq(regionalPreferences.userId, input.recipientUserId))
      .limit(1)
    const locale = normalizeLocale(row?.language)
    if (locale !== defaultAppLocale || row?.language) return locale
  }

  if (input.inviterUserId) {
    const [row] = await db
      .select({ language: regionalPreferences.language })
      .from(regionalPreferences)
      .where(eq(regionalPreferences.userId, input.inviterUserId))
      .limit(1)
    return normalizeLocale(row?.language)
  }

  return defaultAppLocale
}

/** Resolve locale for an email address that may not have a user row yet. */
export async function resolveEmailLocaleForEmail(input: {
  readonly email: string
  readonly inviterUserId?: string | null
}): Promise<AppLocale> {
  const db = getDb()
  if (!db) return defaultAppLocale

  const [recipient] = await db
    .select({ id: user.id })
    .from(user)
    .where(sql`lower(${user.email}) = lower(${input.email})`)
    .limit(1)

  return resolveEmailLocaleForUserIds({
    recipientUserId: recipient?.id,
    inviterUserId: input.inviterUserId,
  })
}
