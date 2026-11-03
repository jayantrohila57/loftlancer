import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import { normalizeDatabaseSslModeInUrl } from "../core/drizzle.connection-url";

const packageRoot = fileURLToPath(new URL("../..", import.meta.url));

/** Default app env file used by drizzle-kit when run from this package. */
export const DRIZZLE_KIT_DOTENV_PATH = resolve(
  packageRoot,
  "../../apps/studio/.env",
);

export function loadDrizzleKitEnv(
  dotenvPath: string = DRIZZLE_KIT_DOTENV_PATH,
): void {
  dotenv.config({ path: dotenvPath });
}

export function resolveDrizzleKitDatabaseUrl(
  rawUrl: string | undefined = process.env.DATABASE_URL,
): string {
  return normalizeDatabaseSslModeInUrl(rawUrl?.trim() ?? "");
}
