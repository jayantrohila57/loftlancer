/** Playwright and screenshot scripts must pass `E2E_TEST_SECRET` explicitly (no default). */
export function requireE2eTestSecret(): string {
  const secret = process.env.E2E_TEST_SECRET;
  if (!secret) {
    throw new Error(
      "E2E_TEST_SECRET must be set for Playwright E2E (export it in your shell or .env).",
    );
  }
  return secret;
}
