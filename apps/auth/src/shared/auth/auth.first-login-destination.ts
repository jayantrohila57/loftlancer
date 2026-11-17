import "server-only"

import { getDb } from "@packages/drizzle"
import { member } from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import { getPostSignInDestination } from "@/shared/auth/auth.destination"
import { buildStudioLocalePath } from "@/shared/auth/auth-studio-app-url"

function isInviteReturnTo(value: string | undefined): boolean {
  if (!value?.trim()) return false
  try {
    const target = new URL(value.trim())
    const path = target.pathname.toLowerCase()
    return (
      path.includes("/organizations/invitations") ||
      path.includes("/onboarding/invites") ||
      path.includes("/invite")
    )
  } catch {
    const lowered = value.trim().toLowerCase()
    return (
      lowered.includes("/organizations/invitations") ||
      lowered.includes("/onboarding/invites") ||
      lowered.includes("/invite")
    )
  }
}

async function userHasOrganizationMembership(userId: string): Promise<boolean> {
  const db = getDb()
  if (!db) return false
  const rows = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1)
  return rows.length > 0
}

export async function resolveContinueDestination(input: {
  readonly lang: string
  readonly userId: string
  readonly returnTo?: string
  readonly newUser?: boolean
}): Promise<string> {
  const hasOrg = await userHasOrganizationMembership(input.userId)
  if (!hasOrg) {
    if (input.returnTo && isInviteReturnTo(input.returnTo)) {
      return getPostSignInDestination(input.lang, input.returnTo)
    }
    return buildStudioLocalePath(input.lang, "/onboarding")
  }

  if (input.newUser) {
    return getPostSignInDestination(input.lang, input.returnTo)
  }

  return getPostSignInDestination(input.lang, input.returnTo)
}
