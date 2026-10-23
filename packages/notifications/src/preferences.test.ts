import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  defaultNotificationPreferences,
  notificationPreferenceGroup,
  notificationPreferencesSchema,
} from "./preferences";

describe("notification preferences", () => {
  it("uses established defaults and validates each delivery channel", () => {
    assert.equal(
      notificationPreferencesSchema.safeParse(defaultNotificationPreferences)
        .success,
      true,
    );
    assert.equal(defaultNotificationPreferences.invitations.email, true);
    assert.equal(defaultNotificationPreferences.projectActivity.email, false);
  });

  it("maps every event to its user-facing preference group", () => {
    assert.equal(
      notificationPreferenceGroup("invitation.received"),
      "invitations",
    );
    assert.equal(
      notificationPreferenceGroup("invitation.accepted"),
      "membership",
    );
    assert.equal(
      notificationPreferenceGroup("task.assigned"),
      "projectActivity",
    );
    assert.equal(
      notificationPreferenceGroup("task.mentioned"),
      "projectActivity",
    );
    assert.equal(
      notificationPreferenceGroup("support.ticket.reply"),
      "support",
    );
  });
});
