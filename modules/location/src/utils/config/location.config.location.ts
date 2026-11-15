export const locationRoutes = {
  delete: {
    method: "POST" as const,
    path: "/openapi/security/location/delete" as const,
    summary: "Delete location history",
    tags: ["Location"],
  },
  get: {
    method: "POST" as const,
    path: "/openapi/security/location/get" as const,
    summary: "Get location settings",
    tags: ["Location"],
  },
  preference: {
    method: "POST" as const,
    path: "/openapi/security/location/preference" as const,
    summary: "Update location preference",
    tags: ["Location"],
  },
  save: {
    method: "POST" as const,
    path: "/openapi/security/location/save" as const,
    summary: "Save current session location",
    tags: ["Location"],
  },
}
