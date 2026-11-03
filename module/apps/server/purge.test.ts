import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type PurgeCandidate,
  type PurgeDeps,
  purgeExpiredApps,
  selectPurgeable,
} from "./purge";

const now = new Date("2026-11-20T00:00:00Z");
const day = 86_400_000;

function fakeStore(rows: PurgeCandidate[]) {
  const deleted: string[] = [];
  const deps: PurgeDeps = {
    listCandidates: async () => rows.map((r) => ({ ...r })),
    deleteAppData: async (appId, projectId) => {
      deleted.push(`${appId}:${projectId}`);
      return 3;
    },
    markPurged: async (id) => {
      const row = rows.find((r) => r.id === id);
      if (row?.status !== "uninstalled") return false;
      row.status = "purged";
      return true;
    },
  };
  return { deps, deleted, rows };
}

describe("apps purge (#257)", () => {
  it("selects only uninstalled rows past purge_after", () => {
    const rows: PurgeCandidate[] = [
      {
        id: "a",
        appId: "tasks",
        projectId: "p1",
        status: "uninstalled",
        purgeAfter: new Date(now.getTime() - day),
      },
      {
        id: "b",
        appId: "tasks",
        projectId: "p2",
        status: "uninstalled",
        purgeAfter: new Date(now.getTime() + day),
      },
      {
        id: "c",
        appId: "env",
        projectId: "p3",
        status: "active",
        purgeAfter: null,
      },
      {
        id: "d",
        appId: "env",
        projectId: "p4",
        status: "purged",
        purgeAfter: new Date(now.getTime() - 9 * day),
      },
    ];
    assert.deepEqual(
      selectPurgeable(rows, now).map((r) => r.id),
      ["a"],
    );
  });

  it("deletes data once and is idempotent on re-run", async () => {
    const store = fakeStore([
      {
        id: "a",
        appId: "tasks",
        projectId: "p1",
        status: "uninstalled",
        purgeAfter: new Date(now.getTime() - day),
      },
      {
        id: "e",
        appId: "env",
        projectId: "p5",
        status: "uninstalled",
        purgeAfter: now,
      },
    ]);
    const first = await purgeExpiredApps(store.deps, now);
    assert.equal(first.purged.length, 2);
    const second = await purgeExpiredApps(store.deps, now);
    assert.equal(second.purged.length, 0);
    assert.deepEqual(store.deleted, ["tasks:p1", "env:p5"]);
  });

  it("never purges a reinstalled app", async () => {
    const store = fakeStore([
      {
        id: "r",
        appId: "tasks",
        projectId: "p9",
        status: "active",
        purgeAfter: null,
      },
    ]);
    const res = await purgeExpiredApps(store.deps, now);
    assert.equal(res.purged.length, 0);
    assert.equal(store.deleted.length, 0);
  });
});
