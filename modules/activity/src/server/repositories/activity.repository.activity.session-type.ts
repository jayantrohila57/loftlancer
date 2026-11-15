export function sessionDeleteActivityType(path: string) {
  if (path === "/sign-out") return "sign_out" as const
  if (path.includes("revoke")) return "session_revoked" as const
  return "session_ended" as const
}
