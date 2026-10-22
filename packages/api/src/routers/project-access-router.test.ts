import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "project-access-router.ts"),
  "utf8",
);
const serviceSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../project-access/service.ts"),
  "utf8",
);

function assignManagerBlock(): string {
  const start = routerSource.indexOf("assignManager:");
  assert.notEqual(start, -1);
  const end = routerSource.indexOf("setMemberGrants:", start);
  assert.notEqual(end, -1);
  return routerSource.slice(start, end);
}

describe("projectAccessRouter assignManager", () => {
  it("passes projectId into actionGuard for project-scoped RBAC", () => {
    const block = assignManagerBlock();
    assert.match(
      block,
      /actionGuard\("project\.assign_manager",\s*\(input\)\s*=>\s*\(\{\s*projectId:/,
    );
  });

  it("calls assertProjectAccess before upserting a manager row", () => {
    const block = assignManagerBlock();
    const assertIdx = block.indexOf("assertProjectAccess(");
    const upsertIdx = block.indexOf("upsertProjectManagerRow(");
    assert.notEqual(assertIdx, -1);
    assert.notEqual(upsertIdx, -1);
    assert.ok(assertIdx < upsertIdx);
  });

  it("requires manager targets to be active members in the active organization", () => {
    const block = assignManagerBlock();
    assert.match(block, /activeMemberWhere\(/);
    assert.match(block, /eq\(member\.organizationId, organizationId\)/);
    assert.match(block, /Project managers must be active organization members/);
  });

  it("checks the project and active organization member before changing grants", () => {
    const start = routerSource.indexOf("setMemberGrants:");
    const end = routerSource.indexOf("assignTeam:", start);
    const block = routerSource.slice(start, end);
    assert.match(block, /assertProjectAccess\(/);
    assert.match(block, /activeMemberWhere\(/);
    assert.match(block, /One or more project permission grants are invalid/);
  });
});

describe("project manager service scope", () => {
  it("checks project ownership and active organization membership before inserting", () => {
    const start = serviceSource.indexOf(
      "export async function upsertProjectManagerRow(",
    );
    const end = serviceSource.indexOf(
      "export async function softDeleteProjectManager(",
      start,
    );
    const block = serviceSource.slice(start, end);
    const projectCheck = block.indexOf(
      "eq(project.organizationId, input.organizationId)",
    );
    const memberCheck = block.indexOf("activeMemberWhere(");
    const insert = block.indexOf("db.insert(projectManager)");
    assert.notEqual(projectCheck, -1);
    assert.notEqual(memberCheck, -1);
    assert.notEqual(insert, -1);
    assert.ok(projectCheck < insert);
    assert.ok(memberCheck < insert);
  });
});
