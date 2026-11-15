"use client"

import { authClient } from "@packages/better-auth/client"
import { resolveOrgBillingNavVisible } from "../../utils/org.billing-nav"
import { readActiveOrganizationId } from "../../utils/org.session"
import { useOrgListOrganizations } from "./org.hook.list-organizations"

type ActiveOrganizationMember = {
  readonly userId: string
  readonly role: string
}

export function useOrgSessionActiveId() {
  const { data: session } = authClient.useSession()
  const sessionOrgId = readActiveOrganizationId(session)
  const { data: activeOrganization } = authClient.useActiveOrganization()
  if (sessionOrgId) return sessionOrgId
  const activeId = activeOrganization?.id
  return typeof activeId === "string" && activeId.length > 0 ? activeId : null
}

/** True while Better Auth session (and optional singleton auto-activate) is still resolving. */
export function useOrgSessionActiveIdPending() {
  const { isPending: sessionPending } = authClient.useSession()
  const organizationId = useOrgSessionActiveId()
  const { isPending: orgsPending } = useOrgListOrganizations()
  if (sessionPending) return true
  if (!organizationId && orgsPending) return true
  return false
}

/** True while the signed-in session is still loading on the client. */
export function useOrgSessionPending() {
  const { isPending } = authClient.useSession()
  return isPending
}

export function useOrgActiveMemberRole() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  const {
    data: organization,
    isPending: orgPending,
    error,
  } = authClient.useActiveOrganization()
  if (!userId) {
    return {
      role: null,
      isPending: sessionPending,
      error: null,
    }
  }
  const members = (organization?.members ?? []) as ActiveOrganizationMember[]
  const activeMember = members.find((member) => member.userId === userId)
  return {
    role: activeMember?.role ?? null,
    isPending: sessionPending || orgPending,
    error,
  }
}

export function useOrgBillingNavVisible() {
  const { role, isPending } = useOrgActiveMemberRole()
  return resolveOrgBillingNavVisible({ role, rolePending: isPending })
}
