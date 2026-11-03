import { activeMemberWhere, db } from "@loftlancer/drizzle";
import { member, organization } from "@loftlancer/drizzle/schema/organization";
import { and, eq, isNull } from "drizzle-orm";
import type { OrganizationRef } from "./inputs";

export async function resolveOrganizationIdForUser(
  userId: string,
  ref: OrganizationRef | { organizationId?: string; organizationSlug?: string },
): Promise<string> {
  const organizationId = ref.organizationId;
  const organizationSlug = ref.organizationSlug;

  if (organizationId) {
    const [row] = await db
      .select({ id: organization.id })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        activeMemberWhere(
          and(
            eq(member.userId, userId),
            eq(organization.id, organizationId),
            isNull(organization.deletedAt),
          ),
        ),
      )
      .limit(1);
    if (!row) {
      throw new Error("organization_not_found");
    }
    return row.id;
  }

  if (organizationSlug) {
    const [row] = await db
      .select({ id: organization.id })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(
        activeMemberWhere(
          and(
            eq(member.userId, userId),
            eq(organization.slug, organizationSlug),
            isNull(organization.deletedAt),
          ),
        ),
      )
      .limit(1);
    if (!row) {
      throw new Error("organization_not_found");
    }
    return row.id;
  }

  throw new Error("organization_required");
}
