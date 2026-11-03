import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aiPolicyPatchSchema, normalizeTokenCount } from "./ai-policy";

describe("AI Gateway policy contract", () => {
  it("accepts bounded gateway model ids and token budgets", () => {
    assert.equal(
      aiPolicyPatchSchema.safeParse({
        allowedModels: ["openai/gpt-4.1-mini", "anthropic/claude-sonnet-4"],
        monthlyTokenLimit: 100_000,
      }).success,
      true,
    );
  });

  it("rejects unsafe or empty policy values", () => {
    assert.equal(
      aiPolicyPatchSchema.safeParse({
        allowedModels: ["javascript:alert(1)"],
        monthlyTokenLimit: 10,
      }).success,
      false,
    );
    assert.equal(
      aiPolicyPatchSchema.safeParse({
        allowedModels: [],
        monthlyTokenLimit: -1,
      }).success,
      false,
    );
  });

  it("normalizes absent and invalid provider usage to zero", () => {
    assert.equal(normalizeTokenCount(undefined), 0);
    assert.equal(normalizeTokenCount(-1), 0);
    assert.equal(normalizeTokenCount(42), 42);
  });
});
