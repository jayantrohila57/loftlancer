import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { setPrivateNoStore } from "./private-response";

describe("setPrivateNoStore", () => {
  it("marks auth responses as private and non-cacheable", () => {
    const headers = new Headers({ "x-pathname": "/settings/profile" });

    setPrivateNoStore(headers);

    assert.equal(headers.get("cache-control"), "private, no-store");
    assert.equal(headers.get("x-pathname"), "/settings/profile");
  });
});
