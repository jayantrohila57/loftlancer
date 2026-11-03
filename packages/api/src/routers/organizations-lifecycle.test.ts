import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const router = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "organizations.ts"),
  "utf8",
);
const lifecycleController = readFileSync(
  new URL(
    "../../../../module/organizations/server/controller/server.organization-lifecycle.controller.ts",
    import.meta.url,
  ),
  "utf8",
);
const requireAction = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../actions/require-action.ts"),
  "utf8",
);
const auth = readFileSync(
  new URL("../../../auth/src/auth-shared.ts", import.meta.url),
  "utf8",
);

describe("organization lifecycle access", () => {
  it("routes archive and restore through the lifecycle controllers", () => {
    assert.match(
      router,
      /archive: orgProcedure\.mutation[\s\S]*?organizationArchiveController/,
    );
    assert.match(
      router,
      /unarchive: orgProcedure\.mutation[\s\S]*?organizationUnarchiveController/,
    );
    assert.match(lifecycleController, /action: "organization\.archive"/);
    assert.match(lifecycleController, /action: "organization\.unarchive"/);
  });

  it("blocks archived organization writes in shared permission evaluation", () => {
    assert.match(requireAction, /organizationState\?\.archivedAt/);
    assert.match(requireAction, /organization\.unarchive/);
    assert.match(requireAction, /organization_archived/);
  });

  it("blocks Better Auth member, invite, team and organization mutations", () => {
    assert.match(auth, /beforeAddMember:[\s\S]*?assertOrganizationNotArchived/);
    assert.match(
      auth,
      /beforeCreateInvitation:[\s\S]*?assertOrganizationNotArchived/,
    );
    assert.match(
      auth,
      /beforeCreateTeam:[\s\S]*?assertOrganizationNotArchived/,
    );
    assert.match(
      auth,
      /beforeUpdateOrganization:[\s\S]*?assertOrganizationNotArchived/,
    );
  });
});
