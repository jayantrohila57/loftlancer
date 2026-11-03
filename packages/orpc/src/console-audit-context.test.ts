import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getConsoleAuditContext,
  runWithConsoleAuditContext,
} from "./console-audit-context";

describe("console audit context", () => {
  it("sets source console inside runWithConsoleAuditContext", async () => {
    await runWithConsoleAuditContext(async () => {
      assert.equal(getConsoleAuditContext()?.source, "console");
    });
    assert.equal(getConsoleAuditContext(), undefined);
  });
});
