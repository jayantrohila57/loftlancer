import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const projectListSource = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../module/projects/server/service/server.project-list.service.ts",
  ),
  "utf8",
);

const orgAccessSource = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../module/organizations/server/service/server.org-access.service.ts",
  ),
  "utf8",
);

describe("project slug read scope (#26)", () => {
  it("org-less readable scope is per owner so colliding slugs do not cross users", () => {
    assert.match(
      orgAccessSource,
      /projectListFilter[\s\S]*:\s*eq\(project\.userId, userId\)/,
      "orgs-off / no active org must scope projects to the caller userId",
    );
    assert.match(
      projectListSource,
      /findReadableProjectIdBySlug[\s\S]*projectReadWhere[\s\S]*eq\(project\.slug, slug\)/,
      "slug resolution must run inside the shared read predicate",
    );
  });

  it("findReadableProjectIdBySlug applies slug inside projectReadWhere", () => {
    assert.match(
      projectListSource,
      /findReadableProjectIdBySlug[\s\S]*projectReadWhere[\s\S]*eq\(project\.slug, slug\)/,
    );
  });
});
