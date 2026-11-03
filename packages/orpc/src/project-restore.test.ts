import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const restoreSource = readFileSync(join(here, "mcp/restore-ops.ts"), "utf8");
const accessSource = readFileSync(
  join(here, "actions/project-access.ts"),
  "utf8",
);
const permissionSource = readFileSync(
  join(
    here,
    "../../../features/authorization/src/core/server/authorization.require-action.ts",
  ),
  "utf8",
);
const softDeleteSource = readFileSync(
  join(here, "../../drizzle/src/utils/drizzle.soft-delete.ts"),
  "utf8",
);

describe("project restore lifecycle", () => {
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
