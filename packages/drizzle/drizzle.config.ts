import "./config/drizzle.load-auth-env.ts"

import { serverEnv } from "@packages/t3-env/server"
import { defineConfig } from "drizzle-kit"

const databaseUrl = serverEnv.DATABASE_URL

if (!databaseUrl && process.env.SKIP_ENV_VALIDATION !== "true") {
  throw new Error(
    "DATABASE_URL is required. Set it in apps/auth/.env and start Postgres (infra/db/postgres)."
  )
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      databaseUrl ??
      "postgresql://postgres:postgres@localhost:5432/loftlancer_auth",
  },
})
