import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

import { platformUrlRuntimeEnv, platformUrlSchema } from "./t3-env.platform";

/** Client + server env for `apps/mcp`. */
export const env = createEnv({
  server: {
    MCP_RESOURCE_URL: z.string().url().optional(),
    MCP_RATE_LIMIT_WINDOW_MS: z.string().optional(),
    MCP_RATE_LIMIT_MAX_REQUESTS: z.string().optional(),
  },
  client: {
    ...platformUrlSchema,
  },
  runtimeEnv: {
    MCP_RESOURCE_URL: process.env.MCP_RESOURCE_URL,
    MCP_RATE_LIMIT_WINDOW_MS: process.env.MCP_RATE_LIMIT_WINDOW_MS,
    MCP_RATE_LIMIT_MAX_REQUESTS: process.env.MCP_RATE_LIMIT_MAX_REQUESTS,
    ...platformUrlRuntimeEnv,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
