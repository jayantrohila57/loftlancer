import type { QueryClient } from "@tanstack/react-query";

const ORG_SCOPED_TRPC_ROUTERS = new Set([
  "auditLogs",
  "dashboard",
  "environmentVariables",
  "environments",
  "notifications",
  "organizations",
  "permissions",
  "projectAccess",
  "projectApps",
  "projects",
  "sidebar",
  "tasks",
  "teams",
]);

const ORG_SCOPED_CUSTOM_QUERY_KEYS = new Set([
  "org-active-member-role",
  "team-members-sheet",
]);

function isOrgScopedQuery(queryKey: unknown): boolean {
  if (!Array.isArray(queryKey)) return false;

  const queryRoot = queryKey[0];
  const namespace = Array.isArray(queryRoot) ? queryRoot[0] : queryRoot;
  return (
    typeof namespace === "string" &&
    (ORG_SCOPED_TRPC_ROUTERS.has(namespace) ||
      ORG_SCOPED_CUSTOM_QUERY_KEYS.has(namespace))
  );
}

/** Drop org-scoped API cache after the active organization changes (session cookie updated). */
export function invalidateAfterOrganizationChange(queryClient: QueryClient) {
  return queryClient.removeQueries({
    predicate: (query) => isOrgScopedQuery(query.queryKey),
  });
}
