import assert from "node:assert/strict";
import { test } from "node:test";
import {
  localDayKey,
  localDayLabel,
  localDaysAgo,
} from "../src/utils/patterns.local-day.utils";

test("localDaysAgo counts calendar days, not 24h windows", () => {
  const now = new Date(2026, 9, 17, 7, 0); // 17 Oct, 07:00 local
  // 8 hours ago but on the previous calendar day.
  assert.equal(localDaysAgo(new Date(2026, 9, 16, 23, 0), now), 1);
  assert.equal(localDaysAgo(new Date(2026, 9, 17, 0, 5), now), 0);
  assert.equal(localDaysAgo(new Date(2026, 9, 10, 12, 0), now), 7);
});

test("localDayLabel matches localDaysAgo", () => {
  const now = new Date(2026, 9, 17, 7, 0);
  assert.equal(localDayLabel(new Date(2026, 9, 17, 1, 0), now), "Today");
  assert.equal(localDayLabel(new Date(2026, 9, 16, 23, 0), now), "Yesterday");
  assert.match(localDayLabel(new Date(2026, 9, 14, 9, 0), now), /Oct 14/);
  assert.match(localDayLabel(new Date(2025, 9, 14, 9, 0), now), /2025/);
});

test("localDayKey groups by local day", () => {
  const a = new Date(2026, 9, 17, 0, 1);
  const b = new Date(2026, 9, 17, 23, 59);
  const c = new Date(2026, 9, 16, 23, 59);
  assert.equal(localDayKey(a), localDayKey(b));
  assert.notEqual(localDayKey(a), localDayKey(c));
});
