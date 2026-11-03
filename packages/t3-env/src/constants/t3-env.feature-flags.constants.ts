import type {
  FeatureFlagPair,
  ServerOnlyFeatureFlag,
} from "../types/t3-env.feature-flags.types";

/**
 * Canonical feature-flag pairs for production deploy (see docs/database.md).
 * Client flags are inlined at `next build`; Turbo must list them in `globalEnv` / `build.env`.
 */

/** Server + NEXT_PUBLIC mirrors — redeploy required after changing either side. */
export const FEATURE_FLAG_PAIRS: FeatureFlagPair[] = [
  {
    id: "organizations",
    label: "Organizations",
    serverKey: "ORGANIZATIONS_ENABLED",
    clientKey: "NEXT_PUBLIC_ORGANIZATIONS_ENABLED",
    docPath: "docs/database.md",
  },
  {
    id: "notifications",
    label: "Notifications",
    serverKey: "NOTIFICATIONS_ENABLED",
    clientKey: "NEXT_PUBLIC_NOTIFICATIONS_ENABLED",
    docPath: "docs/database.md",
  },
  {
    id: "variables-v2",
    label: "Variables v2",
    serverKey: "VARIABLES_V2_ENABLED",
    clientKey: "NEXT_PUBLIC_VARIABLES_V2_ENABLED",
    docPath: "docs/database.md",
  },
  {
    id: "actions-audit",
    label: "Actions audit / timeline",
    serverKey: "ACTIONS_AUDIT_ENABLED",
    clientKey: "NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED",
    docPath: "docs/database.md",
  },
];

/** Runtime-only flags (no NEXT_PUBLIC mirror). */
export const SERVER_ONLY_FEATURE_FLAGS: ServerOnlyFeatureFlag[] = [
  {
    id: "soft-deletes",
    label: "Soft deletes",
    serverKey: "SOFT_DELETES_ENABLED",
    docPath: "docs/product.md",
  },
];
