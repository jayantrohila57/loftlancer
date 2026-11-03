import {
  FEATURE_FLAG_PAIRS,
  SERVER_ONLY_FEATURE_FLAGS,
} from "../constants/t3-env.feature-flags.constants";
import type { FeatureFlagSnapshotRow } from "../types/t3-env.feature-flags.types";

export {
  FEATURE_FLAG_PAIRS,
  SERVER_ONLY_FEATURE_FLAGS,
} from "../constants/t3-env.feature-flags.constants";
export type {
  FeatureFlagPair,
  FeatureFlagSnapshotRow,
  ServerOnlyFeatureFlag,
} from "../types/t3-env.feature-flags.types";

export function isEnvFlagTrue(
  env: Record<string, string | undefined>,
  key: string,
): boolean {
  return env[key] === "true";
}

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
