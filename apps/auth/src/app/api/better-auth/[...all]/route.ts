/**
 * Legacy Better Auth mount (`/api/better-auth/*`) for OAuth callbacks and bookmarks
 * registered before the `/better-auth` + `/api/auth` cutover. Delegates to the
 * platform handler at `app/api/auth/[...all]`.
 */
export { GET, OPTIONS, POST } from "../../auth/[...all]/route";
