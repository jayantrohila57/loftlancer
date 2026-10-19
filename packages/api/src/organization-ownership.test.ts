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
const actionRegistrySource = readFileSync(
  join(sourceDir, "../../actions/src/registry-data.ts"),
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

  it("sends MCP invitations through the shared email flow and audits them", () => {
    assert.match(mcpSource, /sendOrganizationInvitationEmail\(/);
    assert.match(mcpSource, /invitation_already_pending/);
    assert.match(mcpSource, /invitation_email_is_already_a_member/);
    assert.match(mcpSource, /action: "member\.invite"/);
    assert.match(mcpSource, /status: "cancelled"/);
  });

  it("lets only the invited account accept or reject before joining the organization", () => {
    assert.match(
      actionRegistrySource,
      /name: "invitation\.accept",\s+scope: "user",[\s\S]*?selfOnly: true/,
    );
    assert.match(
      actionRegistrySource,
      /name: "invitation\.reject",\s+scope: "user",[\s\S]*?selfOnly: true/,
    );
    assert.equal(
      (mcpSource.match(/targetUserId: userId/g) ?? []).length >= 4,
      true,
    );
    assert.match(mcpSource, /action: "invitation\.accept"/);
    assert.match(mcpSource, /action: "invitation\.reject"/);
  });

  it("cleans organization-scoped team and project access inside MCP member removal", () => {
    const start = mcpSource.indexOf("export async function mcpMemberRemove");
    const end = mcpSource.indexOf(
      "export async function mcpMemberUpdateRole",
      start,
    );
    const block = mcpSource.slice(start, end);
    assert.match(block, /db\.transaction\(async \(tx\)/);
    assert.match(block, /eq\(team\.organizationId, organizationId\)/);
    assert.match(block, /eq\(projectManager\.organizationId, organizationId\)/);
    assert.match(
      block,
      /eq\(projectMemberGrant\.organizationId, organizationId\)/,
    );
  });

  it("validates team membership against the organization and repairs cached counts", () => {
    const start = mcpSource.indexOf("export async function mcpTeamAddMember");
    const end = mcpSource.indexOf(
      "export async function mcpTeamRemoveMember",
      start,
    );
    const block = mcpSource.slice(start, end);
    assert.match(block, /eq\(team\.organizationId, organizationId\)/);
    assert.match(block, /organization_member_not_found/);
    assert.match(block, /count\(\*\)::int/);
  });
});
