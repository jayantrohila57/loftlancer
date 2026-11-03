import { db } from "@loftlancer/drizzle";
import { sql } from "drizzle-orm";

/** Inserts compatible with pre–soft-delete user/member/invitation columns (0007 SQL). */
export async function insertSeedUsers(
  rows: Array<{
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
  }>,
) {
  for (const row of rows) {
    await db.execute(sql`
      INSERT INTO "user" (id, name, email, email_verified)
      VALUES (${row.id}, ${row.name}, ${row.email}, ${row.emailVerified})
    `);
  }
}

export async function insertSeedMembers(
  rows: Array<{
    id: string;
    organizationId: string;
    userId: string;
    role: string;
  }>,
) {
  for (const row of rows) {
    await db.execute(sql`
      INSERT INTO member (id, organization_id, user_id, role)
      VALUES (
        ${row.id},
        ${row.organizationId},
        ${row.userId},
        ${row.role}
      )
    `);
  }
}

export async function insertSeedInvitation(row: {
  id: string;
  organizationId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: Date;
  inviterId: string;
}) {
  await db.execute(sql`
    INSERT INTO invitation (
      id,
      organization_id,
      email,
      role,
      status,
      expires_at,
      inviter_id
    )
    VALUES (
      ${row.id},
      ${row.organizationId},
      ${row.email},
      ${row.role},
      ${row.status},
      ${row.expiresAt},
      ${row.inviterId}
    )
  `);
}
