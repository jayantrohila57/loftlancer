import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  isE2eTestSecretConfigured,
  isValidE2eSecret,
  resolveE2eRouteAccess,
} from "./e2e-route-access";

const originalSecret = process.env.E2E_TEST_SECRET;
const originalMode = process.env.E2E_TEST_MODE;
const originalVercelEnv = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.E2E_TEST_SECRET;
  } else {
    process.env.E2E_TEST_SECRET = originalSecret;
  }
  if (originalMode === undefined) {
    delete process.env.E2E_TEST_MODE;
  } else {
    process.env.E2E_TEST_MODE = originalMode;
  }
  if (originalVercelEnv === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = originalVercelEnv;
  }
});

describe("resolveE2eRouteAccess", () => {
  it("returns not_found when E2E_TEST_SECRET is unset", () => {
    delete process.env.E2E_TEST_SECRET;
    process.env.E2E_TEST_MODE = "1";
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "any-value" },
    });
    assert.equal(resolveE2eRouteAccess(request), "not_found");
    assert.equal(isE2eTestSecretConfigured(), false);
  });

  it("returns not_found for legacy default header when secret is unset", () => {
    delete process.env.E2E_TEST_SECRET;
    process.env.E2E_TEST_MODE = "1";
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "local-e2e-secret" },
    });
    assert.equal(resolveE2eRouteAccess(request), "not_found");
  });

  it("returns forbidden when the header does not match", () => {
    process.env.E2E_TEST_SECRET = "configured-secret";
    process.env.E2E_TEST_MODE = "1";
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "wrong-secret" },
    });
    assert.equal(resolveE2eRouteAccess(request), "forbidden");
    assert.equal(isValidE2eSecret(request), false);
  });

  it("returns ok when the header matches E2E_TEST_SECRET", () => {
    process.env.E2E_TEST_SECRET = "configured-secret";
    process.env.E2E_TEST_MODE = "1";
    const request = new Request("http://localhost/api/e2e/login", {
      headers: { "x-e2e-secret": "configured-secret" },
    });
    assert.equal(resolveE2eRouteAccess(request), "ok");
    assert.equal(isValidE2eSecret(request), true);
  });
});
