import assert from "node:assert/strict";
import test from "node:test";
import { parseAnalyticsConsentValue } from "../src/utils/analytics.consent.utils";

test("parseAnalyticsConsentValue accepts granted and denied", () => {
  assert.equal(parseAnalyticsConsentValue("granted"), "granted");
  assert.equal(parseAnalyticsConsentValue("denied"), "denied");
});

test("parseAnalyticsConsentValue treats missing or unknown as unset", () => {
  assert.equal(parseAnalyticsConsentValue(null), "unset");
  assert.equal(parseAnalyticsConsentValue(undefined), "unset");
  assert.equal(parseAnalyticsConsentValue(""), "unset");
  assert.equal(parseAnalyticsConsentValue("maybe"), "unset");
});
