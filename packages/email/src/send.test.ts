import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import {
  isEmailConfigured,
  type RecordedEmail,
  sendEmail,
  setEmailRecorder,
} from "./send";

test("sendEmail is a no-op without RESEND_API_KEY", async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal(isEmailConfigured(), false);
  const result = await sendEmail({
    to: "a@example.com",
    subject: "x",
    react: createElement("p", null, "hi"),
  });
  assert.deepEqual(result, { status: "skipped", reason: "not-configured" });
});

test("every send passes through the recorder", async () => {
  delete process.env.RESEND_API_KEY;
  const seen: RecordedEmail[] = [];
  setEmailRecorder((e) => {
    seen.push(e);
  });
  await sendEmail({
    to: "b@example.com",
    subject: "Hello",
    react: createElement("p", null, "body"),
  });
  setEmailRecorder(null);
  assert.equal(seen.length, 1);
  assert.deepEqual(seen[0]?.to, ["b@example.com"]);
  assert.match(seen[0]?.html ?? "", /body/);
  assert.equal(seen[0]?.result.status, "skipped");
});

test("email context reaches the recorder", async () => {
  delete process.env.RESEND_API_KEY;
  const seen: RecordedEmail[] = [];
  setEmailRecorder((email) => {
    seen.push(email);
  });
  try {
    await sendEmail({
      to: "member@example.com",
      subject: "Project update",
      react: createElement("p", null, "body"),
      context: {
        category: "work",
        organizationId: "org-id",
        entity: { type: "task", id: "task-id" },
        templateKey: "notification",
      },
    });
    assert.deepEqual(seen[0]?.context, {
      category: "work",
      organizationId: "org-id",
      entity: { type: "task", id: "task-id" },
      templateKey: "notification",
    });
  } finally {
    setEmailRecorder(null);
  }
});
