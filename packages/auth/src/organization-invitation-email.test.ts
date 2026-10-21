import assert from "node:assert/strict";
import { test } from "node:test";

import { type RecordedEmail, setEmailRecorder } from "@loftlancer/email";

import { sendOrganizationInvitationEmail } from "./organization-invitation-email";

test("organization invitations use the verified sender and fail when email is unconfigured", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.EMAIL_FROM;
  const recorded: RecordedEmail[] = [];
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  setEmailRecorder((email) => {
    recorded.push(email);
  });

  try {
    await assert.rejects(
      sendOrganizationInvitationEmail({
        invitationId: "invite-id",
        email: "member@example.com",
        role: "member",
        organizationName: "Example",
        inviterName: "Owner",
      }),
      /email is not configured/,
    );
    assert.equal(recorded[0]?.from, "Loftlancer <noreply@mail.loftlancer.com>");
  } finally {
    setEmailRecorder(null);
    if (originalApiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalApiKey;
    if (originalFrom === undefined) delete process.env.EMAIL_FROM;
    else process.env.EMAIL_FROM = originalFrom;
  }
});
