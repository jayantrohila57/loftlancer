export const signInMethodsRoutes = {
  accounts: {
    method: "POST" as const,
    path: "/openapi/security/sign-in-methods/accounts" as const,
    summary: "List linked accounts for the current user",
    tags: ["Providers"],
  },
  inventory: {
    method: "POST" as const,
    path: "/openapi/security/sign-in-methods/inventory" as const,
    summary: "List active sign-in methods and provider availability",
    tags: ["Providers"],
  },
}
