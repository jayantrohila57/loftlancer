/** Row shape from Better Auth `listUserAccounts` / oRPC sign-in-methods.accounts. */
export type LinkedSignInAccountRef = Readonly<{ id: string }>

/**
 * Mirrors Better Auth `/unlink-account`: refuses unlink when only one linked
 * account row remains (`FAILED_TO_UNLINK_LAST_ACCOUNT`). Counts every linked
 * provider row (GitHub, Google, legacy OAuth, credential, …), not UI inventory.
 * Email magic link shown on the connected-accounts screen is not a linked row.
 */
export function isLastLinkedSignInAccount(
  accounts: readonly LinkedSignInAccountRef[]
): boolean {
  return accounts.length === 1
}

export function canDisconnectLinkedSignInAccount(
  accounts: readonly LinkedSignInAccountRef[]
): boolean {
  return !isLastLinkedSignInAccount(accounts)
}

/** @deprecated Use {@link isLastLinkedSignInAccount}. */
export const isLastLinkedOAuthAccount = isLastLinkedSignInAccount

/** @deprecated Use {@link canDisconnectLinkedSignInAccount}. */
export const canDisconnectLinkedOAuthAccount = canDisconnectLinkedSignInAccount
