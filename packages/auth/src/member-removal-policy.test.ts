import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countTeamMembershipsByTeam,
  getMemberRemovalBlockReason,
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
