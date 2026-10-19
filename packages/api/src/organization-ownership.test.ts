import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const sourceDir = dirname(fileURLToPath(import.meta.url));
const ownershipSource = readFileSync(
  join(sourceDir, "organization-ownership.ts"),
  "utf8",
);
const mcpSource = readFileSync(
  join(sourceDir, "mcp", "organization-ops.ts"),
  "utf8",
);

describe("organization ownership mutations", () => {
  it("transfers ownership within a locked database transaction and records the audit event", () => {
    assert.match(ownershipSource, /db\.transaction\(async \(tx\)/);
    assert.match(ownershipSource, /\.for\("update"\)/);
    assert.match(ownershipSource, /action: "organization\.transfer_ownership"/);
    assert.match(ownershipSource, /actorUserId: input\.actorUserId/);
    assert.match(ownershipSource, /targetUserId: input\.targetUserId/);
  });

  it("guards MCP member removal and role changes in transactions against a final-owner loss", () => {
    assert.equal(
      (mcpSource.match(/getOwnerMutationBlockReason\(/g) ?? []).length,
      2,
    );
    assert.match(
      mcpSource,
      /Transfer ownership first; the organization must have an owner\./,
    );
    assert.match(mcpSource, /\.for\("update"\)/);
  });
});
