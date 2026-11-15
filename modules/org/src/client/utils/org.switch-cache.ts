import type { QueryClient } from "@packages/react-query"

/** React Query key roots refetched after the session active org changes. */
export const ORG_SCOPED_QUERY_ROOTS = [
  "billing",
  "storage",
  "ai-usage",
] as const

type OrgScopedQueryClient = Pick<
  QueryClient,
  "cancelQueries" | "invalidateQueries" | "removeQueries"
>

/** Drop org-scoped client caches so billing, storage, and AI data match the new active org. */
export async function invalidateOrgScopedClientCaches(
  client: OrgScopedQueryClient,
  input: {
    readonly removeStale?: boolean
    readonly cancelInFlight?: boolean
  } = {}
) {
  if (input.cancelInFlight) {
    await Promise.all(
      ORG_SCOPED_QUERY_ROOTS.map((root) =>
        client.cancelQueries({ queryKey: [root] })
      )
    )
  }
  await Promise.all(
    ORG_SCOPED_QUERY_ROOTS.map((root) =>
      input.removeStale
        ? client.removeQueries({ queryKey: [root] })
        : client.invalidateQueries({ queryKey: [root] })
    )
  )
}
