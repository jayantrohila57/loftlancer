import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ActionName } from "@features/authorization/utils";
import { TRPCError } from "@trpc/server";
import { requireUserAction } from "./require-user-action";

describe("requireUserAction", () => {
  it("delegates to requireAction when audit timeline is enabled", async () => {
    let requireCalled = false;
    await requireUserAction("account.export", "user-1", {
      isActionsAuditEnabled: () => true,
      requireAction: async (action, ctx) => {
        requireCalled = true;
        assert.equal(action, "account.export");
        assert.equal(ctx.userId, "user-1");
      },
      isActionBlocked: async () => {
        throw new Error("should not check blocks when audit is on");
      },
    });
    assert.equal(requireCalled, true);
  });

  it("throws when audit is off and the action is blocked", async () => {
    await assert.rejects(
      () =>
        requireUserAction("account.export", "user-1", {
          isActionsAuditEnabled: () => false,
          requireAction: async () => {
            throw new Error("should not call requireAction when audit is off");
          },
          isActionBlocked: async (action, scope) => {
            assert.equal(action, "account.export");
            assert.equal(scope.userId, "user-1");
            return true;
          },
        }),
      (err: unknown) => {
        assert.ok(err instanceof TRPCError);
        assert.equal(err.code, "FORBIDDEN");
        return true;
      },
    );
  });

  it("allows export when audit is off and the action is not blocked", async () => {
    await requireUserAction("account.export", "user-1", {
      isActionsAuditEnabled: () => false,
      requireAction: async () => {
        throw new Error("should not call requireAction when audit is off");
      },
      isActionBlocked: async (_action: ActionName) => false,
    });
  });
});
