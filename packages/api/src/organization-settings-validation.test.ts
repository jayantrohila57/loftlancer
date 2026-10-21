import assert from "node:assert/strict";
import test from "node:test";
import { organizationSettingsPatchSchema } from "./organization-settings-validation";

const valid = {
  timeZone: "Asia/Kolkata",
  locale: "en-IN",
  dateFormat: "medium",
  timeFormat: "24h",
  weekStart: 1,
  displayCurrency: "INR",
  defaultProjectVisibility: "private",
  notificationDefaults: { email: true, inApp: true, version: 1 },
} as const;

test("organization preference validation accepts supported settings", () => {
  assert.deepEqual(organizationSettingsPatchSchema.parse(valid), valid);
});

test("organization preference validation rejects invalid format and unsafe input", () => {
  assert.equal(
    organizationSettingsPatchSchema.safeParse({
      ...valid,
      timeZone: "Mars/Olympus",
    }).success,
    false,
  );
  assert.equal(
    organizationSettingsPatchSchema.safeParse({ ...valid, locale: "%%%" })
      .success,
    false,
  );
  assert.equal(
    organizationSettingsPatchSchema.safeParse({
      ...valid,
      displayCurrency: "US dollars",
    }).success,
    false,
  );
  assert.equal(
    organizationSettingsPatchSchema.safeParse({
      ...valid,
      defaultProjectVisibility: "unlisted",
    }).success,
    false,
  );
});
