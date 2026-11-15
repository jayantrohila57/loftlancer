export const orgRoutes = {
  setupGet: {
    method: "POST" as const,
    path: "/openapi/security/org/setup/get" as const,
    summary: "Load organization onboarding setup",
    tags: ["Organization"],
  },
  setupPatch: {
    method: "POST" as const,
    path: "/openapi/security/org/setup/patch" as const,
    summary: "Update organization onboarding setup sections",
    tags: ["Organization"],
  },
  provisioningResume: {
    method: "POST" as const,
    path: "/openapi/security/org/provisioning/resume" as const,
    summary: "Resume partial organization provisioning",
    tags: ["Organization"],
  },
} as const
