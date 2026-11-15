import { z } from "zod"

/** Fields the connected-accounts screen may keep in client state. */
export const linkedConnectedAccountSchema = z
  .object({
    id: z.string(),
    providerId: z.string(),
    createdAt: z.coerce.date(),
  })
  .strict()

export type LinkedConnectedAccount = z.infer<
  typeof linkedConnectedAccountSchema
>

export function serializeLinkedConnectedAccount(
  account: Record<string, unknown>
): LinkedConnectedAccount {
  return linkedConnectedAccountSchema.parse({
    id: account.id,
    providerId: account.providerId,
    createdAt: account.createdAt,
  })
}

export function serializeLinkedConnectedAccounts(
  accounts: ReadonlyArray<Record<string, unknown>>
): LinkedConnectedAccount[] {
  return accounts.map((account) => serializeLinkedConnectedAccount(account))
}
