import type { BetterAuthDatabaseHooks } from "@packages/better-auth"
import { getDb } from "@packages/drizzle"
import { user } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { sendResendEmail } from "@packages/resend"
import { serverEnv } from "@packages/t3-env/server"
import { eq } from "drizzle-orm"

export function buildNotificationAuthDatabaseHooks(): BetterAuthDatabaseHooks {
  return {
    session: {
      create: {
        after: async (session) => {
          if (!serverEnv.RESEND_API_KEY) return
          try {
            const db = getDb()
            if (!db) throw new Error("Database unavailable")
            const [recipient] = await db
              .select({ email: user.email })
              .from(user)
              .where(eq(user.id, session.userId))
              .limit(1)
            if (!recipient) throw new Error("User unavailable")
            await sendResendEmail({
              to: recipient.email,
              subject: "New sign-in to your account",
              html: "<p>A new session was signed in to your account.</p><p>If this was not you, review your active sessions and sign out any you do not recognize.</p>",
            })
          } catch {
            logger.error("notification.security_email_failed", {
              app: "auth",
              module: "notifications",
              outcome: "error",
              errorCode: "SECURITY_EMAIL_FAILED",
            })
          }
        },
      },
    },
  }
}
