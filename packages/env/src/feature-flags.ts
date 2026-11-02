/**
 * Canonical feature-flag pairs for production deploy (see docs/database.md).
 * Client flags are inlined at `next build`; Turbo must list them in `globalEnv` / `build.env`.
 */

export type FeatureFlagPair = {
  id: string;
  label: string;
  serverKey: string;
  clientKey: string;
  docPath: string;
};

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

export type ServerOnlyFeatureFlag = {
  id: string;
  label: string;
  serverKey: string;
  docPath: string;
};

/** Runtime-only flags (no NEXT_PUBLIC mirror). */
export const SERVER_ONLY_FEATURE_FLAGS: ServerOnlyFeatureFlag[] = [
  {
    id: "soft-deletes",
    label: "Soft deletes",
    serverKey: "SOFT_DELETES_ENABLED",
    docPath: "docs/product.md",
  },
];

export function isEnvFlagTrue(
  env: Record<string, string | undefined>,
  key: string,
): boolean {
  return env[key] === "true";
}

export type FeatureFlagSnapshotRow = {
  id: string;
  label: string;
  serverKey: string;
  clientKey: string | null;
  serverEnabled: boolean;
  docPath: string;
};

export function buildFeatureFlagSnapshot(
  env: Record<string, string | undefined>,
): FeatureFlagSnapshotRow[] {
  const paired = FEATURE_FLAG_PAIRS.map((pair) => ({
    id: pair.id,
    label: pair.label,
    serverKey: pair.serverKey,
    clientKey: pair.clientKey,
    serverEnabled: isEnvFlagTrue(env, pair.serverKey),
    docPath: pair.docPath,
  }));
  const serverOnly = SERVER_ONLY_FEATURE_FLAGS.map((flag) => ({
    id: flag.id,
    label: flag.label,
    serverKey: flag.serverKey,
    clientKey: null,
    serverEnabled: isEnvFlagTrue(env, flag.serverKey),
    docPath: flag.docPath,
  }));
  return [...paired, ...serverOnly];
}

/** All Turbo cache keys that must track NEXT_PUBLIC feature flags. */
export function clientFeatureFlagEnvKeys(): string[] {
  return FEATURE_FLAG_PAIRS.map((pair) => pair.clientKey);
}

/** Server keys that affect build/runtime and should be in `tasks.build.env`. */
export function serverFeatureFlagEnvKeysForBuild(): string[] {
  return [
    ...FEATURE_FLAG_PAIRS.map((pair) => pair.serverKey),
    ...SERVER_ONLY_FEATURE_FLAGS.map((flag) => flag.serverKey),
  ];
}
