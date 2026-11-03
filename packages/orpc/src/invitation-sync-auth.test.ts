import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TRPCError } from "@trpc/server";
import {
  assertSyncInvitationAcceptedAllowed,
  assertSyncInvitationReceivedAllowed,
  type InvitationSyncAuthDeps,
} from "./invitation-sync-auth-checks";
import {
  normalizeInviteEmail,
  organizationIdFromInviteSyncInput,
} from "./invitation-sync-input";

describe("organizationIdFromInviteSyncInput", () => {
  it("returns organizationId from sync mutation input", () => {
    assert.deepEqual(
      organizationIdFromInviteSyncInput({
        organizationId: "org_1",
        email: "a@example.com",
      }),
      { organizationId: "org_1" },
    );
  });

  it("returns empty object for invalid input", () => {
    assert.deepEqual(organizationIdFromInviteSyncInput(null), {});
    assert.deepEqual(organizationIdFromInviteSyncInput({ email: "a@b.c" }), {});
  });
});

describe("normalizeInviteEmail", () => {
  it("trims and lowercases email", () => {
    assert.equal(
      normalizeInviteEmail("  User@Example.COM  "),
      "user@example.com",
    );
  });
});

function stubDeps(
  overrides: Partial<InvitationSyncAuthDeps> = {},
): InvitationSyncAuthDeps {
  return {
    getUserEmailNormalized: async () => null,
    findPendingInviteAsInviter: async () => undefined,
    findAcceptedInviteForEmail: async () => undefined,
    ...overrides,
  };
}

async function expectForbidden(run: () => Promise<void>): Promise<void> {
  await assert.rejects(run, (err: unknown) => {
    assert.ok(err instanceof TRPCError);
    assert.equal(err.code, "FORBIDDEN");
    return true;
  });
}

describe("assertSyncInvitationReceivedAllowed", () => {
  it("allows when the caller is the inviter on a pending invite", async () => {
    await assertSyncInvitationReceivedAllowed(
      "user_inviter",
      "org_1",
      "invitee@example.com",
      stubDeps({
        findPendingInviteAsInviter: async (args) => {
          assert.equal(args.organizationId, "org_1");
          assert.equal(args.inviterId, "user_inviter");
          assert.equal(args.emailNormalized, "invitee@example.com");
          return { id: "inv_1" };
        },
      }),
    );
  });

  it("rejects when no matching pending invite exists", async () => {
    await expectForbidden(() =>
      assertSyncInvitationReceivedAllowed(
        "user_other",
        "org_1",
        "invitee@example.com",
        stubDeps(),
      ),
    );
  });
});

describe("assertSyncInvitationAcceptedAllowed", () => {
  it("allows when session email matches and an accepted invite exists", async () => {
    await assertSyncInvitationAcceptedAllowed(
      "user_accept",
      "org_1",
      "User@Example.com",
      stubDeps({
        getUserEmailNormalized: async () => "user@example.com",
        findAcceptedInviteForEmail: async (args) => {
          assert.equal(args.organizationId, "org_1");
          assert.equal(args.emailNormalized, "user@example.com");
          return { id: "inv_2" };
        },
      }),
    );
  });

  it("rejects when input email does not match the session user", async () => {
    await expectForbidden(() =>
      assertSyncInvitationAcceptedAllowed(
        "user_accept",
        "org_1",
        "other@example.com",
        stubDeps({
          getUserEmailNormalized: async () => "user@example.com",
        }),
      ),
    );
  });

  it("rejects when session email matches but no accepted invite exists", async () => {
    await expectForbidden(() =>
      assertSyncInvitationAcceptedAllowed(
        "user_accept",
        "org_1",
        "user@example.com",
        stubDeps({
          getUserEmailNormalized: async () => "user@example.com",
        }),
      ),
    );
  });
});
