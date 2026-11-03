import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  E2E_DEMO_SEED_MARKER,
  E2E_DEMO_VAR_KEY,
  E2E_DEMO_VARIABLE_DEFS,
} from "../src/utils/drizzle.e2e-demo-variables";

describe("E2E demo variable seed defs", () => {
  it("includes E2E_DEMO_KEY and multiple fake placeholders per environment", () => {
    assert.ok(E2E_DEMO_VARIABLE_DEFS.length >= 4);

    const demoKey = E2E_DEMO_VARIABLE_DEFS.find(
      (def) => def.key === E2E_DEMO_VAR_KEY,
    );
    assert.ok(demoKey);
    assert.equal(demoKey.value, "playwright-local-demo-value");
  });

  it("marks every seeded row as fake/dev-only in notes", () => {
    for (const def of E2E_DEMO_VARIABLE_DEFS) {
      assert.match(def.note, new RegExp(E2E_DEMO_SEED_MARKER));
    }
  });

  it("uses non-production sample values for secrets", () => {
    const secrets = E2E_DEMO_VARIABLE_DEFS.filter(
      (def) => def.type === "secret",
    );
    assert.ok(secrets.length >= 1);
    for (const def of secrets) {
      assert.match(def.value, /fake|sample|placeholder|example/i);
    }
  });
});
