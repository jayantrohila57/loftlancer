import { defineConfig } from "drizzle-kit";

import {
  loadDrizzleKitEnv,
  resolveDrizzleKitDatabaseUrl,
} from "./src/config/drizzle.kit-env";

loadDrizzleKitEnv();

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveDrizzleKitDatabaseUrl(),
  },
});
