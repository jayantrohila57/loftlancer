export const helpSupportTicketRoutes = {
  list: {
    method: "POST" as const,
    path: "/openapi/security/help/support-tickets/list" as const,
    summary: "List support tickets for the signed-in user",
    tags: ["Help"],
  },
  get: {
    method: "POST" as const,
    path: "/openapi/security/help/support-tickets/get" as const,
    summary: "Get one support ticket",
    tags: ["Help"],
  },
  create: {
    method: "POST" as const,
    path: "/openapi/security/help/support-tickets/create" as const,
    summary: "Create a support ticket",
    tags: ["Help"],
  },
}
