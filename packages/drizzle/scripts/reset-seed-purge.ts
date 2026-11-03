import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { eq, sql } from "drizzle-orm";

/**
 * Removes all application data and non-kept auth users.
 * Preserves the kept user's user, account, session, and verification rows.
 */
export async function purgeAppData(keepUserId: string, keepUserEmail: string) {
  const tables = [
    "audit_event",
    "audit_log",
    "notification",
    "action_block",
    "project_member_grant",
    "project_team",
    "project_manager",
    "team_member",
    "team",
    "environment_variable",
    "environment",
    "project",
    "invitation",
    "member",
    "organization",
  ];

  const truncateList = tables.map((t) => `"${t}"`).join(", ");

  await db.transaction(async (tx) => {
    await tx.execute(
      sql.raw(`TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE`),
    );

    await tx.execute(sql`
      DELETE FROM verification
      WHERE lower(identifier) <> lower(${keepUserEmail})
    `);

    await tx.execute(sql`
      UPDATE session
      SET active_organization_id = NULL
      WHERE user_id = ${keepUserId}
    `);

    await tx.execute(sql`
      DELETE FROM "user"
      WHERE id <> ${keepUserId}
    `);
  });

  const [remainingUsers] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, keepUserId))
    .limit(1);

  if (!remainingUsers) {
    throw new Error(
      `Kept user ${keepUserId} missing after purge — aborting seed.`,
    );
  }
}
