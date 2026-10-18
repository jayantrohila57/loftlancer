#!/usr/bin/env node
/**
 * Regenerate PWA manifest screenshots via Playwright.
 *
 *   CAPTURE_PWA_SCREENSHOTS=1 pnpm capture:pwa-screenshots
 *
 * Requires a running `next start` (or set PLAYWRIGHT_BASE_URL) with E2E_TEST_MODE=1
 * and DATABASE_URL for studio dashboard capture.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (!process.env.E2E_TEST_SECRET) {
  console.error(
    "E2E_TEST_SECRET must be set before running capture:pwa-screenshots.",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  CAPTURE_PWA_SCREENSHOTS: "1",
  E2E_TEST_MODE: process.env.E2E_TEST_MODE ?? "1",
};

function run(cwd: string, args: string[]) {
  const result = spawnSync("pnpm", ["exec", "playwright", "test", ...args], {
    cwd,
    env,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run(path.join(root, "apps/studio"), [
  "e2e/pwa-screenshots.spec.ts",
  "--config=playwright.capture.config.ts",
  "--project=chromium",
]);
