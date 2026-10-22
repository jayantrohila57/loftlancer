import assert from "node:assert/strict";
import test from "node:test";
import { organizationBrandingLogoSchema } from "./organization-branding-validation";

test("organization logo accepts nullable HTTPS URLs", () => {
  assert.equal(organizationBrandingLogoSchema.parse(null), null);
  assert.equal(
    organizationBrandingLogoSchema.parse("https://cdn.example.com/logo.png"),
    "https://cdn.example.com/logo.png",
  );
});

test("organization logo rejects insecure, malformed, and oversized URLs", () => {
  assert.equal(
    organizationBrandingLogoSchema.safeParse("http://example.com/logo.png")
      .success,
    false,
  );
  assert.equal(
    organizationBrandingLogoSchema.safeParse("javascript:alert(1)").success,
    false,
  );
  assert.equal(
    organizationBrandingLogoSchema.safeParse(
      `https://example.com/${"a".repeat(2048)}`,
    ).success,
    false,
  );
});
