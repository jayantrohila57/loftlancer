import { z } from "zod/v3";

export {
  DEFAULT_ACCOUNT_URL,
  DEFAULT_AUTH_URL,
  DEFAULT_CONSOLE_URL,
  DEFAULT_DOCS_URL,
  DEFAULT_MCP_URL,
  DEFAULT_STUDIO_URL,
  DEFAULT_SUPPORT_URL,
} from "../constants/t3-env.platform-urls.constants";

export const platformUrlSchema = {
  NEXT_PUBLIC_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_STUDIO_URL: z.string().url().optional(),
  NEXT_PUBLIC_ACCOUNT_URL: z.string().url().optional(),
  NEXT_PUBLIC_MCP_URL: z.string().url().optional(),
  NEXT_PUBLIC_WWW_URL: z.string().url().optional(),
  NEXT_PUBLIC_CONSOLE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPPORT_URL: z.string().url().optional(),
  NEXT_PUBLIC_DOCS_URL: z.string().url().optional(),
  NEXT_PUBLIC_PLATFORM_ORIGIN: z.string().url().optional(),
} as const;

export const platformUrlRuntimeEnv = {
  NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
  NEXT_PUBLIC_STUDIO_URL: process.env.NEXT_PUBLIC_STUDIO_URL,
  NEXT_PUBLIC_ACCOUNT_URL: process.env.NEXT_PUBLIC_ACCOUNT_URL,
  NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL,
  NEXT_PUBLIC_WWW_URL: process.env.NEXT_PUBLIC_WWW_URL,
  NEXT_PUBLIC_CONSOLE_URL: process.env.NEXT_PUBLIC_CONSOLE_URL,
  NEXT_PUBLIC_SUPPORT_URL: process.env.NEXT_PUBLIC_SUPPORT_URL,
  NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
  NEXT_PUBLIC_PLATFORM_ORIGIN: process.env.NEXT_PUBLIC_PLATFORM_ORIGIN,
};

const featureFlagClient = {
  NEXT_PUBLIC_ORGANIZATIONS_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .optional(),
  NEXT_PUBLIC_NOTIFICATIONS_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .optional(),
  NEXT_PUBLIC_VARIABLES_V2_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .optional(),
  NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .optional(),
} as const;

const featureFlagRuntime = {
  NEXT_PUBLIC_ORGANIZATIONS_ENABLED:
    process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED,
  NEXT_PUBLIC_NOTIFICATIONS_ENABLED:
    process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED,
  NEXT_PUBLIC_VARIABLES_V2_ENABLED:
    process.env.NEXT_PUBLIC_VARIABLES_V2_ENABLED,
  NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED:
    process.env.NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED,
};

export const productAppClientSchema = {
  ...platformUrlSchema,
  ...featureFlagClient,
};

export const productAppRuntimeEnv = {
  ...platformUrlRuntimeEnv,
  ...featureFlagRuntime,
};
