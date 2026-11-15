import type { ActiveOrgMembershipAuth } from "@modules/org/server/shared/org.membership-context"
import { resolveActiveOrgMembershipContext } from "@modules/org/server/shared/org.membership-context"
import { readActiveOrganizationId } from "@modules/org/utils/org.session"

import type { ActivityTargetViewer } from "../services/activity.target-resolver"

export async function buildActivityTargetViewer(
  auth: ActiveOrgMembershipAuth & {
    user: {
      email: string
      emailVerified: boolean
      role?: string | null
      id: string
    }
  }
): Promise<ActivityTargetViewer> {
  const base: ActivityTargetViewer = {
    email: auth.user.email,
    emailVerified: auth.user.emailVerified,
    role: auth.user.role,
    activeOrganizationId: readActiveOrganizationId(auth),
    isOrgOwner: false,
  }
  try {
    const org = await resolveActiveOrgMembershipContext(auth)
    return {
      ...base,
      activeOrganizationId: org.organizationId,
      isOrgOwner: org.isOrgOwner,
    }
  } catch {
    return base
  }
}
