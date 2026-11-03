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
const invitationCreateSource = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../module/organizations/server/service/server.invitation-create.service.ts",
  ),
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

const teamAddSource = readFileSync(
  join(
    sourceDir,
    "../../../module/teams/server/service/server.team-member-add.service.ts",
  ),
  "utf8",
);
const teamDefaultsSource = readFileSync(
  join(
    sourceDir,
    "../../../module/teams/server/service/server.team-project-defaults.service.ts",
  ),
  "utf8",
);
const invitationAcceptSource = readFileSync(
  join(
    sourceDir,
    "../../../module/organizations/server/service/server.organization-invitation-accept.service.ts",
  ),
  "utf8",
);
const invitationAcceptControllerSource = readFileSync(
  join(
    sourceDir,
    "../../../module/organizations/server/controller/server.organization-invitation-accept.controller.ts",
  ),
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
    assert.match(invitationCreateSource, /sendOrganizationInvitationEmail\(/);
    assert.match(mcpSource, /createOrganizationInvitation\(/);
    assert.match(invitationCreateSource, /invitation_already_pending/);
    assert.match(
      invitationCreateSource,
      /invitation_email_is_already_a_member/,
    );
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
    assert.match(invitationAcceptControllerSource, /targetUserId: ctx\.userId/);
    assert.match(
      invitationAcceptControllerSource,
      /action: "invitation\.accept"/,
    );
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
    const block = teamAddSource;
    assert.match(block, /eq\(team\.organizationId, organizationId\)/);
    assert.match(block, /organization_member_not_found/);
    assert.match(block, /count\(\*\)::int/);
  });

  it("applies linked-project defaults when an invited or existing member joins a team", () => {
    const helper = teamDefaultsSource;
    assert.match(
      helper,
      /eq\(projectTeam\.organizationId, input\.organizationId\)/,
    );
    assert.match(helper, /eq\(projectTeam\.teamId, input\.teamId\)/);
    assert.match(helper, /isNull\(projectTeam\.deletedAt\)/);
    assert.match(helper, /DEFAULT_TEAM_PROJECT_GRANTS/);
    assert.match(helper, /mergeProjectMemberGrants/);
    assert.match(helper, /isNull\(projectMemberGrant\.deletedAt\)/);
    assert.match(helper, /if \(input\.role !== "member"\) return/);

    const acceptStart = mcpSource.indexOf(
      "export async function mcpInvitationAccept",
    );
    const acceptEnd = mcpSource.indexOf(
      "export async function mcpInvitationReject",
      acceptStart,
    );
    assert.match(
      mcpSource.slice(acceptStart, acceptEnd),
      /organizationInvitationAcceptController/,
    );
    assert.match(invitationAcceptSource, /applyTeamProjectDefaults\(tx/);

    assert.match(teamAddSource, /applyTeamProjectDefaults\(tx/);
  });
});
