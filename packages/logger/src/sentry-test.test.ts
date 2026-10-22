import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { scrubSentryTestToken, scrubSentryTestTokenFromSpan } from "./sentry";
import {
  isSentryTestRequest,
  isSentryTestTokenValid,
  SENTRY_TEST_HEADER,
  SENTRY_TEST_HEADERS,
  sentryTestJson,
  sentryTestNotFound,
  sentryTestToken,
} from "./sentry-test";

const TOKEN = "t".repeat(40);

function request(token?: string): Request {
  return new Request("https://example.test/api/sentry-test", {
    method: "POST",
    headers: token === undefined ? {} : { [SENTRY_TEST_HEADER]: token },
  });
}

describe("sentry test-error guard", () => {
  it("rejects a request without the token header", () => {
    assert.equal(isSentryTestRequest(request(), TOKEN), false);
  });

  it("rejects a wrong token", () => {
    assert.equal(isSentryTestRequest(request("x".repeat(40)), TOKEN), false);
    assert.equal(isSentryTestRequest(request(`${TOKEN}x`), TOKEN), false);
    assert.equal(isSentryTestRequest(request(""), TOKEN), false);
  });

  it("rejects everything when the env var is unset or blank", () => {
    assert.equal(isSentryTestRequest(request(TOKEN), undefined), false);
    assert.equal(isSentryTestRequest(request(""), ""), false);
    assert.equal(isSentryTestRequest(request("   "), "   "), false);
  });

  it("rejects everything when the env var is too short", () => {
    assert.equal(sentryTestToken("short"), null);
    assert.equal(isSentryTestRequest(request("short"), "short"), false);
  });

  it("accepts the configured token", () => {
    assert.equal(isSentryTestRequest(request(TOKEN), TOKEN), true);
    assert.equal(isSentryTestRequest(request(TOKEN), `  ${TOKEN}\n`), true);
  });

  it("compares without throwing on different lengths", () => {
    assert.equal(isSentryTestTokenValid("a", TOKEN), false);
    assert.equal(isSentryTestTokenValid(null, TOKEN), false);
    assert.equal(isSentryTestTokenValid(TOKEN, null), false);
  });
});

describe("sentry test-error responses", () => {
  it("404s are empty and never cached", async () => {
    const res = sentryTestNotFound();
    assert.equal(res.status, 404);
    assert.equal(res.headers.get("cache-control"), "private, no-store");
    assert.equal(await res.text(), "");
  });

  it("JSON responses are never cached", () => {
    const res = sentryTestJson({ ok: true }, 200);
    assert.equal(
      res.headers.get("cache-control"),
      SENTRY_TEST_HEADERS["Cache-Control"],
    );
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
  });
});

describe("scrubSentryTestToken", () => {
  it("drops the token header in any casing", () => {
    const event = {
      request: {
        headers: {
          "X-Sentry-Test-Token": TOKEN,
          [SENTRY_TEST_HEADER]: TOKEN,
          "user-agent": "curl",
        },
      },
    };
    const scrubbed = scrubSentryTestToken(event);
    assert.deepEqual(scrubbed.request.headers, { "user-agent": "curl" });
    assert.equal(JSON.stringify(scrubbed).includes(TOKEN), false);
  });

  it("leaves events without request data alone", () => {
    const event: { message: string; request?: undefined } = {
      message: "x",
    };
    assert.deepEqual(scrubSentryTestToken(event), { message: "x" });
  });
});

describe("scrubSentryTestTokenFromSpan", () => {
  it("removes streamed span attributes containing the test header", () => {
    const span = {
      attributes: {
        "http.request.header.x-sentry-test-token": TOKEN,
        "X-Sentry-Test-Token": TOKEN,
        "http.request.method": "POST",
      },
    };
    const scrubbed = scrubSentryTestTokenFromSpan(span);
    assert.deepEqual(scrubbed.attributes, { "http.request.method": "POST" });
    assert.equal(JSON.stringify(scrubbed).includes(TOKEN), false);
  });
});
