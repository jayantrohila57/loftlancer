export const providersRoutes = {
  list: {
    method: "POST" as const,
    path: "/openapi/security/providers/list" as const,
    summary: "Get available providers",
    tags: ["Providers"],
  },
}
