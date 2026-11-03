import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "account.ts"),
  "utf8",
);

function exportDataBlock(): string {
  const start = routerSource.indexOf("exportData: protectedProcedure");
  assert.notEqual(start, -1, "exportData procedure must exist");
  const end = routerSource.indexOf("softDelete: protectedProcedure", start);
  assert.notEqual(end, -1, "exportData block must end before softDelete");
  return routerSource.slice(start, end);
}

describe("account.exportData", () => {
  it("scopes owned projects with activeProjectWhere", () => {
    const block = exportDataBlock();
    assert.match(
      block,
      /\.from\(project\)[\s\S]*?\.where\(activeProjectWhere\(eq\(project\.userId, userId\)\)\)/,
    );
  });

  it("scopes notifications with activeNotificationWhere", () => {
    const block = exportDataBlock();
    assert.match(
      block,
      /\.from\(notification\)[\s\S]*?activeNotificationWhere\(eq\(notification\.recipientUserId, userId\)\)/,
    );
  });

  it("scopes environments and variables with active*Where when loading nested rows", () => {
    const block = exportDataBlock();
    assert.match(
      block,
      /\.from\(environment\)[\s\S]*?activeEnvironmentWhere\(\s*inArray\(environment\.projectId, projectIds\),/,
    );
    assert.match(
      block,
      /\.from\(environmentVariable\)[\s\S]*?activeEnvironmentVariableWhere\(\s*inArray\(environmentVariable\.environmentId, environmentIds\),/,
    );
  });

  it("never selects decrypted or encrypted variable secret fields", () => {
    const block = exportDataBlock();
    const variablesSelectStart = block.indexOf("const variables =");
    assert.notEqual(variablesSelectStart, -1);
    const variablesSection = block.slice(variablesSelectStart);
    assert.doesNotMatch(variablesSection, /\bencryptedValue\b/);
    assert.doesNotMatch(variablesSection, /\bvalue\b/);
    assert.doesNotMatch(variablesSection, /\bdecryptedValue\b/);
    assert.match(
      variablesSection,
      /key: environmentVariable\.key/,
      "export should include variable keys only",
    );
  });

  it("documents that variable values are omitted from the export payload", () => {
    const block = exportDataBlock();
    assert.match(
      block,
      /note: "Variable values are omitted from exports; only keys and metadata are included\.",/,
    );
  });
});
