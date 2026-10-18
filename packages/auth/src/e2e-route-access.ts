import { timingSafeEqual } from "node:crypto";

/**
 * True only for local / CI E2E (`E2E_TEST_MODE=1`).
 * Allowed for `next start` locally; blocked on Vercel production.
 */
export function isE2eAuthRouteAllowed(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  return process.env.E2E_TEST_MODE === "1";
}

/** True when `E2E_TEST_SECRET` is set (required for E2E HTTP routes). */
export function isE2eTestSecretConfigured(): boolean {
  return Boolean(process.env.E2E_TEST_SECRET);
}

function timingSafeStringEqual(expected: string, provided: string): boolean {
  const expectedBuf = Buffer.from(expected, "utf8");
  const providedBuf = Buffer.from(provided, "utf8");
  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return timingSafeEqual(expectedBuf, providedBuf);
}

/** True when the request includes the configured `E2E_TEST_SECRET`. */
export function isValidE2eSecret(request: Request): boolean {
  const expected = process.env.E2E_TEST_SECRET;
  if (!expected) {
    return false;
  }
  const provided = request.headers.get("x-e2e-secret");
  if (provided === null) {
    return false;
  }
  return timingSafeStringEqual(expected, provided);
}

export type E2eRouteAccess = "ok" | "not_found" | "forbidden";

/**
 * Gate for `/api/e2e/*` routes: 404 when disabled or secret unset; 403 on bad secret.
 */
export function resolveE2eRouteAccess(request: Request): E2eRouteAccess {
  if (!isE2eAuthRouteAllowed() || !isE2eTestSecretConfigured()) {
    return "not_found";
  }
  if (!isValidE2eSecret(request)) {
    return "forbidden";
  }
  return "ok";
}
