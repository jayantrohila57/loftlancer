import "@features/authentication/core/server/authentication.register-better-auth-product-hooks";
import { createPlatformAuth } from "@loftlancer/better-auth/platform-auth";

export const platformAuth = createPlatformAuth();
