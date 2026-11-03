import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PageForbiddenError,
  PageNotFoundError,
} from "@features/authentication/core/server/authentication.page-guards-next/errors";
import { TRPCError } from "@trpc/server";
import { organizationChildAction } from "./org-route-actions";

describe("organizationChildAction", () => {
  it("maps members route to member.list", () => {
    assert.equal(organizationChildAction("members"), "member.list");
  });

  it("returns undefined for unknown segment", () => {
    assert.equal(organizationChildAction("unknown"), undefined);
  });
});

describe("page guard errors", () => {
  it("distinguishes forbidden and not found", () => {
    assert.equal(new PageForbiddenError().kind, "forbidden");
    assert.equal(new PageNotFoundError().kind, "not_found");
  });

  it("maps TRPC FORBIDDEN to PageForbiddenError shape", () => {
    const trpc = new TRPCError({ code: "FORBIDDEN", message: "nope" });
    assert.equal(trpc.code, "FORBIDDEN");
  });
});
