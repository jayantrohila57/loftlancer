import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PORT ?? 3000);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

/** PWA screenshot capture — starts studio with E2E login for real dashboard UI. */
export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL,
    trace: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command:
          process.env.E2E_USE_PROD_SERVER === "1"
            ? `pnpm build && pnpm start --port ${port}`
            : `pnpm next dev --port ${port}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          ...process.env,
          SKIP_ENV_VALIDATION: "1",
          E2E_TEST_MODE: process.env.E2E_TEST_MODE ?? "1",
          E2E_TEST_SECRET: process.env.E2E_TEST_SECRET ?? "local-e2e-secret",
          ORGANIZATIONS_ENABLED: process.env.ORGANIZATIONS_ENABLED ?? "true",
          NEXT_PUBLIC_ORGANIZATIONS_ENABLED:
            process.env.NEXT_PUBLIC_ORGANIZATIONS_ENABLED ?? "true",
          NOTIFICATIONS_ENABLED: process.env.NOTIFICATIONS_ENABLED ?? "true",
          NEXT_PUBLIC_NOTIFICATIONS_ENABLED:
            process.env.NEXT_PUBLIC_NOTIFICATIONS_ENABLED ?? "true",
          BETTER_AUTH_SECRET:
            process.env.BETTER_AUTH_SECRET ??
            "playwright-local-auth-secret-32chars",
          ENCRYPTION_KEY:
            process.env.ENCRYPTION_KEY ??
            "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          BETTER_AUTH_URL:
            process.env.BETTER_AUTH_URL ?? `http://127.0.0.1:${port}`,
          NEXT_PUBLIC_STUDIO_URL:
            process.env.NEXT_PUBLIC_STUDIO_URL ?? `http://127.0.0.1:${port}`,
        },
      },
});
