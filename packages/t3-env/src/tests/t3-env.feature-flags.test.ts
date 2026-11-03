import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  clientFeatureFlagEnvKeys,
  FEATURE_FLAG_PAIRS,
  serverFeatureFlagEnvKeysForBuild,
} from "../utils/t3-env.feature-flags";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const turboJson = JSON.parse(
  readFileSync(join(repoRoot, "turbo.json"), "utf8"),
) as {
  globalEnv?: string[];
  tasks?: { build?: { env?: string[] } };
};

function missingKeys(
  required: string[],
  actual: string[] | undefined,
): string[] {
  const set = new Set(actual ?? []);
  return required.filter((key) => !set.has(key));
}

describe("feature flags ↔ turbo.json", () => {
  it("lists every NEXT_PUBLIC pair in globalEnv", () => {
    const missing = missingKeys(
      clientFeatureFlagEnvKeys(),
      turboJson.globalEnv,
    );
    assert.deepEqual(
      missing,
      [],
      `turbo.json globalEnv missing: ${missing.join(", ")}`,
    );
  });

  it("lists server flag keys in tasks.build.env", () => {
    const missing = missingKeys(
      serverFeatureFlagEnvKeysForBuild(),
      turboJson.tasks?.build?.env,
    );
    assert.deepEqual(
      missing,
      [],
      `turbo.json tasks.build.env missing: ${missing.join(", ")}`,
    );
  });

  it("keeps paired server keys aligned with web client schema", () => {
    const webSource = readFileSync(
      join(repoRoot, "packages/t3-env/src/config/t3-env.web.ts"),
      "utf8",
    );
    for (const pair of FEATURE_FLAG_PAIRS) {
      assert.match(
        webSource,
        new RegExp(pair.clientKey),
        `packages/t3-env/src/config/t3-env.web.ts should declare ${pair.clientKey}`,
      );
    }
  });
});
