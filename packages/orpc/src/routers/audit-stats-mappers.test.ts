import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  actionCountsFromGroupAggregate,
  totalFromCountAggregate,
} from "./audit-stats-mappers";

describe("audit.stats SQL aggregate mappers", () => {
  it("reads totalLogs from a single count() row", () => {
    assert.equal(totalFromCountAggregate([{ count: 42 }]), 42);
    assert.equal(totalFromCountAggregate([]), 0);
  });

  it("maps grouped count() rows to actionCounts without parsing ids", () => {
    assert.deepEqual(
      actionCountsFromGroupAggregate([
        { action: "variable.create", count: 3 },
        { action: "variable.delete", count: 1 },
      ]),
      { "variable.create": 3, "variable.delete": 1 },
    );
  });
});
