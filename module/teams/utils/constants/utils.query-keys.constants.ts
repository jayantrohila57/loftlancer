export const teamsQueryKeys = {
  operation: (orgId: string | null, operation: string, input: unknown) =>
    ["teams", orgId, operation, input] as const,
  all: ["teams"] as const,
  list: (orgId: string) => ["teams", orgId, "list"] as const,
  get: (orgId: string, teamId: string) =>
    ["teams", orgId, "get", teamId] as const,
};
