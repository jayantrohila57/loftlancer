import { serverEnv } from "@packages/t3-env/server"

/** Browser origins explicitly configured for the auth service and its apps. */
export function getTrustedAuthOrigins(): string[] {
  return [
    ...new Set(
      [
        serverEnv.BETTER_AUTH_URL,
        serverEnv.WEB_APP_URL ??
          (serverEnv.NODE_ENV === "development"
            ? "http://localhost:3001"
            : undefined),
        serverEnv.STUDIO_APP_URL ??
          (serverEnv.NODE_ENV === "development"
            ? "http://localhost:3003"
            : undefined),
        serverEnv.CONSOLE_APP_URL ??
          (serverEnv.NODE_ENV === "development"
            ? "http://localhost:3004"
            : undefined),
      ]
        .filter((url): url is string => Boolean(url))
        .map((url) => new URL(url).origin)
    ),
  ]
}
