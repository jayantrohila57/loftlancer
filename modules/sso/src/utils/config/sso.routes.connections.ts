export const ssoConnectionsRoutes = {
  list: {
    method: "POST" as const,
    path: "/openapi/admin/sso/connections/list" as const,
    summary: "List SSO connections",
    tags: ["SSO", "Admin"],
  },
}
