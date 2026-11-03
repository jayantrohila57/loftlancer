import assert from "node:assert/strict";
import { test } from "node:test";
import { vercelWaitUntil } from "@sentry/core/server";
import {
  coalescedServerLogFlush,
  createCoalescedServerFlush,
} from "../src/utils/sentry.server-flush";

test("@sentry/core/server exports vercelWaitUntil", () => {
  assert.equal(typeof vercelWaitUntil, "function");
});

test("createCoalescedServerFlush batches multiple calls in one microtask", async () => {
  let flushCount = 0;
  let waitUntilCount = 0;
  const schedule = createCoalescedServerFlush(
    async () => {
      flushCount++;
      return true;
    },
    () => {
      waitUntilCount++;
    },
  );
  schedule();
  schedule();
  schedule();
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assert.equal(flushCount, 1);
  assert.equal(waitUntilCount, 1);
});

test("coalescedServerLogFlush wires flush on a Sentry client", async () => {
  let flushCount = 0;
  const sentry = {
    flush: async () => {
      flushCount++;
      return true;
    },
  };
  coalescedServerLogFlush(sentry);
  coalescedServerLogFlush(sentry);
  await new Promise<void>((resolve) => queueMicrotask(resolve));
  assert.equal(flushCount, 1);
});
