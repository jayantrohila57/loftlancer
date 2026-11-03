/**
 * Guards fake E2E demo variable seeding so it never runs on Vercel production
 * or against a production NODE_ENV database without explicit opt-in.
 */
export const SEED_E2E_DEMO_VARIABLES_ENV = "SEED_E2E_DEMO_VARIABLES";

/**
 * True when fake demo variables may be inserted (local dev, CI E2E, or explicit opt-in).
 */
export function isE2eDemoVariableSeedEnvironmentAllowed(): boolean {
  if (process.env.VERCEL_ENV === "production") {
    return false;
  }
  if (process.env.E2E_TEST_MODE === "1") {
    return true;
  }
  if (process.env[SEED_E2E_DEMO_VARIABLES_ENV] === "yes") {
    return true;
  }
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export function assertE2eDemoVariableSeedAllowed(): void {
  if (isE2eDemoVariableSeedEnvironmentAllowed()) {
    return;
  }
  if (process.env.VERCEL_ENV === "production") {
    throw new Error(
      "Refusing to seed fake E2E demo variables: VERCEL_ENV=production.",
    );
  }
  throw new Error(
    `Refusing to seed fake E2E demo variables when NODE_ENV=production. Set E2E_TEST_MODE=1 for Playwright, or ${SEED_E2E_DEMO_VARIABLES_ENV}=yes only against local/CI databases.`,
  );
}
