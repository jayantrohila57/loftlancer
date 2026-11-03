import assert from "node:assert/strict";
import { mock, test } from "node:test";

let calls = 0;
const audit: Record<string, unknown>[] = [];
mock.module(
  "@features/authorization/core/server/authorization.require-action",
  {
    namedExports: { requireAction: async () => {}, isReadAction: () => false },
  },
);
mock.module(
  "@features/authorization/core/server/authorization.audit-event-writer",
  {
    namedExports: {
      writeAuditEvent: async (input: Record<string, unknown>) => {
        audit.push(input);
      },
    },
  },
);
mock.module("@loftlancer/sentry", {
  namedExports: { logger: { exception: () => {} } },
});
mock.module("../service/server.team-create.service.ts", {
  namedExports: {
    teamCreateService: async (_ctx: unknown, input: { name: string }) => {
      calls++;
      return {
        kind: "success",
        data: {
          id: "team",
          name: input.name,
          description: null,
          purpose: null,
          organizationId: "org",
          createdAt: new Date(0).toISOString(),
          createdByName: null,
          updatedAt: null,
          updatedByName: null,
        },
        message: "Team created",
      };
    },
  },
});
const { teamCreateController } = await import(
  "./server.team-create.controller"
);
test("create validates inside the audited controller, and normalizes valid input", async () => {
  const ctx = { userId: "actor", orgId: "org" };
  const invalid = await teamCreateController({ input: { name: "  " }, ctx });
  assert.equal(invalid.status, "failed");
  assert.equal(calls, 0);
  assert.equal(audit[0]?.result, "failure");
  const valid = await teamCreateController({
    input: { name: "  Platform  " },
    ctx,
  });
  assert.equal(valid.status, "success");
  assert.ok(valid.data && !Array.isArray(valid.data));
  assert.equal(valid.data.name, "Platform");
  assert.equal(calls, 1);
  assert.equal(audit[1]?.result, "success");
});
