import assert from "node:assert/strict";
import { test } from "node:test";
import { notificationRenderers } from "./registry";

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
