import { activeMemberWhere, db } from "@loftlancer/drizzle";
import { member, organization } from "@loftlancer/drizzle/schema/organization";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import { and, count, eq, inArray } from "drizzle-orm";

import { soleOwnerBlockersFromCounts } from "./sole-owner-blockers";

export async function findSoleOwnerOrganizations(userId: string) {
  if (!isOrganizationsEnabled()) {
    return [];
  }

  const owned = await db
    .select({
      organizationId: member.organizationId,
      orgName: organization.name,
      orgSlug: organization.slug,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      activeMemberWhere(
        and(eq(member.userId, userId), eq(member.role, "owner")),
      ),
    );

  if (owned.length === 0) {
    return [];
  }

  const orgIds = owned.map((row) => row.organizationId);

  const ownerCounts = await db
    .select({
      organizationId: member.organizationId,
      ownerCount: count(),
    })
    .from(member)
    .where(
      activeMemberWhere(
        and(inArray(member.organizationId, orgIds), eq(member.role, "owner")),
      ),
    )
    .groupBy(member.organizationId);

  return soleOwnerBlockersFromCounts(
    owned,
    ownerCounts.map((row) => ({
      organizationId: row.organizationId,
      ownerCount: row.ownerCount ?? 0,
    })),
  );
}
