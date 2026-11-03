import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  variableAuditKeyPayload,
  variableBulkImportAuditPayload,
} from "@modules/environments/server/service/server.variable-audit-payload.service";

describe("variable audit payloads", () => {
  it("records only variable keys on update/delete style payloads", () => {
    const payload = JSON.parse(variableAuditKeyPayload("API_KEY"));
    assert.equal(payload.key, "API_KEY");
    assert.equal("value" in payload, false);
  });

  it("never includes cleartext values on bulk import audit payloads", () => {
    const payload = JSON.parse(
      variableBulkImportAuditPayload({
        keys: ["A", "B"],
        overwrite: true,
        result: { created: 1, updated: 1, skipped: 0 },
      }),
    );
    assert.deepEqual(payload.keys, ["A", "B"]);
    assert.equal(payload.count, 2);
    assert.equal("variables" in payload, false);
    assert.equal("value" in payload, false);
  });
});
