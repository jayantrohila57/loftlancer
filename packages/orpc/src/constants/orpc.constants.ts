/** Package identity — transport shell for `@orpc/*` (+ legacy tRPC until removed). */
export const ORPC_PACKAGE_NAME = "@loftlancer/orpc" as const;

/** HTTP catch-all mount used by Studio / Auth apps. */
export const ORPC_HTTP_PATH = "/api/orpc" as const;

/** Legacy tRPC mount — delete with tRPC routers. */
export const TRPC_HTTP_PATH = "/api/trpc" as const;
