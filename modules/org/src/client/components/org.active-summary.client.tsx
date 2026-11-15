"use client"

import { authClient } from "@packages/better-auth/client"
import { Skeleton } from "@packages/ui/components/skeleton"

export function OrgActiveSummary() {
  const { data: organization, isPending } = authClient.useActiveOrganization()
  if (isPending) return <Skeleton className="h-5 w-32" />
  if (!organization) return null
  return <p className="text-sm font-medium">{organization.name}</p>
}
