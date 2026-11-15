export const activityRoutes = {
  delete: {
    method: "POST" as const,
    path: "/openapi/security/activity/delete" as const,
    summary: "Delete account activity",
    tags: ["Activity"],
  },
  list: {
    method: "POST" as const,
    path: "/openapi/security/activity/list" as const,
    summary: "List account activity",
    tags: ["Activity"],
  },
}
