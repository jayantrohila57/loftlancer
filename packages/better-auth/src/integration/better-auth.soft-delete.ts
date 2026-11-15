import { readUserDeletedAt } from "@packages/drizzle"
import type { BetterAuthPlugin } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"

export const DELETED_ACCOUNT_MESSAGE =
  "This account was deleted and cannot be used again."

function isUserTombstoned(record: Record<string, unknown>): boolean {
  const deletedAt = record.deletedAt ?? record.deleted_at
  return deletedAt != null && deletedAt !== false && deletedAt !== ""
}

async function assertUserNotTombstoned(
  userId: string,
  internalAdapter: { findUserById: (id: string) => Promise<unknown> }
): Promise<void> {
  const found = (await internalAdapter.findUserById(userId)) as Record<
    string,
    unknown
  > | null
  if (found && isUserTombstoned(found)) {
    throw tombstoneRejection()
  }
  const deletedAt = await readUserDeletedAt(userId)
  if (deletedAt != null && isUserTombstoned({ deletedAt })) {
    throw tombstoneRejection()
  }
}

function tombstoneRejection(): APIError {
  return APIError.from("FORBIDDEN", {
    message: DELETED_ACCOUNT_MESSAGE,
    code: "ACCOUNT_DELETED",
  })
}

/** Soft-delete policy: tombstone users, block hard delete and re-auth. */
export function buildSoftDeleteUserPlugin(): BetterAuthPlugin {
  return {
    id: "soft-delete-user",
    init(authContext) {
      return {
        options: {
          databaseHooks: {
            user: {
              delete: {
                async before() {
                  return false
                },
              },
            },
            account: {
              delete: {
                async before(_account, ctx) {
                  if (ctx?.path === "/unlink-account") return
                  return false
                },
              },
            },
            session: {
              create: {
                async before(session, ctx) {
                  const internalAdapter =
                    ctx?.context.internalAdapter ?? authContext.internalAdapter
                  await assertUserNotTombstoned(session.userId, internalAdapter)
                },
              },
            },
          },
        },
      }
    },
    hooks: {
      before: [
        {
          matcher(ctx) {
            return ctx.path === "/sign-up/email"
          },
          handler: createAuthMiddleware(async (ctx) => {
            const rawEmail = ctx.body?.email
            if (typeof rawEmail !== "string") return
            const email = rawEmail.toLowerCase()
            const found =
              await ctx.context.internalAdapter.findUserByEmail(email)
            if (found?.user && isUserTombstoned(found.user)) {
              throw APIError.from("UNPROCESSABLE_ENTITY", {
                message: DELETED_ACCOUNT_MESSAGE,
                code: "ACCOUNT_DELETED",
              })
            }
          }),
        },
      ],
    },
  }
}
