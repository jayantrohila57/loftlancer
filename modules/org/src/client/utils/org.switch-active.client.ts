import { authClient } from "@packages/better-auth/client"
import type { QueryClient } from "@packages/react-query"
import { invalidateOrgScopedClientCaches } from "./org.switch-cache"

type OrgScopedQueryClient = Pick<
  QueryClient,
  "cancelQueries" | "invalidateQueries" | "removeQueries"
>

export async function switchActiveOrganization(input: {
  readonly organizationId: string
  readonly switchErrorMessage: string
  readonly queryClient?: OrgScopedQueryClient
}): Promise<void> {
  const result = await authClient.organization.setActive({
    organizationId: input.organizationId,
  })
  if (result.error) {
    throw new Error(result.error.message?.trim() || input.switchErrorMessage)
  }

  if (input.queryClient) {
    await invalidateOrgScopedClientCaches(input.queryClient, {
      cancelInFlight: true,
      removeStale: true,
    })
  }
}
