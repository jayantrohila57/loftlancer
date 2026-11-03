export type CreateLoftlancerAuthClientOptions = {
  /** Auth app origin when the client runs on a sibling app (e.g. studio). Omit on same host as `/api/better-auth`. */
  baseURL?: string;
  organizationsEnabled?: boolean;
  /** Better Auth admin plugin (console impersonation, role management). */
  adminEnabled?: boolean;
  /** OAuth provider + device authorization (apps/better-auth consent and /device UI). */
  platformOAuth?: boolean;
};
