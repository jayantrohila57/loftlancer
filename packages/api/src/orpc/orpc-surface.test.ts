import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { accountAppRouter } from "../routers/account-app";
import { studioRouter } from "../routers/studio";
import { accountORPCRouter } from "./account-router";
import { studioORPCRouter } from "./studio-router";

describe("oRPC parallel surface (#758)", () => {
  it("wraps studio and account routers without dropping top-level keys", () => {
    assert.deepEqual(
      Object.keys(studioRouter._def.record).sort(),
      Object.keys(studioORPCRouter).sort(),
    );
    assert.deepEqual(
      Object.keys(accountAppRouter._def.record).sort(),
      Object.keys(accountORPCRouter).sort(),
    );
  });

  it("keeps healthCheck callable via tRPC caller (oRPC mirrors same router)", async () => {
    const caller = studioRouter.createCaller({
      session: null,
      ipAddress: null,
      userAgent: null,
    });
    assert.equal(await caller.healthCheck(), "OK");
  });
});
