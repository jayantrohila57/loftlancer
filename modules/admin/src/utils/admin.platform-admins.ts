import { serverEnv } from "@packages/t3-env/server"

export function parsePlatformAdminEmails(): ReadonlySet<string> {
  return new Set(
    (serverEnv.CONSOLE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export function isPlatformAdminEmail(email: string): boolean {
  const allowed = parsePlatformAdminEmails()
  if (allowed.size === 0) return false
  return allowed.has(email.trim().toLowerCase())
}
