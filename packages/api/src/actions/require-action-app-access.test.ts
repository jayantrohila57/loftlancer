import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const requireActionSource = readFileSync(
  join(root, "require-action.ts"),
  "utf8",
);
const snapshotSource = readFileSync(
  join(root, "permissions-snapshot.ts"),
  "utf8",
);

describe("application access enforcement", () => {
  it("enforces app grants after parent project authorization in the server guard", () => {
    const projectDecision = requireActionSource.indexOf(
      "if (!decision.allowed)",
    );
    const appDecision = requireActionSource.indexOf("hasProjectAppAccess({");
    assert.ok(projectDecision >= 0 && appDecision > projectDecision);
    assert.match(requireActionSource, /app_access_denied/);
    assert.match(
      requireActionSource,
      /message: "You don't have access to this app\."/,
    );
  });

  it("uses the same app access evaluator for client permission snapshots", () => {
    assert.match(snapshotSource, /hasProjectAppAccess\s*\(/);
    assert.match(snapshotSource, /appAccess\.get\(appId\)/);
  });
});
