import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  assertE2eDemoVariableSeedAllowed,
  isE2eDemoVariableSeedEnvironmentAllowed,
  SEED_E2E_DEMO_VARIABLES_ENV,
} from "../src/utils/drizzle.e2e-demo-seed-guard";

const ENV_KEYS = [
  "VERCEL_ENV",
  "NODE_ENV",
  "E2E_TEST_MODE",
  SEED_E2E_DEMO_VARIABLES_ENV,
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  const snap: Record<string, string | undefined> = {};
  for (const key of ENV_KEYS) {
    snap[key] = process.env[key];
  }
  return snap;
}

function restoreEnv(snap: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    const value = snap[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("E2E demo variable seed production guard", () => {
  const initial = snapshotEnv();

  afterEach(() => {
    restoreEnv(initial);
  });

  it("allows local development by default", () => {
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = "development";
    delete process.env.E2E_TEST_MODE;
    delete process.env[SEED_E2E_DEMO_VARIABLES_ENV];
    assert.equal(isE2eDemoVariableSeedEnvironmentAllowed(), true);
    assertE2eDemoVariableSeedAllowed();
  });

  it("blocks Vercel production even with opt-in", () => {
    process.env.VERCEL_ENV = "production";
    process.env.NODE_ENV = "production";
    process.env[SEED_E2E_DEMO_VARIABLES_ENV] = "yes";
    process.env.E2E_TEST_MODE = "1";
    assert.equal(isE2eDemoVariableSeedEnvironmentAllowed(), false);
    assert.throws(
      () => assertE2eDemoVariableSeedAllowed(),
      /VERCEL_ENV=production/,
    );
  });

  it("blocks NODE_ENV=production without opt-in", () => {
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.E2E_TEST_MODE;
    delete process.env[SEED_E2E_DEMO_VARIABLES_ENV];
    assert.equal(isE2eDemoVariableSeedEnvironmentAllowed(), false);
    assert.throws(
      () => assertE2eDemoVariableSeedAllowed(),
      /NODE_ENV=production/,
    );
  });

  it("allows NODE_ENV=production when E2E_TEST_MODE=1", () => {
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = "production";
    process.env.E2E_TEST_MODE = "1";
    delete process.env[SEED_E2E_DEMO_VARIABLES_ENV];
    assert.equal(isE2eDemoVariableSeedEnvironmentAllowed(), true);
    assertE2eDemoVariableSeedAllowed();
  });

  it("allows NODE_ENV=production when SEED_E2E_DEMO_VARIABLES=yes", () => {
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = "production";
    delete process.env.E2E_TEST_MODE;
    process.env[SEED_E2E_DEMO_VARIABLES_ENV] = "yes";
    assert.equal(isE2eDemoVariableSeedEnvironmentAllowed(), true);
    assertE2eDemoVariableSeedAllowed();
  });
});
