export const appearancePreferencesRoutes = {
  get: {
    method: "POST" as const,
    path: "/openapi/security/appearance-preferences/get" as const,
    summary: "Get appearance preferences",
    tags: ["Appearance preferences"],
  },
  update: {
    method: "POST" as const,
    path: "/openapi/security/appearance-preferences/update" as const,
    summary: "Update appearance preferences",
    tags: ["Appearance preferences"],
  },
}
