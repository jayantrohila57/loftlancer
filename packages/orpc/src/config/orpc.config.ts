import {
  ORPC_HTTP_PATH,
  ORPC_PACKAGE_NAME,
  TRPC_HTTP_PATH,
} from "../constants/orpc.constants";

/** Static transport package config (no env secrets). */
export const orpcPackageConfig = {
  packageName: ORPC_PACKAGE_NAME,
  orpcPath: ORPC_HTTP_PATH,
  trpcPath: TRPC_HTTP_PATH,
  /** Prefer native oRPC procedures; tRPC is migration-only. */
  preferredRpc: "orpc" as const,
} as const;
