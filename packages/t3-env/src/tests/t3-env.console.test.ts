import assert from "node:assert/strict";
import { test } from "node:test";

import {
  isEmailAllowedForConsole,
  parseConsoleAllowedEmails,
} from "../config/t3-env.console";

test("parseConsoleAllowedEmails normalizes list", () => {
  assert.deepEqual(parseConsoleAllowedEmails("A@x.com, b@x.com ,"), [
    "a@x.com",
    "b@x.com",
  ]);
  assert.deepEqual(parseConsoleAllowedEmails("a@x.com\nb@x.com"), [
    "a@x.com",
    "b@x.com",
  ]);
  assert.deepEqual(parseConsoleAllowedEmails('"jrohila55@gmail.com"'), [
    "jrohila55@gmail.com",
  ]);
});

test("isEmailAllowedForConsole matches quoted allowlist entries", () => {
  assert.equal(
    isEmailAllowedForConsole("jrohila55@gmail.com", {
      nodeEnv: "production",
      allowedEmails: ['"jrohila55@gmail.com"'],
    }),
    true,
  );
});

test("isEmailAllowedForConsole enforces list in production", () => {
  assert.equal(
    isEmailAllowedForConsole("jrohila55@gmail.com", {
      nodeEnv: "production",
      allowedEmails: ["jrohila55@gmail.com"],
    }),
    true,
  );
  assert.equal(
    isEmailAllowedForConsole("other@x.com", {
      nodeEnv: "production",
      allowedEmails: ["jrohila55@gmail.com"],
    }),
    false,
  );
});

test("isEmailAllowedForConsole allows any email in dev when list empty", () => {
  assert.equal(
    isEmailAllowedForConsole("any@x.com", {
      nodeEnv: "development",
      allowedEmails: [],
    }),
    true,
  );
});
