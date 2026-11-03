import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const routerSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "notifications.ts"),
  "utf8",
);

function procedureBlock(name: string, nextName: string): string {
  const match = routerSource.match(
    new RegExp(`${name}:\\s*protectedProcedure[\\s\\S]*?${nextName}:`),
  )?.[0];
  assert.ok(match, `expected ${name} procedure in notifications router`);
  return match;
}

function lastProcedureBlock(name: string): string {
  const match = routerSource.match(
    new RegExp(`${name}:\\s*protectedProcedure[\\s\\S]*?\\n    \\}\\),`),
  )?.[0];
  assert.ok(match, `expected ${name} procedure in notifications router`);
  return match;
}

describe("notifications router action guards", () => {
  it("guards markUnread with notification.mark_unread", () => {
    const block = procedureBlock("markUnread", "markAllRead");
    assert.match(block, /actionGuard\("notification\.mark_unread"\)/);
  });

  it("guards markRead and markAllRead with notification.mark_read", () => {
    const markRead = procedureBlock("markRead", "markUnread");
    assert.match(markRead, /actionGuard\("notification\.mark_read"\)/);

    const markAllRead = procedureBlock("markAllRead", "syncInvitationReceived");
    assert.match(markAllRead, /actionGuard\(\s*"notification\.mark_read"/);
  });

  it("guards syncInvitationReceived with member.invite and invitation row check", () => {
    const block = procedureBlock(
      "syncInvitationReceived",
      "syncInvitationAccepted",
    );
    assert.match(
      block,
      /actionGuard\("member\.invite", organizationIdFromInviteSyncInput\)/,
    );
    assert.match(block, /assertSyncInvitationReceivedAllowed/);
  });

  it("guards syncInvitationAccepted with invitation.accept and email ownership check", () => {
    const block = lastProcedureBlock("syncInvitationAccepted");
    assert.match(
      block,
      /actionGuard\("invitation\.accept", organizationIdFromInviteSyncInput\)/,
    );
    assert.match(block, /assertSyncInvitationAcceptedAllowed/);
  });
});
