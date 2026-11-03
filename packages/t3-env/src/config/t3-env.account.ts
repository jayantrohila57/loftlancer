import { createEnv } from "@t3-oss/env-nextjs";

import {
  productAppClientSchema,
  productAppRuntimeEnv,
} from "./t3-env.platform";

/** Client env for `apps/account`. */
export const env = createEnv({
  client: productAppClientSchema,
  runtimeEnv: productAppRuntimeEnv,
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "1",
});
