import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const requireActionSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "require-action.ts"),
  "utf8",
);
const projectAccessSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "project-access.ts"),
  "utf8",
);
const snapshotSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "permissions-snapshot.ts"),
  "utf8",
);

describe("requireAction org membership lookup", () => {
  it("filters soft-deleted members via activeMemberWhere", () => {
    const memberQueryStart = requireActionSource.indexOf(".from(member)");
    assert.ok(
      memberQueryStart >= 0,
      "expected member table lookup in require-action",
    );

    const memberQueryEnd = requireActionSource.indexOf(
      ".limit(1)",
      memberQueryStart,
    );
    assert.ok(memberQueryEnd > memberQueryStart);

    const membershipQuery = requireActionSource.slice(
      memberQueryStart,
      memberQueryEnd,
    );
    assert.match(membershipQuery, /activeMemberWhere\s*\(/);
    assert.match(membershipQuery, /isNull\(organization\.deletedAt\)/);
  });

  it("rejects project IDs outside the active organization", () => {
    assert.match(requireActionSource, /project_org_mismatch/);
    assert.match(requireActionSource, /code: "NOT_FOUND"/);
    assert.match(projectAccessSource, /projectBelongsToOrganization\(/);
    assert.match(
      projectAccessSource,
      /eq\(projectManager\.organizationId, proj\.organizationId!/,
    );
    assert.match(
      projectAccessSource,
      /eq\(projectTeam\.organizationId, proj\.organizationId!/,
    );
  });

  it("uses the same active membership and organization checks in snapshots", () => {
    assert.match(snapshotSource, /activeMemberWhere\s*\(/);
    assert.match(snapshotSource, /isNull\(organization\.deletedAt\)/);
    assert.match(snapshotSource, /!projectCtx\?\.belongsToOrganization/);
  });
});
