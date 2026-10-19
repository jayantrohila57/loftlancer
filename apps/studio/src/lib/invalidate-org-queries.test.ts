import assert from "node:assert/strict";
import { test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { invalidateAfterOrganizationChange } from "./invalidate-org-queries";

test("organization changes remove scoped procedure and custom query caches", async () => {
  const queryClient = new QueryClient();
  const scopedKeys = [
    [["projects", "list"], { type: "query" }],
    [["permissions", "snapshot"], { input: {}, type: "query" }],
    ["team-members-sheet", "org-members", "org-1"],
    ["org-active-member-role", "org-1"],
  ] as const;
  for (const key of scopedKeys) queryClient.setQueryData(key, "scoped");

  const globalKeys = [
    [["support", "tickets"], { type: "query" }],
    ["user-preferences", { organizationName: "Northwind" }],
  ] as const;
  for (const key of globalKeys) queryClient.setQueryData(key, "global");

  await invalidateAfterOrganizationChange(queryClient);

  for (const key of scopedKeys) {
    assert.equal(queryClient.getQueryData(key), undefined);
  }
  for (const key of globalKeys) {
    assert.equal(queryClient.getQueryData(key), "global");
  }

  queryClient.clear();
});
