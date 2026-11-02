import assert from "node:assert/strict";
import { test } from "node:test";
import { mailboxDelivery, normalizeMailboxEmail } from "./recorder";

test("normalizes mailbox recipient addresses", () => {
  assert.equal(
    normalizeMailboxEmail("  Member@Example.COM "),
    "member@example.com",
  );
});

test("maps sender outcomes to persisted delivery state", () => {
  assert.deepEqual(mailboxDelivery({ status: "sent", id: "provider-id" }), {
    status: "sent",
    providerMessageId: "provider-id",
    error: null,
  });
  assert.deepEqual(
    mailboxDelivery({ status: "skipped", reason: "not-configured" }),
    { status: "skipped", providerMessageId: null, error: null },
  );
  assert.deepEqual(mailboxDelivery({ status: "failed", error: "rejected" }), {
    status: "failed",
    providerMessageId: null,
    error: "rejected",
  });
});
