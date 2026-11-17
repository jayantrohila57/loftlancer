import { beginActivity } from "@modules/activity/server"
import { getDb } from "@packages/drizzle"
import { user } from "@packages/drizzle/schema"
import { logger } from "@packages/logger/server"
import { eq } from "drizzle-orm"
import { prepareUserAccountDeletion } from "./security.account-deletion.orchestration"
import { sendAccountDeletionConfirmationEmail } from "./security.account-deletion-email"

type DeleteUserUser = {
  readonly id: string
  readonly email?: string
}

export function buildSecurityDeleteUserCallbacks() {
  const pending = new WeakMap<
    Request,
    { readonly activityId: string; readonly confirmationEmail?: string }
  >()
  return {
    async beforeDelete(deleteUser: DeleteUserUser, request?: Request) {
      const db = getDb()
      if (!db) throw new Error("Database unavailable")
      const [row] = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, deleteUser.id))
        .limit(1)
      const confirmationEmail = row?.email ?? deleteUser.email

      await prepareUserAccountDeletion({
        userId: deleteUser.id,
        originalEmail: confirmationEmail ?? deleteUser.email ?? "",
      })

      const activity = beginActivity({
        actionId: "security.account.delete",
        ownerUserId: deleteUser.id,
        actor: { type: "user", userId: deleteUser.id },
      })
      if (request) {
        pending.set(request, {
          activityId: activity.activityId,
          confirmationEmail: confirmationEmail ?? undefined,
        })
      }
    },
    async afterDelete(deleteUser: DeleteUserUser, request?: Request) {
      const meta = request ? pending.get(request) : undefined
      if (request) pending.delete(request)
      const activityId = meta?.activityId
      logger.info("account.delete.completed", {
        app: "auth",
        module: "security",
        actionId: "security.account.delete",
        activityId,
        outcome: "success",
      })
      const confirmationEmail = meta?.confirmationEmail
      if (confirmationEmail) {
        try {
          await sendAccountDeletionConfirmationEmail({
            to: confirmationEmail,
            userId: deleteUser.id,
          })
        } catch {
          logger.error("account.delete.confirmation_email_failed", {
            app: "auth",
            module: "security",
            outcome: "error",
            errorCode: "ACCOUNT_DELETE_EMAIL_FAILED",
          })
        }
      }
    },
  }
}
