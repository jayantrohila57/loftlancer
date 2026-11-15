import { z } from "zod"
import type { LinkedConnectedAccount } from "./serialization/connected-accounts.serialize.linked-accounts"

export const linkAttemptKey = "connected-accounts-link-attempt"

const linkAttemptSchema = z.object({
  userId: z.string(),
  provider: z.string(),
  existingIds: z.array(z.string()),
})

export function parseLinkAttempt(value: string | null) {
  if (!value) return null
  try {
    const result = linkAttemptSchema.safeParse(JSON.parse(value))
    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function hasNewLinkedAccount(
  attempt: z.infer<typeof linkAttemptSchema> | null,
  userId: string | undefined,
  accounts: readonly LinkedConnectedAccount[]
) {
  return Boolean(
    attempt &&
      userId === attempt.userId &&
      accounts.some(
        (account) =>
          account.providerId === attempt.provider &&
          !attempt.existingIds.includes(account.id)
      )
  )
}
