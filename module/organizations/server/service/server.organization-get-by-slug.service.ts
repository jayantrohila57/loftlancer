import { activeMemberWhere, db } from "@loftlancer/db";
import {
  member,
  organization,
  organizationProfile,
} from "@loftlancer/db/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationGetBySlugInput,
  OrganizationGetBySlugOutput,
} from "../../utils/validation/utils.organization-get-by-slug.validation";

export async function organizationGetBySlugService(
  ctx: RunActionContext,
  input: OrganizationGetBySlugInput,
): Promise<ServiceOutcome<OrganizationGetBySlugOutput>> {
  const [row] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      role: member.role,
      description: organizationProfile.description,
      websiteUrl: organizationProfile.websiteUrl,
      industry: organizationProfile.industry,
      sizeBand: organizationProfile.sizeBand,
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .leftJoin(
      organizationProfile,
      eq(organizationProfile.organizationId, organization.id),
    )
    .where(
      activeMemberWhere(
        and(
          eq(organization.slug, input.slug),
          eq(member.userId, ctx.userId),
          isNull(organization.deletedAt),
        ),
      ),
    )
    .limit(1);

  if (!row) return { kind: "failed", message: "Organization not found" };

  return { kind: "success", data: row, message: "Organization loaded." };
}
