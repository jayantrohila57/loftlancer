import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const variablesSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "variables.ts"),
  "utf8",
);

function createBatchBlock(): string {
  const start = variablesSource.indexOf("createBatch:");
  assert.notEqual(start, -1);
  const end = variablesSource.indexOf("bulkImport:", start);
  assert.notEqual(end, -1);
  return variablesSource.slice(start, end);
}

describe("variables.createBatch environment access", () => {
  it("authorizes environments via assertEnvironmentsAccess (soft-delete aware)", () => {
    const block = createBatchBlock();
    assert.doesNotMatch(
      block,
      /eq\(project\.userId,\s*ctx\.session\.user\.id\)/,
      "must not authorize environments with project.userId only",
    );
    assert.match(block, /assertEnvironmentsAccess\(/);
  });

  it("filters duplicate checks to active variables", () => {
    const block = createBatchBlock();
    assert.match(block, /activeEnvironmentVariableWhere\(/);
  });
});
