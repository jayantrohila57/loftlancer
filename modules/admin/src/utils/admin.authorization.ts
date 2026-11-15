import { ORPCError } from "@packages/orpc/server"

import { isPlatformAdminEmail } from "./admin.platform-admins"

export function userHasAdminRole(role: string | null | undefined): boolean {
  return (role ?? "user").split(",").some((value) => value.trim() === "admin")
}

export function normalizeUserRole(role: string | null | undefined): string {
  const roles = (role ?? "user")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  if (!roles.includes("user")) roles.push("user")
  return [...new Set(roles)].join(",")
}

export function resolvePlatformAdminRole(input: {
  email: string
  emailVerified: boolean
  role?: string | null
}): string {
  const roles = normalizeUserRole(input.role).split(",")
  const shouldBeAdmin = input.emailVerified && isPlatformAdminEmail(input.email)
  const hasAdmin = roles.includes("admin")
  if (shouldBeAdmin && !hasAdmin)
    return normalizeUserRole([...roles, "admin"].join(","))
  if (!shouldBeAdmin && hasAdmin)
    return normalizeUserRole(roles.filter((role) => role !== "admin").join(","))
  return normalizeUserRole(input.role)
}

export function assertPlatformAdministrator(input: {
  user: {
    email: string
    emailVerified: boolean
    role?: string | null
  }
}): void {
  if (!input.user.emailVerified || !isPlatformAdminEmail(input.user.email))
    throw new ORPCError("FORBIDDEN", { message: "Access denied." })
  if (!userHasAdminRole(input.user.role))
    throw new ORPCError("FORBIDDEN", { message: "Access denied." })
}
