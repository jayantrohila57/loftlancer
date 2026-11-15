export type AuthUnauthorizedReasonKind = "console_access_denied" | "unknown"

export function classifyAuthUnauthorizedReason(
  reason: string | null | undefined
): AuthUnauthorizedReasonKind {
  if (!reason?.trim()) return "unknown"
  const code = reason.trim().toLowerCase()
  if (code === "console_access_denied") return "console_access_denied"
  return "unknown"
}

export const authUnauthorizedCopyKey = {
  console_access_denied: {
    title: "unauthorizedConsoleTitle",
    description: "unauthorizedConsoleDescription",
  },
  unknown: {
    title: "unauthorizedTitle",
    description: "unauthorizedDescription",
  },
} as const satisfies Record<
  AuthUnauthorizedReasonKind,
  { title: string; description: string }
>
