import { and, eq } from "drizzle-orm";

import { db } from "../core/drizzle.client";
import { user } from "../schema/better-auth";
import { member, organization } from "../schema/organization";
import { activeUserWhere } from "./drizzle.soft-delete";

const E2E_PRIMARY_EMAIL = "e2e-playwright@loftlancer.local";
export const E2E_PRIMARY_ORG_SLUG = "e2e-notifications-org";

/** Ensures the primary Playwright user can reach org-scoped studio routes. */
export async function ensureE2ePrimaryOrganization() {
  const [userRow] = await db
    .select({ id: user.id })
    .from(user)
    .where(activeUserWhere(eq(user.email, E2E_PRIMARY_EMAIL)))
    .limit(1);

  if (!userRow) {
    return;
  }

  let orgId: string;
  const [existingOrg] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, E2E_PRIMARY_ORG_SLUG))
    .limit(1);

  if (existingOrg) {
    orgId = existingOrg.id;
  } else {
    orgId = crypto.randomUUID();
    await db.insert(organization).values({
      id: orgId,
      name: "E2E Notifications Org",
      slug: E2E_PRIMARY_ORG_SLUG,
    });
  }

  const [existingMember] = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.organizationId, orgId), eq(member.userId, userRow.id)))
    .limit(1);

  if (!existingMember) {
    await db.insert(member).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      userId: userRow.id,
      role: "owner",
    });
  }
}
