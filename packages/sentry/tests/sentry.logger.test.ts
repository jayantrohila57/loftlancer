import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  configureLogger,
  type LogAttributes,
  type LogLevel,
  logger,
  type RequestIdentity,
  resetLoggerForTests,
  setRequestIdentity,
} from "../src/index";

afterEach(() => resetLoggerForTests());

function capture() {
  const logs: { level: LogLevel; message: string; attrs: LogAttributes }[] = [];
  const exceptions: unknown[] = [];
  const identities: RequestIdentity[] = [];
  configureLogger({
    sink: {
      log: (level, message, attrs) => logs.push({ level, message, attrs }),
      captureException: (error) => exceptions.push(error),
      setIdentity: (identity) => identities.push(identity),
    },
    context: { app: "test" },
  });
  return { logs, exceptions, identities };
}

test("error logs name and message with app context, drops undefined", (t) => {
  t.mock.method(console, "error", () => {});
  const { logs, exceptions } = capture();
  logger.error("boom", new TypeError("bad"), { path: "x", skip: undefined });
  assert.equal(logs.length, 1);
  assert.deepEqual(logs[0], {
    level: "error",
    message: "boom",
    attrs: {
      app: "test",
      "error.name": "TypeError",
      "error.message": "bad",
      path: "x",
    },
  });
  assert.equal(exceptions.length, 0);
});

test("exception also reports to the sink", (t) => {
  t.mock.method(console, "error", () => {});
  const { exceptions } = capture();
  const err = new Error("x");
  logger.exception("failed", err);
  assert.deepEqual(exceptions, [err]);
});

test("console line is one JSON object", (t) => {
  const calls: string[] = [];
  t.mock.method(console, "warn", (line: string) => calls.push(line));
  logger.warn("careful", { n: 1 });
  assert.deepEqual(JSON.parse(calls[0] ?? "{}"), {
    level: "warn",
    msg: "careful",
    n: 1,
  });
});

test("a throwing sink never throws to the caller", (t) => {
  t.mock.method(console, "info", () => {});
  configureLogger({
    sink: {
      log: () => {
        throw new Error("sink down");
      },
    },
  });
  assert.doesNotThrow(() => logger.info("hi"));
});

test("setRequestIdentity forwards ids", () => {
  const { identities } = capture();
  setRequestIdentity({ userId: "u1", orgId: "o1" });
  assert.deepEqual(identities, [{ userId: "u1", orgId: "o1" }]);
});
