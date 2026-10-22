import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const service = readFileSync(new URL("./service.ts", import.meta.url), "utf8");
const router = readFileSync(
  new URL("../routers/organizations.ts", import.meta.url),
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

  it("guards the member access endpoint with member.list", () => {
    assert.match(
      router,
      /getMemberAccessSummary:[\s\S]*actionGuard\("member\.list"/,
    );
  });
});
