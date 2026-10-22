import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const routerSource = readFileSync(join(here, "routers/projects.ts"), "utf8");
const restoreSource = readFileSync(join(here, "mcp/restore-ops.ts"), "utf8");
const accessSource = readFileSync(
  join(here, "actions/project-access.ts"),
  "utf8",
);
const permissionSource = readFileSync(
  join(here, "actions/require-action.ts"),
  "utf8",
);
const softDeleteSource = readFileSync(
  join(here, "../../db/src/soft-delete.ts"),
  "utf8",
);

describe("project restore lifecycle", () => {
  it("scopes the deleted-project directory to the active organization and restore access", () => {
    assert.match(routerSource, /deleted: orgProcedure/);
    assert.match(routerSource, /eq\(project\.organizationId, organizationId\)/);
    assert.match(routerSource, /requireAction\("project\.restore"/);
    assert.match(
      routerSource,
      /restorableProjects\.filter\(\(row\) => row !== null\)/,
    );
  });

  it("evaluates project grants against deleted projects only for restore", () => {
    assert.match(
      permissionSource,
      /includeDeleted: action === "project\.restore"/,
    );
    assert.match(
      accessSource,
      /options\.includeDeleted \? \[\] : \[isNull\(project\.deletedAt\)\]/,
    );
  });

  it("restores only child environments and variables deleted with this project", () => {
    assert.match(restoreSource, /eq\(environment\.deletedAt, deletedAt\)/);
    assert.match(
      restoreSource,
      /eq\(environmentVariable\.deletedAt, deletedAt\)/,
    );
    assert.match(restoreSource, /eq\(project\.deletedAt, deletedAt\)/);
    assert.match(
      softDeleteSource,
      /softDeleteEnvironmentsByProjectId\([\s\S]*deletedAt/,
    );
  });
});
