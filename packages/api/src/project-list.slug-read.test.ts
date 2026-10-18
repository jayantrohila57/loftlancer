import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const projectListSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "project-list.ts"),
  "utf8",
);

const orgAccessSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "org-access.ts"),
  "utf8",
);

const projectsRouterSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "routers", "projects.ts"),
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

  it("getBySlug does not resolve slug globally before read scope", () => {
    const block = projectsRouterSource.match(
      /getBySlug:\s*orgProcedure[\s\S]*?create:\s*orgProcedure/,
    )?.[0];
    assert.ok(block, "expected getBySlug procedure");
    assert.match(block, /findReadableProjectIdBySlug/);
    assert.doesNotMatch(
      block,
      /orgId\s*\?\s*and\(\s*eq\(project\.slug, slug\)/,
      "action guard must not use org-only slug lookup",
    );
    assert.doesNotMatch(
      block,
      /assertProjectAccess/,
      "getBySlug must not leak slug existence via assertProjectAccess NOT_FOUND",
    );
    assert.match(
      block,
      /where\(and\(eq\(project\.slug, input\.slug\), readScope\)\)/,
      "handler must combine slug with projectReadWhere",
    );
  });

  it("unreadable and missing slugs both return empty project data without NOT_FOUND throw", () => {
    const block = projectsRouterSource.match(
      /getBySlug:\s*orgProcedure[\s\S]*?create:\s*orgProcedure/,
    )?.[0];
    assert.ok(block);
    assert.match(block, /project: null/);
    assert.doesNotMatch(block, /TRPCError[\s\S]*NOT_FOUND/);
  });
});
