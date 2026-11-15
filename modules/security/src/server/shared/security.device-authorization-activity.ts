import type { ActivityContext } from "@modules/activity/server"
import { beginActivity, recordActivity } from "@modules/activity/server"
import type { BetterAuthPlugin } from "@packages/better-auth"
import { createAuthMiddleware, getSessionFromCtx } from "@packages/better-auth"
import { logger } from "@packages/logger/server"

type PendingDeviceActivity = {
  context: ActivityContext
}

const pendingByRequest = new WeakMap<object, PendingDeviceActivity>()

function deviceActivityRequestKey(ctx: { request?: Request }) {
  return ctx.request ?? ctx
}

async function recordDeviceAuthorizationOutcome(
  ctx: Parameters<Parameters<typeof createAuthMiddleware>[0]>[0],
  actionId:
    | "security.device_authorization.approve"
    | "security.device_authorization.deny",
  expectedStatus: "approved" | "denied"
) {
  const requestKey = deviceActivityRequestKey(ctx)
  const pending = pendingByRequest.get(requestKey)
  pendingByRequest.delete(requestKey)
  if (!pending) return
  try {
    const userCode = ctx.body?.userCode
    if (typeof userCode !== "string") return
    const session = await getSessionFromCtx(ctx)
    if (!session || session.user.id !== pending.context.ownerUserId) return
    const record = (await ctx.context.adapter.findOne({
      model: "deviceCode",
      where: [{ field: "userCode", value: userCode }],
    })) as {
      status: string
      userId?: string | null
      clientId?: string | null
      scope?: string | null
    } | null
    if (
      !record ||
      record.status !== expectedStatus ||
      record.userId !== pending.context.ownerUserId
    )
      return
    const metadata =
      actionId === "security.device_authorization.approve"
        ? {
            ...(record.clientId ? { clientId: record.clientId } : {}),
            ...(record.scope ? { scope: record.scope } : {}),
          }
        : {
            ...(record.clientId ? { clientId: record.clientId } : {}),
          }
    await recordActivity(pending.context, {
      outcome: "success",
      sourceApp: "auth",
      sourceModule: "device-authorization",
      metadata,
      sessionId: session.session.id,
      ipAddress: session.session.ipAddress ?? undefined,
      userAgent: session.session.userAgent ?? undefined,
    })
  } catch {
    logger.error("activity.record.failed", {
      app: "auth",
      module: "device-authorization",
      actionId,
      activityId: pending.context.activityId,
      outcome: "error",
    })
  }
}

export function buildDeviceAuthorizationActivityPlugin(): BetterAuthPlugin {
  return {
    id: "device-authorization-activity",
    hooks: {
      before: [
        {
          matcher(ctx) {
            return ctx.path === "/device/approve" || ctx.path === "/device/deny"
          },
          handler: createAuthMiddleware(async (ctx) => {
            const session = await getSessionFromCtx(ctx)
            if (!session) return
            const actionId =
              ctx.path === "/device/approve"
                ? ("security.device_authorization.approve" as const)
                : ("security.device_authorization.deny" as const)
            pendingByRequest.set(deviceActivityRequestKey(ctx), {
              context: beginActivity({
                actionId,
                ownerUserId: session.user.id,
                actor: { type: "user", userId: session.user.id },
              }),
            })
          }),
        },
      ],
      after: [
        {
          matcher(ctx) {
            return ctx.path === "/device/approve" || ctx.path === "/device/deny"
          },
          handler: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/device/approve") {
              await recordDeviceAuthorizationOutcome(
                ctx,
                "security.device_authorization.approve",
                "approved"
              )
              return
            }
            await recordDeviceAuthorizationOutcome(
              ctx,
              "security.device_authorization.deny",
              "denied"
            )
          }),
        },
      ],
    },
  }
}
