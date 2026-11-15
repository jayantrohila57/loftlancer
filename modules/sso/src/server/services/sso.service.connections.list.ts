import { beginActivity, recordActivity } from "@modules/activity/server"
import { assertPlatformAdministrator } from "@modules/admin/utils"
import { requireSecurityDb } from "@modules/security/server"
import { ssoProvider } from "@packages/drizzle/schema"
import { ORPCError } from "@packages/orpc/server"
import { asc } from "drizzle-orm"

import { listSsoConnectionsDataSchema } from "../../utils/validation/sso.connections.list.schema"

type SsoConnectionsListInput = {
  auth: {
    user: {
      id: string
      email: string
      emailVerified: boolean
      role?: string | null
    }
  }
}

function resolveProtocol(input: {
  oidcConfig: string | null
  samlConfig: string | null
}) {
  if (input.oidcConfig) return "oidc" as const
  if (input.samlConfig) return "saml" as const
  return "unconfigured" as const
}

export async function listSsoConnections(input: SsoConnectionsListInput) {
  assertPlatformAdministrator(input.auth)
  const activity = beginActivity({
    actionId: "admin.sso.connections.list",
    ownerUserId: input.auth.user.id,
    actor: { type: "user", userId: input.auth.user.id },
  })
  try {
    const rows = await requireSecurityDb()
      .select({
        id: ssoProvider.id,
        providerId: ssoProvider.providerId,
        domain: ssoProvider.domain,
        issuer: ssoProvider.issuer,
        oidcConfig: ssoProvider.oidcConfig,
        samlConfig: ssoProvider.samlConfig,
        organizationId: ssoProvider.organizationId,
      })
      .from(ssoProvider)
      .orderBy(asc(ssoProvider.domain))

    const payload = listSsoConnectionsDataSchema.parse({
      connections: rows.map((row) => ({
        id: row.id,
        providerId: row.providerId,
        domain: row.domain,
        issuer: row.issuer,
        protocol: resolveProtocol(row),
        organizationId: row.organizationId ?? null,
      })),
    })

    await recordActivity(activity, {
      outcome: "success",
      sourceApp: "auth",
      sourceModule: "sso",
      metadata: { total: payload.connections.length },
    })
    return payload
  } catch (error) {
    await recordActivity(activity, {
      outcome: "failed",
      sourceApp: "auth",
      sourceModule: "sso",
    })
    if (error instanceof ORPCError) throw error
    throw new ORPCError("FORBIDDEN", { message: "Access denied." })
  }
}
