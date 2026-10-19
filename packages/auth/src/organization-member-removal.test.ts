import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "organization-member-removal.ts",
  ),
  "utf8",
);

describe("organization member access cleanup", () => {
  it("scopes team membership cleanup to the target user and organization", () => {
    assert.match(
      source,
      /innerJoin\(team, eq\(teamMember\.teamId, team\.id\)\)/,
    );
    assert.match(source, /eq\(team\.organizationId, input\.organizationId\)/);
    assert.match(source, /eq\(teamMember\.userId, input\.userId\)/);
  });

  it("scopes project manager and grant cleanup to the same org and user", () => {
    assert.match(
      source,
      /eq\(projectManager\.organizationId, input\.organizationId\)/,
    );
    assert.match(source, /eq\(projectManager\.userId, input\.userId\)/);
    assert.match(
      source,
      /eq\(projectMemberGrant\.organizationId, input\.organizationId\)/,
    );
    assert.match(source, /eq\(projectMemberGrant\.userId, input\.userId\)/);
  });

  it("does not delete the account or organization membership", () => {
    assert.doesNotMatch(source, /delete\(member\)|delete\(user\)/);
  });
});
