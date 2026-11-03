import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const service = readFileSync(new URL("./service.ts", import.meta.url), "utf8");
const router = readFileSync(
  new URL("../routers/organizations.ts", import.meta.url),
  "utf8",
);
const controller = readFileSync(
  new URL(
    "../../../../module/organizations/server/controller/server.organization-member-admin.controller.ts",
    import.meta.url,
  ),
  "utf8",
);

describe("member access summary security", () => {
  it("scopes the target membership to the active organization", () => {
    assert.match(
      service,
      /eq\(member\.id, input\.memberId\)[\s\S]*eq\(member\.organizationId, input\.organizationId\)/,
    );
  });

  it("returns only projects visible to the requesting member", () => {
    assert.match(service, /canReadProject\(viewerRole/);
    assert.match(service, /visibleProjects\.flatMap/);
  });

  it("routes the member access endpoint through its member.list controller", () => {
    assert.match(
      router,
      /getMemberAccessSummary:[\s\S]*organizationMemberAccessSummaryController/,
    );
    assert.match(controller, /action: "member\.list"/);
  });
});
