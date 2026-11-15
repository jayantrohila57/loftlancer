export const privacyRoutes = {
  consents: {
    get: {
      method: "POST" as const,
      path: "/openapi/security/privacy/consents/get" as const,
      summary: "Get privacy consents",
      tags: ["Privacy"],
    },
    update: {
      method: "POST" as const,
      path: "/openapi/security/privacy/consents/update" as const,
      summary: "Update privacy consents",
      tags: ["Privacy"],
    },
  },
  dataExport: {
    request: {
      method: "POST" as const,
      path: "/openapi/security/privacy/data-export/request" as const,
      summary: "Request a manual data export",
      tags: ["Privacy"],
    },
  },
}
