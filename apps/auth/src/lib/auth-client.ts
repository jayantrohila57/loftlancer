import { createLoftlancerAuthClient } from "@loftlancer/better-auth/client";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import { resolvePublicServiceUrl } from "@loftlancer/t3-env/vercel-services";

export const authClient = createLoftlancerAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_SERVICES === "1"
      ? resolvePublicServiceUrl("auth")
      : undefined),
  organizationsEnabled: isOrganizationsEnabled(),
  platformOAuth: true,
});
