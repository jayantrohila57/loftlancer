export const adminUsersRoutes = {
  list: {
    method: "POST" as const,
    path: "/openapi/admin/users/list" as const,
    summary: "List users",
    description:
      "Lists platform users for verified administrators on the allowlist.",
    tags: ["Administration"],
  },
  ban: {
    method: "POST" as const,
    path: "/openapi/admin/users/ban" as const,
    summary: "Ban user",
    description: "Suspends a platform user and revokes active sessions.",
    tags: ["Administration"],
  },
  unban: {
    method: "POST" as const,
    path: "/openapi/admin/users/unban" as const,
    summary: "Unban user",
    description: "Restores access for a suspended platform user.",
    tags: ["Administration"],
  },
}
