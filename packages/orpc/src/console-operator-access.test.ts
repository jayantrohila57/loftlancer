import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type ConsoleAccessEvaluation,
  evaluateConsoleOperatorAccess,
} from "./console-operator-access";

describe("evaluateConsoleOperatorAccess", () => {
  it("marks missing session as unauthenticated", () => {
    const result = evaluateConsoleOperatorAccess(null);
    assert.equal(result.allowed, false);
    assert.equal(result.reason, "unauthenticated");
  });

  it("distinguishes unauthenticated from operator denial", () => {
    const unauth: ConsoleAccessEvaluation = evaluateConsoleOperatorAccess(null);
    const denied: ConsoleAccessEvaluation = evaluateConsoleOperatorAccess({
      user: {
        id: "u1",
        email: "member@example.com",
        role: "user",
      },
    });
    assert.equal(unauth.reason, "unauthenticated");
    assert.notEqual(denied.reason, "unauthenticated");
    assert.equal(denied.allowed, false);
  });

  it("allows allowlisted email without Better Auth admin role when list is set", () => {
    const prev = process.env.CONSOLE_ALLOWED_EMAILS;
    process.env.CONSOLE_ALLOWED_EMAILS = "jrohila55@gmail.com";
    try {
      const result = evaluateConsoleOperatorAccess({
        user: {
          id: "u1",
          email: "jrohila55@gmail.com",
          role: "user",
        },
      });
      assert.equal(result.allowed, true);
      assert.equal(result.reason, "ok");
      assert.equal(result.allowlistMatch, true);
    } finally {
      process.env.CONSOLE_ALLOWED_EMAILS = prev;
    }
  });
});
