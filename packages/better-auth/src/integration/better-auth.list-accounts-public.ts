import type { BetterAuthPlugin } from "better-auth"
import { createAuthMiddleware } from "better-auth/api"

const PUBLIC_LIST_ACCOUNT_KEYS = new Set(["id", "providerId", "createdAt"])

type ListAccountsPayload = ReadonlyArray<Record<string, unknown>>

async function readSuccessfulEndpointJson(ctx: {
  context: { returned?: unknown }
}): Promise<unknown | null> {
  const returned = ctx.context.returned
  if (!returned) return null
  if (returned instanceof Response) {
    if (returned.status !== 200) return null
    return returned.clone().json()
  }
  return returned
}

export function toPublicListAccountsPayload(
  payload: unknown
): ListAccountsPayload {
  if (!Array.isArray(payload)) return []
  return payload.map((entry) => {
    const account = entry as Record<string, unknown>
    const publicAccount: Record<string, unknown> = {}
    for (const key of PUBLIC_LIST_ACCOUNT_KEYS) {
      if (Object.hasOwn(account, key)) publicAccount[key] = account[key]
    }
    return publicAccount
  })
}

/** Strips provider identifiers and token fields from Better Auth `/list-accounts`. */
export function buildPublicListAccountsPlugin(): BetterAuthPlugin {
  return {
    id: "public-list-accounts",
    hooks: {
      after: [
        {
          matcher(ctx) {
            return ctx.path === "/list-accounts"
          },
          handler: createAuthMiddleware(async (ctx) => {
            const payload = await readSuccessfulEndpointJson(ctx)
            // Better Auth also runs after hooks for API errors. Leave those
            // untouched instead of converting them into successful data.
            if (!Array.isArray(payload)) return
            return ctx.json(toPublicListAccountsPayload(payload))
          }),
        },
      ],
    },
  }
}
