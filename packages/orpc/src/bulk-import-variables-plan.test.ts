import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planBulkVariableImport } from "@modules/environments/server/service/server.bulk-import-variables-plan.service";

const encrypt = (value: string) => `enc:${value}`;

describe("planBulkVariableImport", () => {
  it("inserts new keys and skips existing when overwrite is false", () => {
    const existing = new Map([["EXISTING", "var-1"]]);
    const plan = planBulkVariableImport(
      [
        { key: "EXISTING", value: "old" },
        { key: "NEW_KEY", value: "secret" },
      ],
      existing,
      false,
      encrypt,
    );

    assert.equal(plan.created, 1);
    assert.equal(plan.updated, 0);
    assert.equal(plan.skipped, 1);
    assert.equal(plan.insertRows.length, 1);
    assert.equal(plan.insertRows[0]?.key, "NEW_KEY");
    assert.equal(plan.insertRows[0]?.encryptedValue, "enc:secret");
    assert.equal(plan.updateRows.length, 0);
  });

  it("updates existing keys when overwrite is true", () => {
    const existing = new Map([["EXISTING", "var-1"]]);
    const plan = planBulkVariableImport(
      [
        { key: "EXISTING", value: "next" },
        { key: "BRAND_NEW", value: "v" },
      ],
      existing,
      true,
      encrypt,
    );

    assert.equal(plan.created, 1);
    assert.equal(plan.updated, 1);
    assert.equal(plan.skipped, 0);
    assert.equal(plan.updateRows[0]?.id, "var-1");
    assert.equal(plan.updateRows[0]?.encryptedValue, "enc:next");
    assert.equal(plan.insertRows[0]?.key, "BRAND_NEW");
  });

  it("returns empty batches when all keys are skipped", () => {
    const existing = new Map([
      ["A", "id-a"],
      ["B", "id-b"],
    ]);
    const plan = planBulkVariableImport(
      [
        { key: "A", value: "1" },
        { key: "B", value: "2" },
      ],
      existing,
      false,
      encrypt,
    );

    assert.equal(plan.created, 0);
    assert.equal(plan.skipped, 2);
    assert.equal(plan.insertRows.length, 0);
    assert.equal(plan.updateRows.length, 0);
  });
});
