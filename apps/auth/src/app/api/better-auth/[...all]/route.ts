/**
 * Legacy Better Auth mount (`/api/better-auth/*`) for OAuth callbacks and bookmarks
 * retained for legacy `/api/better-auth/*` clients and OAuth callbacks. Delegates
 * to the canonical platform handler at `app/api/auth/[...all]`.
 */
export { GET, OPTIONS, POST } from "../../auth/[...all]/route";
