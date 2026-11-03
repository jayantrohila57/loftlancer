import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatDate,
  formatDateTime,
} from "../src/utils/patterns.format-date.utils";

test("formatDate uses en-US short month style", () => {
  assert.equal(formatDate("2026-10-13T12:00:00.000Z"), "Oct 13, 2026");
  assert.equal(formatDate("2026-02-04T12:00:00.000Z"), "Feb 4, 2026");
});

test("formatDate rejects invalid values", () => {
  assert.equal(formatDate("not-a-date"), "—");
});

test("formatDateTime includes time with the same date style", () => {
  const formatted = formatDateTime("2026-10-13T15:30:00.000Z");
  assert.ok(formatted.includes("Oct 13, 2026"));
  assert.match(formatted, /\d{1,2}:\d{2}/);
});
