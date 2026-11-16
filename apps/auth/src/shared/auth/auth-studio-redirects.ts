import { buildStudioLocalePath } from "./auth-studio-app-url"

export type AuthAppRedirectRule = {
  readonly source: string
  readonly destination: string
  readonly permanent: boolean
  readonly basePath?: false
}

/** Permanent Auth → Studio redirects for organization surfaces moved out of Auth. */
export function buildAuthMigratedStudioRedirects(): AuthAppRedirectRule[] {
  const rules: Array<{
    readonly source: string
    readonly studioPath: string
  }> = [
    { source: "/:lang/organizations", studioPath: "/organizations" },
    {
      source: "/:lang/organizations/:path*",
      studioPath: "/organizations/:path*",
    },
    {
      source: "/:lang/account/organization",
      studioPath: "/settings",
    },
    {
      source: "/:lang/account/organization/:path*",
      studioPath: "/settings",
    },
    { source: "/:lang/account/billing", studioPath: "/settings" },
    { source: "/:lang/account/billing/:path*", studioPath: "/settings" },
    { source: "/:lang/account/subscription", studioPath: "/settings" },
    { source: "/:lang/account/subscription/:path*", studioPath: "/settings" },
    { source: "/:lang/account/ai-usage", studioPath: "/organizations" },
    { source: "/:lang/account/ai-usage/:path*", studioPath: "/organizations" },
    { source: "/:lang/account/storage", studioPath: "/organizations" },
    { source: "/:lang/account/storage/:path*", studioPath: "/organizations" },
  ]

  return rules.map(({ source, studioPath }) => ({
    source,
    destination: buildStudioLocalePath(":lang", studioPath),
    permanent: true,
  }))
}
