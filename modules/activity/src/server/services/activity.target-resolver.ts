import { isPlatformAdminEmail, userHasAdminRole } from "@modules/admin/utils"
import { serverEnv } from "@packages/t3-env/server"
import {
  activityConsoleTargetSegments,
  activityResourceListPath,
  activityTargetPaths,
} from "../../utils/config/activity.actions"

export type ActivityTargetViewer = Readonly<{
  email: string
  emailVerified: boolean
  role?: string | null
  activeOrganizationId?: string | null
  isOrgOwner?: boolean
}>

export type ResolvedActivityTarget = Readonly<{ path: string }>

const consoleDefaultLang = "en-us"

function viewerCanAccessConsole(
  viewer: ActivityTargetViewer | undefined
): boolean {
  if (!viewer) return false
  return (
    viewer.emailVerified &&
    isPlatformAdminEmail(viewer.email) &&
    userHasAdminRole(viewer.role)
  )
}

function resolveConsoleTarget(routeKey: string): string | null {
  const segment = activityConsoleTargetSegments[routeKey]
  if (!segment) return null
  const development = serverEnv.NODE_ENV !== "production"
  const consoleRoot = new URL(
    serverEnv.CONSOLE_APP_URL ??
      (development ? "http://localhost:3004" : "/console"),
    serverEnv.BETTER_AUTH_URL
  )
  const basePath = consoleRoot.pathname.replace(/\/$/, "")
  return new URL(
    `${basePath}/${consoleDefaultLang}${segment}`,
    consoleRoot.origin
  ).toString()
}

/**
 * Maps stored activity targets to in-app URLs. Account targets use a fixed
 * allowlist. Resource targets link to the owner activity feed only. Console
 * targets resolve only when the viewer still has platform administrator access.
 */
function readMetadataOrganizationId(
  metadata: Record<string, unknown> | null | undefined
): string | null {
  if (!metadata) return null
  const value = metadata.organizationId
  return typeof value === "string" && value.length > 0 ? value : null
}

function viewerMayOpenAccountTarget(input: {
  routeKey: string
  viewer?: ActivityTargetViewer
  eventOrganizationId: string | null
}): boolean {
  if (input.routeKey === "account.billing") {
    if (!input.viewer?.isOrgOwner) return false
    if (
      input.eventOrganizationId &&
      input.viewer.activeOrganizationId &&
      input.viewer.activeOrganizationId !== input.eventOrganizationId
    ) {
      return false
    }
    return true
  }
  if (input.routeKey === "account.storage") {
    if (!input.viewer?.activeOrganizationId) return false
    if (
      input.eventOrganizationId &&
      input.viewer.activeOrganizationId !== input.eventOrganizationId
    ) {
      return false
    }
    return true
  }
  return true
}

export function resolveActivityTarget(input: {
  readonly routeKey: string | null | undefined
  readonly definitionTarget: string | undefined
  readonly hasTargetParams: boolean
  readonly category: string
  readonly viewer?: ActivityTargetViewer
  readonly eventMetadata?: Record<string, unknown> | null
}): ResolvedActivityTarget | null {
  const {
    routeKey,
    definitionTarget,
    hasTargetParams,
    category,
    viewer,
    eventMetadata,
  } = input
  if (!routeKey || routeKey !== definitionTarget || hasTargetParams) return null

  if (routeKey.startsWith("resource.")) {
    return category === "resource" ? { path: activityResourceListPath } : null
  }

  if (routeKey.startsWith("console.") || category === "administration") {
    if (!viewerCanAccessConsole(viewer)) return null
    const consolePath = resolveConsoleTarget(routeKey)
    return consolePath ? { path: consolePath } : null
  }

  const path = activityTargetPaths[routeKey]
  if (!path) return null
  const eventOrganizationId = readMetadataOrganizationId(eventMetadata)
  if (!viewerMayOpenAccountTarget({ routeKey, viewer, eventOrganizationId })) {
    return null
  }
  return { path }
}
