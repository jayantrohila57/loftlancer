import assert from "node:assert/strict";
import { mock, test } from "node:test";

const audit: Record<string, unknown>[] = [];
let deny: string | null = null;
mock.module("@loftlancer/api/actions/require-action", {
  namedExports: {
    isReadAction: (action: string) => /\.(list|get|read)$/.test(action),
    requireAction: async (_action: string, ctx: { audit: boolean }) => {
      assert.equal(ctx.audit, false);
      if (deny) throw Object.assign(new Error("Not allowed"), { code: deny });
    },
  },
});
mock.module("@loftlancer/api/actions/audit-event-writer", {
  namedExports: {
    writeAuditEvent: async (input: Record<string, unknown>) => {
      audit.push(input);
    },
  },
});
mock.module("@loftlancer/logger", {
  namedExports: { logger: { exception: () => {} } },
});
const { runAction } = await import("./run-action");
const ctx = {
  userId: "actor",
  orgId: "org",
  ip: "127.0.0.1",
  userAgent: "test",
  payload: { name: "Platform" },
};
test("mutations audit the terminal outcome once and preserve safe response contracts", async () => {
  audit.length = 0;
  const success = await runAction({
    action: "team.create",
    ctx,
    handler: async () => ({
      kind: "success",
      data: { id: "new-team" },
      message: "Team created",
    }),
  });
  assert.equal(success.status, "success");
  assert.equal(audit.length, 1);
  assert.equal(audit[0]?.result, "success");
  assert.equal(audit[0]?.entityId, "new-team");
  assert.equal(audit[0]?.ipAddress, ctx.ip);
  assert.deepEqual(audit[0]?.payload, ctx.payload);
  audit.length = 0;
  let called = false;
  deny = "FORBIDDEN";
  const denied = await runAction({
    action: "team.create",
    ctx,
    handler: async () => {
      called = true;
      return { kind: "success", data: null };
    },
  });
  assert.equal(denied.status, "failed");
  assert.equal(denied.error?.code, "FORBIDDEN");
  assert.equal(called, false);
  assert.equal(audit.length, 1);
  assert.equal(audit[0]?.result, "denied");
  deny = null;
  audit.length = 0;
  const invalid = await runAction({
    action: "team.create",
    ctx,
    handler: async () => ({
      kind: "failed",
      message: "Name required",
      fieldErrors: { name: ["Required"] },
    }),
  });
  assert.equal(invalid.status, "failed");
  assert.equal(audit[0]?.result, "failure");
  audit.length = 0;
  const fault = await runAction({
    action: "team.create",
    ctx,
    handler: async () => {
      throw new Error("database password secret");
    },
  });
  assert.equal(fault.status, "error");
  assert.equal(audit[0]?.result, "failure");
  assert.ok(!JSON.stringify(fault).includes("secret"));
  audit.length = 0;
  await runAction({
    action: "team.member.list",
    ctx,
    handler: async () => ({ kind: "success", data: [], message: "No members" }),
  });
  assert.equal(audit.length, 0);
});

test("secondary authorization denial never executes a handler and audits only the terminal denial", async () => {
  audit.length = 0;
  let called = false;
  const response = await runAction({
    action: "member.invite",
    ctx,
    authorize: async () => {
      throw Object.assign(new Error("Team access denied"), {
        code: "FORBIDDEN",
      });
    },
    handler: async () => {
      called = true;
      return { kind: "success", data: { id: "unexpected" } };
    },
  });
  assert.equal(response.status, "failed");
  assert.equal(called, false);
  assert.equal(audit.length, 1);
  assert.equal(audit[0]?.result, "denied");
});

test("create audits the returned entity while retaining parent team scope", async () => {
  audit.length = 0;
  const response = await runAction({
    action: "member.invite",
    ctx: { ...ctx, teamId: "parent-team", payload: { teamId: "parent-team" } },
    handler: async () => ({ kind: "success", data: { id: "invitation-id" } }),
  });
  assert.equal(response.status, "success");
  assert.equal(audit.length, 1);
  assert.equal(audit[0]?.entityId, "invitation-id");
  assert.deepEqual(audit[0]?.payload, { teamId: "parent-team" });
});
