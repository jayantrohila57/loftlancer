import "@features/authentication/core/server/authentication.register-better-auth-product-hooks";
import { createSiblingAuth } from "@loftlancer/better-auth/sibling-auth";
import { resolvePublicServiceUrl } from "@loftlancer/t3-env/vercel-services";

export const siblingAuth = createSiblingAuth({
  baseURL: resolvePublicServiceUrl("auth"),
});
