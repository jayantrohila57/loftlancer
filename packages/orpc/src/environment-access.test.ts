import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const source = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    "../../../module/environments/server/service/server.environment-access.service.ts",
  ),
  "utf8",
);

function assertEnvironmentsAccessBlock(): string {
  const start = source.indexOf(
    "export async function assertEnvironmentsAccess",
  );
  assert.notEqual(start, -1);
  const end = source.indexOf("export async function", start + 1);
  return source.slice(start, end === -1 ? undefined : end);
}

describe("assertEnvironmentsAccess", () => {
  it("scopes environment rows with activeEnvironmentWhere", () => {
    const block = assertEnvironmentsAccessBlock();
    assert.match(
      block,
      /activeEnvironmentWhere\(inArray\(environment\.id, environmentIds\)\)/,
    );
  });
});
