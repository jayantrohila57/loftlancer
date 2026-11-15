export const adminUsersRoutes = {
  list: {
    method: "POST" as const,
    path: "/openapi/admin/users/list" as const,
    summary: "List users",
    description:
      "Lists platform users for verified administrators on the allowlist.",
    tags: ["Administration"],
  },
}
