import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v3";

import { platformUrlRuntimeEnv, platformUrlSchema } from "./t3-env.platform";

/** Client + server env for `apps/auth`. */
export const env = createEnv({
  server: {
    MCP_RESOURCE_URL: z.string().url().optional(),
  },
  client: {
    ...platformUrlSchema,
  },
  runtimeEnv: {
    MCP_RESOURCE_URL: process.env.MCP_RESOURCE_URL,
    ...platformUrlRuntimeEnv,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
