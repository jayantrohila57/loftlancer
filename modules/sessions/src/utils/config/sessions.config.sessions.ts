export const sessionsRoutes = {
  list: {
    method: "POST" as const,
    path: "/openapi/security/sessions/list" as const,
    summary: "List active sessions",
    description:
      "Returns session tokens needed for revocation; handle as sensitive data.",
    tags: ["Sessions"],
  },
}
