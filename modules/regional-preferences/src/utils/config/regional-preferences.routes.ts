export const regionalPreferencesRoutes = {
  get: {
    method: "POST" as const,
    path: "/openapi/security/regional-preferences/get" as const,
    summary: "Get regional preferences",
    tags: ["Regional preferences"],
  },
  update: {
    method: "POST" as const,
    path: "/openapi/security/regional-preferences/update" as const,
    summary: "Update regional preferences",
    tags: ["Regional preferences"],
  },
}
