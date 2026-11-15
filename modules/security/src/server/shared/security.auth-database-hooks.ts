import {
  beginActivity,
  recordActivity,
  recordProviderUnlink,
  recordSecurityActivity,
  recordUserActivity,
  sessionDeleteActivityType,
} from "@modules/activity/server"
import { shouldBlockCurrentSessionRevocation } from "@modules/sessions/utils"
import type { BetterAuthDatabaseHooks as DatabaseHooks } from "@packages/better-auth"
import { getAuth } from "@packages/better-auth"
import { logger } from "@packages/logger/server"

// Better Auth passes the same endpoint context to its before and after hooks.
// Keep separate queues for operations that can happen more than once per request.
const pendingIds = new WeakMap<object, Map<string, string[]>>()
function reserveId(
  context: object | null | undefined,
  key: string,
  actionId: string,
  legacy?: "user" | "security"
) {
  if (!context) return
  const pending = pendingIds.get(context) ?? new Map<string, string[]>()
  const queue = pending.get(key) ?? []
  const id = crypto.randomUUID()
  queue.push(id)
  pending.set(key, queue)
  pendingIds.set(context, pending)
  logger.info("activity.started", {
    app: "auth",
    module: "security",
    actionId,
    activityId: legacy ? `legacy:${legacy}:${id}` : id,
  })
}
function takeId(context: object | null | undefined, key: string) {
  if (!context) return undefined
  const pending = pendingIds.get(context)
  const queue = pending?.get(key)
  const id = queue?.shift()
  if (!queue?.length) pending?.delete(key)
  return id
}

type UserUpdateBody = {
  name?: string
  image?: string | null
}

async function recordReservedUserActivity(input: {
  id: string | undefined
  userId: string
  type: "profile_updated" | "avatar_updated" | "avatar_removed"
  actionId:
    | "account.profile.update"
    | "account.avatar.update"
    | "account.avatar.remove"
}) {
  try {
    await recordUserActivity({
      id: input.id,
      userId: input.userId,
      type: input.type,
    })
  } catch {
    logger.error("activity.record.failed", {
      app: "auth",
      module: "profile",
      actionId: input.actionId,
      activityId: input.id ? `legacy:user:${input.id}` : undefined,
      outcome: "error",
    })
  }
}

/** A provider account is attributed only to an independently verified session. */
export async function recordVerifiedProviderLink(input: {
  activityId?: string
  accountUserId: string
  providerId: string
  sessionUserId: string | undefined
}) {
  if (!input.sessionUserId || input.sessionUserId !== input.accountUserId)
    return
  const activity = beginActivity({
    activityId: input.activityId,
    actionId: "security.provider.link",
    ownerUserId: input.accountUserId,
    actor: { type: "user", userId: input.sessionUserId },
  })
  await recordActivity(activity, {
    outcome: "success",
    sourceApp: "auth",
    sourceModule: "connected-accounts",
    metadata: { providerId: input.providerId },
  })
}

export function buildSecurityAuthDatabaseHooks(): DatabaseHooks {
  return {
    user: {
      update: {
        before: async (data, context) => {
          if (
            context?.path !== "/update-user" ||
            !context.context.session?.user.id
          )
            return
          const userId = context.context.session.user.id
          const update = data as UserUpdateBody
          if (Object.hasOwn(update, "image"))
            reserveId(
              context,
              `avatar:${userId}`,
              update.image === null
                ? "account.avatar.remove"
                : "account.avatar.update",
              "user"
            )
          if (update.name !== undefined)
            reserveId(
              context,
              `profile:${userId}`,
              "account.profile.update",
              "user"
            )
        },
        after: async (updatedUser, context) => {
          if (
            context?.path !== "/update-user" ||
            context.context.session?.user.id !== updatedUser.id
          )
            return
          const body = context.body as UserUpdateBody | undefined
          if (!body) return
          if (Object.hasOwn(body, "image")) {
            const id = takeId(context, `avatar:${updatedUser.id}`)
            await recordReservedUserActivity({
              id,
              userId: updatedUser.id,
              type: body.image === null ? "avatar_removed" : "avatar_updated",
              actionId:
                body.image === null
                  ? "account.avatar.remove"
                  : "account.avatar.update",
            })
          }
          if (body.name !== undefined) {
            const id = takeId(context, `profile:${updatedUser.id}`)
            await recordReservedUserActivity({
              id,
              userId: updatedUser.id,
              type: "profile_updated",
              actionId: "account.profile.update",
            })
          }
        },
      },
    },
    account: {
      create: {
        before: async (account, context) => {
          if (
            context &&
            (context.path === "/link-social" ||
              context.path.startsWith("/callback/"))
          )
            reserveId(
              context,
              `provider-link:${account.userId}`,
              "security.provider.link"
            )
        },
        after: async (account, context) => {
          if (
            !context ||
            !(
              context.path === "/link-social" ||
              context.path.startsWith("/callback/")
            )
          )
            return
          const activityId = takeId(context, `provider-link:${account.userId}`)
          try {
            const current =
              context.context.session ??
              (context.headers
                ? await getAuth().api.getSession({ headers: context.headers })
                : null)
            await recordVerifiedProviderLink({
              activityId,
              accountUserId: account.userId,
              providerId: account.providerId,
              sessionUserId: current?.user.id,
            })
          } catch {
            logger.error("activity.record.failed", {
              app: "auth",
              module: "connected-accounts",
              actionId: "security.provider.link",
              activityId,
              outcome: "error",
            })
          }
        },
      },
      delete: {
        before: async (account, context) => {
          if (
            context?.path === "/unlink-account" &&
            context.context.session?.user.id === account.userId
          )
            reserveId(
              context,
              `provider-unlink:${account.id}`,
              "security.provider.unlink",
              "security"
            )
        },
        after: async (account, context) => {
          if (
            context?.path !== "/unlink-account" ||
            context.context.session?.user.id !== account.userId
          )
            return
          const id = takeId(context, `provider-unlink:${account.id}`)
          try {
            await recordProviderUnlink({
              id,
              userId: account.userId,
              sessionId: context.context.session.session.id,
              actorUserId: context.context.session.user.id,
              ipAddress: context.context.session.session.ipAddress,
              userAgent: context.context.session.session.userAgent,
            })
          } catch {
            logger.error("activity.record.failed", {
              app: "auth",
              module: "connected-accounts",
              actionId: "security.provider.unlink",
              activityId: id ? `legacy:security:${id}` : undefined,
              outcome: "error",
            })
          }
        },
      },
    },
    session: {
      create: {
        before: async (session, context) => {
          reserveId(
            context,
            `sign-in:${session.userId}`,
            "auth.sign_in",
            "security"
          )
        },
        after: async (session, context) => {
          const id = takeId(context, `sign-in:${session.userId}`)
          try {
            await recordSecurityActivity({
              id,
              userId: session.userId,
              sessionId: session.id,
              type: "sign_in",
              actorUserId: session.userId,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
            })
          } catch {
            logger.error("activity.record.failed", {
              app: "auth",
              module: "sessions",
              actionId: "auth.sign_in",
              activityId: id ? `legacy:security:${id}` : undefined,
              outcome: "error",
            })
          }
        },
      },
      delete: {
        before: async (session, context) => {
          const path = context?.path ?? ""
          if (
            shouldBlockCurrentSessionRevocation({
              path,
              deletedSessionToken: session.token,
              currentSessionToken: context?.context.session?.session?.token,
            })
          ) {
            return false
          }
          const type = sessionDeleteActivityType(path)
          const actionId = {
            sign_out: "auth.sign_out",
            session_revoked: "auth.session.revoke",
            session_ended: "auth.session.end",
          }[type]
          reserveId(context, `session-end:${session.id}`, actionId, "security")
        },
        after: async (session, context) => {
          const path = context?.path ?? ""
          const type = sessionDeleteActivityType(path)
          const id = takeId(context, `session-end:${session.id}`)
          const actionId = {
            sign_out: "auth.sign_out",
            session_revoked: "auth.session.revoke",
            session_ended: "auth.session.end",
          }[type]
          try {
            await recordSecurityActivity({
              id,
              userId: session.userId,
              sessionId: session.id,
              type,
              actorUserId: context?.context.session?.user.id,
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
            })
          } catch {
            logger.error("activity.record.failed", {
              app: "auth",
              module: "sessions",
              actionId,
              activityId: id ? `legacy:security:${id}` : undefined,
              outcome: "error",
            })
          }
        },
      },
    },
  }
}
