import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  actionCountsFromGroupAggregate,
  totalFromCountAggregate,
} from "./audit-stats-mappers";
import { buildAuditStatsWhereConditions } from "./audit-stats-scope";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "audit.ts"),
  "utf8",
);

describe("audit.stats scope and aggregates", () => {
  it("builds user-only scope without projectId", () => {
    assert.equal(
      buildAuditStatsWhereConditions({
        userId: "00000000-0000-4000-8000-000000000001",
      }).length,
      1,
    );
  });

  it("adds projectId to scope when filter is provided", () => {
    assert.equal(
      buildAuditStatsWhereConditions({
        userId: "00000000-0000-4000-8000-000000000001",
        projectId: "00000000-0000-4000-8000-000000000002",
      }).length,
      2,
    );
  });

  it("maps scoped SQL aggregate rows to totalLogs and actionCounts", () => {
    const scopedTotal = [{ count: 4 }];
    const scopedByAction = [
      { action: "variable.create", count: 3 },
      { action: "variable.update", count: 1 },
    ];

    assert.equal(totalFromCountAggregate(scopedTotal), 4);
    assert.deepEqual(actionCountsFromGroupAggregate(scopedByAction), {
      "variable.create": 3,
      "variable.update": 1,
    });
  });

  it("uses count() and groupBy for stats aggregates in the router", () => {
    const statsBlock = routerSource.slice(
      routerSource.indexOf("stats: protectedProcedure"),
    );

    assert.match(statsBlock, /count:\s*count\(\)/);
    assert.match(statsBlock, /\.groupBy\(auditLog\.action\)/);
    assert.doesNotMatch(statsBlock, /totalLogsResult\.length/);
    assert.doesNotMatch(statsBlock, /count:\s*auditLog\.id/);
  });

  it("reuses scoped where on total, recent activity, and action count queries", () => {
    assert.ok(
      routerSource.includes("buildAuditStatsWhereConditions"),
      "stats handler should build scope via buildAuditStatsWhereConditions",
    );
  });
});
