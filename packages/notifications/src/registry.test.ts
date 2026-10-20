import assert from "node:assert/strict";
import { test } from "node:test";
import { notificationRenderers } from "./registry";
import { resolveNotificationPresentation } from "./render-list-item";

test("received invitation notifications open the matching invitation", () => {
  const rendered = notificationRenderers["invitation.received"](
    {
      organizationId: "org-1",
      organizationName: "Example Org",
      invitationId: "invite/with spaces",
      inviterName: "Alex",
    },
    {},
  );

  assert.equal(rendered.href, "/invite/invite%2Fwith%20spaces");
});

test("accepted invitations open the organization's member directory", () => {
  const rendered = notificationRenderers["invitation.accepted"](
    {
      organizationId: "org-1",
      organizationName: "Example Org",
      invitationId: "invite-1",
      memberName: "Jordan",
      memberUserId: "user-1",
    },
    { organizationSlug: "example-org" },
  );

  assert.equal(rendered.href, "/example-org/members");
});

test("legacy task notifications use their organization relation for the task link", () => {
  const rendered = notificationRenderers["task.assigned"](
    {
      projectSlug: "design team",
      projectName: "Design",
      taskId: "task-1",
      taskNumber: 42,
      title: "Review",
    },
    { organizationSlug: "example-org" },
  );

  assert.equal(rendered.href, "/example-org/design%20team/tasks/42");
});

test("task notifications without a live organization do not link to their own inbox", () => {
  const rendered = notificationRenderers["task.mentioned"](
    {
      projectSlug: "design",
      projectName: "Design",
      taskId: "task-1",
      taskNumber: 42,
      title: "Review",
    },
    {},
  );

  assert.equal(rendered.href, null);
});

test("unknown or malformed notifications have no misleading self-link", () => {
  assert.equal(
    resolveNotificationPresentation("unknown.type", {}, { title: "Update" })
      .href,
    null,
  );
  assert.equal(
    resolveNotificationPresentation(
      "task.assigned",
      { projectSlug: 7 },
      { title: "Update" },
    ).href,
    null,
  );
});
