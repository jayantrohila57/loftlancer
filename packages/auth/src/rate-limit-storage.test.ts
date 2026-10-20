import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRateLimitStorage } from "./rate-limit-storage";

describe("createRateLimitStorage", () => {
  it("allows requests up to the shared limit and denies excess requests", async () => {
    const counts = new Map<string, number>();
    const warnings: string[] = [];
    const storage = createRateLimitStorage({
      configured: true,
      increment: async (key, window, max) => {
        assert.equal(window, 60);
        assert.equal(max, 2);
        const count = (counts.get(key) ?? 0) + 1;
        counts.set(key, count);
        return { count, ttl: 42 };
      },
      warn: (message) => warnings.push(message),
    });

    assert.deepEqual(
      await storage.consume("email@example.com", { window: 60, max: 2 }),
      {
        allowed: true,
        retryAfter: null,
      },
    );
    assert.deepEqual(
      await storage.consume("email@example.com", { window: 60, max: 2 }),
      {
        allowed: true,
        retryAfter: null,
      },
    );
    assert.deepEqual(
      await storage.consume("email@example.com", { window: 60, max: 2 }),
      {
        allowed: false,
        retryAfter: 42,
      },
    );
    assert.equal(
      JSON.stringify([...counts.keys()]).includes("email@example.com"),
      false,
    );
    assert.deepEqual(warnings, []);
  });

  it("fails open and logs without exposing the key when Redis fails", async () => {
    const warnings: string[] = [];
    const storage = createRateLimitStorage({
      configured: true,
      increment: async () => {
        throw new Error("Upstash token must not be logged");
      },
      warn: (message) => warnings.push(message),
    });

    const result = await storage.consume("private-email-or-ip", {
      window: 60,
      max: 5,
    });
    assert.deepEqual(result, { allowed: true, retryAfter: null });
    await storage.consume("another-private-key", { window: 60, max: 5 });
    assert.deepEqual(warnings, [
      "shared auth rate limiter unavailable; allowing request",
    ]);
    assert.equal(warnings.join(" ").includes("private-email-or-ip"), false);
  });

  it("fails open with one warning when credentials are not configured", async () => {
    const warnings: string[] = [];
    const storage = createRateLimitStorage({
      configured: false,
      increment: async () => assert.fail("limiter must not be used"),
      warn: (message) => warnings.push(message),
    });

    assert.deepEqual(await storage.consume("one", { window: 60, max: 5 }), {
      allowed: true,
      retryAfter: null,
    });
    await storage.consume("two", { window: 60, max: 5 });
    assert.deepEqual(warnings, ["shared auth rate limiting is not configured"]);
  });
});
