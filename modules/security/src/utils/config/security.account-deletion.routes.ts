export const securityAccountDeletionRoutes = {
  status: {
    method: "POST" as const,
    path: "/openapi/security/account-deletion/status" as const,
    summary: "Owned organizations blocking account deletion",
    tags: ["Security"],
  },
}
