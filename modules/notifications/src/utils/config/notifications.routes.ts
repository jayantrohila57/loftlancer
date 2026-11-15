export const notificationPreferencesRoutes = {
  get: {
    method: "POST" as const,
    path: "/openapi/security/notifications/preferences/get" as const,
    summary: "Get email notification preferences",
    tags: ["Notifications"],
  },
  update: {
    method: "POST" as const,
    path: "/openapi/security/notifications/preferences/update" as const,
    summary: "Update email notification preferences",
    tags: ["Notifications"],
  },
}
