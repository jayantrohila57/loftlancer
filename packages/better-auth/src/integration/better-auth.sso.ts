import { sso } from "@better-auth/sso"

function isAdminRole(role: string | null | undefined): boolean {
  return (role ?? "user").split(",").some((value) => value.trim() === "admin")
}

/**
 * Enterprise SSO foundation. Domain verification, SAML-first flows, and IdP
 * defaults stay disabled until approved in docs/work/requirements/better-auth.md.
 */
export function buildSsoPlugin() {
  return sso({
    disableImplicitSignUp: true,
    providersLimit: async (user) => {
      const role =
        "role" in user ? (user as { role?: string | null }).role : undefined
      return isAdminRole(role) ? 10 : 0
    },
    schema: {
      ssoProvider: {
        fields: {
          oidcConfig: "oidcConfig",
          samlConfig: "samlConfig",
          userId: "userId",
          providerId: "providerId",
          organizationId: "organizationId",
        },
      },
    },
  })
}
