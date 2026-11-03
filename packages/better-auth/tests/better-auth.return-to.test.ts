import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateReturnTo } from "../src/utils/better-auth.return-to";

describe("validateReturnTo", () => {
  it("accepts allowlisted https URLs", () => {
    const result = validateReturnTo("https://loftlancer.com/studio/acme", {
      allowedOrigins: ["https://loftlancer.com"],
      fallback: "https://loftlancer.com/studio/acme",
    });
    assert.equal(result, "https://loftlancer.com/studio/acme");
  });

  it("accepts localhost http in development-style URLs when allowlisted", () => {
    const result = validateReturnTo("http://localhost:3000/acme", {
      allowedOrigins: ["http://localhost:3000"],
      fallback: "https://loftlancer.com/studio/acme",
    });
    assert.equal(result, "http://localhost:3000/acme");
  });

  it("rejects javascript: URLs", () => {
    const result = validateReturnTo("javascript:alert(1)", {
      allowedOrigins: ["https://loftlancer.com"],
      fallback: "https://loftlancer.com/studio/acme",
    });
    assert.equal(result, "https://loftlancer.com/studio/acme");
  });

  it("rejects vbscript: URLs", () => {
    const result = validateReturnTo("vbscript:MsgBox(1)", {
      allowedOrigins: ["https://loftlancer.com"],
      fallback: "https://loftlancer.com/studio/acme",
    });
    assert.equal(result, "https://loftlancer.com/studio/acme");
  });
});
