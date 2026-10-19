import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ORG_STATIC_ROUTES,
  PROJECT_STATIC_ROUTES,
  planOrgSubtree,
} from "./org-route-preflight";

const plan = (p: string) => planOrgSubtree(p, "acme");

describe("planOrgSubtree (#309)", () => {
  it("leaves the org itself and its static pages alone", () => {
    assert.deepEqual(plan("/acme"), { kind: "org" });
    for (const route of ORG_STATIC_ROUTES) {
      assert.deepEqual(plan(`/acme/${route}`), { kind: "org" }, route);
    }
  });

  it("ignores paths for another org", () => {
    assert.deepEqual(plan("/other/web/nope"), { kind: "org" });
    assert.deepEqual(plan(""), { kind: "org" });
  });

  it("404s unknown routes under org-level words", () => {
    for (const p of [
      "/acme/members/x",
      "/acme/projects/old",
      "/acme/new",
      "/acme/overview",
      "/acme/apps",
      "/acme/Members",
    ]) {
      assert.deepEqual(plan(p), { kind: "not-found" }, p);
    }
  });

  it("resolves the project for its static pages", () => {
    assert.deepEqual(plan("/acme/web"), {
      kind: "project",
      projectSlug: "web",
    });
    for (const route of PROJECT_STATIC_ROUTES) {
      assert.deepEqual(
        plan(`/acme/web/${route}`),
        { kind: "project", projectSlug: "web" },
        route,
      );
    }
  });

  it("checks the env slug and task number", () => {
    assert.deepEqual(plan("/acme/web/env/prod"), {
      kind: "project",
      projectSlug: "web",
      resource: { kind: "env", envSlug: "prod" },
    });
    assert.deepEqual(plan("/acme/web/tasks/12"), {
      kind: "project",
      projectSlug: "web",
      resource: { kind: "task", number: 12 },
    });
  });

  it("404s unknown routes under a project", () => {
    for (const p of [
      "/acme/web/nope-app",
      "/acme/web/nope-app/settings",
      "/acme/web/apps/settings",
      "/acme/web/settings/settings",
      "/acme/web/tasks/abc",
      "/acme/web/tasks/0",
      "/acme/web/tasks/12345678901",
      "/acme/web/foo/bar/baz",
      "/acme/web/env/prod/x",
    ]) {
      assert.deepEqual(plan(p), { kind: "not-found" }, p);
    }
  });

  it("decodes segments", () => {
    assert.deepEqual(plan("/acme/my%2Dweb"), {
      kind: "project",
      projectSlug: "my-web",
    });
    assert.deepEqual(plan("/acme/%E0%A4%A"), { kind: "org" });
  });
});

/** Every page.tsx under app/(private)/(shell)/[org], relative to the org. */
function orgPages(): string[] {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../app/(private)/(shell)/[org]",
  );
  const pages: string[] = [];
  const walk = (dir: string, rel: string[]) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full, [...rel, name]);
      else if (name === "page.tsx") pages.push(rel.join("/"));
    }
  };
  walk(root, []);
  return pages.sort();
}

describe("route tables match the [org] folder", () => {
  it("covers every page", () => {
    const known = new Set([
      "",
      ...ORG_STATIC_ROUTES,
      "[project]",
      ...PROJECT_STATIC_ROUTES.map((r) => `[project]/${r}`),
      // Dynamic pages planOrgSubtree handles explicitly.
      "[project]/[app]",
      "[project]/[app]/settings",
      "[project]/env/[envSlug]",
      "[project]/tasks/[taskNumber]",
      "teams/[teamId]",
    ]);
    assert.deepEqual(orgPages(), [...known].sort());
  });
});
