import { readFileSync } from "node:fs"
import { join } from "node:path"

/** Root `package.json` version — matches `NEXT_PUBLIC_APP_VERSION` in apps. */
export function readMonorepoAppVersion(appCwd: string): string {
  const raw = readFileSync(join(appCwd, "../../package.json"), "utf8")
  return (JSON.parse(raw) as { version: string }).version
}

/**
 * Sentry source-map upload. Uploads only when `SENTRY_AUTH_TOKEN` is set;
 * upload failure must not fail the build (use `errorHandler` in the caller).
 */
export function createSentryBuildOptions(appVersion: string) {
  const authToken = process.env.SENTRY_AUTH_TOKEN
  return {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken,
    silent: !process.env.CI,
    telemetry: false,
    release: { name: `loftlancer-template@${appVersion}` },
    buildTimeInstrumentation: false,
    sourcemaps: { disable: !authToken },
    errorHandler: (err: Error) => {
      console.warn(`[sentry] source-map upload skipped: ${err.message}`)
    },
  }
}
