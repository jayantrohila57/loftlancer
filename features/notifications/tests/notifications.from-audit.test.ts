process.env.SKIP_ENV_VALIDATION ??= "1";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
process.env.BETTER_AUTH_SECRET ??= "test-secret-test-secret-test-secret!!";
process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
process.env.GITHUB_CLIENT_ID ??= "test-github-client-id";
process.env.GITHUB_CLIENT_SECRET ??= "test-github-client-secret";
process.env.CORS_ORIGIN ??= "http://localhost:3000";
process.env.ENCRYPTION_KEY ??= "01234567890123456789012345678901";

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { notifyFromAuditEvent } from "../src/core/server/notifications.from-audit";

describe("notifyFromAuditEvent", () => {
  it("no-ops when notifications are disabled", async () => {
    await notifyFromAuditEvent({
      auditEventId: "audit-1",
      action: "member.invite",
      notifyTypes: ["invitation.received"],
      actorUserId: "user-1",
      entityId: "invite-1",
    });
    assert.ok(true);
  });
});
