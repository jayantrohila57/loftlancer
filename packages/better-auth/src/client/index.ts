/**
 * Better Auth React client factory and path helpers.
 * Product UI (e.g. impersonation chrome) lives in `@features/authentication`.
 */
export { createAuthClient } from "better-auth/react";
export { BETTER_AUTH_CLIENT_API_PATH } from "./constants";
export {
  createLoftlancerAuthClient,
  type LoftlancerAuthClient,
} from "./core";
export type { CreateLoftlancerAuthClientOptions } from "./types";
export { resolveBetterAuthClientApiBaseURL } from "./utils";
