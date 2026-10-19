import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countTeamMembershipsByTeam,
  getMemberRemovalBlockReason,
  getOwnerMutationBlockReason,
  isOwnerRole,
  resolveOwnershipTransfer,
} from "./member-removal-policy";

describe("organization member removal policy", () => {
  it("keeps self-removal on the Leave organization path", () => {
    assert.equal(
      getMemberRemovalBlockReason({
        actorUserId: "user-1",
        targetUserId: "user-1",
        targetRole: "owner",
        activeOwnerCount: 2,
      }),
      "self",
    );
  });

  it("blocks removing the last owner and allows another owner to remain", () => {
    const input = {
      actorUserId: "owner-1",
      targetUserId: "owner-2",
      targetRole: "owner",
      activeOwnerCount: 1,
    };
    assert.equal(getMemberRemovalBlockReason(input), "last_owner");
    assert.equal(
      getMemberRemovalBlockReason({ ...input, activeOwnerCount: 2 }),
      null,
    );
  });

  it("counts each team membership so its cached member count can be corrected", () => {
    assert.deepEqual(
      countTeamMembershipsByTeam([
        { id: "tm-1", teamId: "team-a" },
        { id: "tm-2", teamId: "team-a" },
        { id: "tm-3", teamId: "team-b" },
      ]),
      new Map([
        ["team-a", 2],
        ["team-b", 1],
      ]),
    );
  });
});

describe("organization owner mutation policy", () => {
  it("recognizes owner roles in scalar and comma-separated forms", () => {
    assert.equal(isOwnerRole("owner"), true);
    assert.equal(isOwnerRole("manager, owner"), true);
    assert.equal(isOwnerRole("manager"), false);
  });

  it("blocks removing or demoting the final owner", () => {
    assert.equal(
      getOwnerMutationBlockReason({
        targetRole: "owner",
        activeOwnerCount: 1,
        removing: true,
      }),
      "last_owner",
    );
    assert.equal(
      getOwnerMutationBlockReason({
        targetRole: "owner",
        activeOwnerCount: 1,
        nextRole: "manager",
      }),
      "last_owner",
    );
    assert.equal(
      getOwnerMutationBlockReason({
        targetRole: "owner",
        activeOwnerCount: 2,
        nextRole: "manager",
      }),
      null,
    );
    assert.equal(
      getOwnerMutationBlockReason({
        targetRole: "member",
        activeOwnerCount: 1,
        removing: true,
      }),
      null,
    );
  });

  it("resolves an owner and active member to the exact rows a transfer must update", () => {
    assert.deepEqual(
      resolveOwnershipTransfer({
        members: [
          { id: "owner-row", userId: "owner", role: "owner" },
          { id: "member-row", userId: "member", role: "member" },
        ],
        actorUserId: "owner",
        targetUserId: "member",
      }),
      { actorMemberId: "owner-row", targetMemberId: "member-row" },
    );
  });

  it("requires the actor to own the organization and the target to be a different active member", () => {
    const members = [
      { id: "owner-row", userId: "owner", role: "owner" },
      { id: "member-row", userId: "member", role: "member" },
    ];
    assert.throws(
      () =>
        resolveOwnershipTransfer({
          members,
          actorUserId: "member",
          targetUserId: "owner",
        }),
      /Only an organization owner/,
    );
    assert.throws(
      () =>
        resolveOwnershipTransfer({
          members,
          actorUserId: "owner",
          targetUserId: "missing",
        }),
      /active organization member/,
    );
    assert.throws(
      () =>
        resolveOwnershipTransfer({
          members,
          actorUserId: "owner",
          targetUserId: "owner",
        }),
      /Choose another/,
    );
  });
});
