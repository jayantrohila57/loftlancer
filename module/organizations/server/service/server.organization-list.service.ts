import { activeMemberWhere, db } from "@loftlancer/db";
import { member, organization } from "@loftlancer/db/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationListInput,
  OrganizationListOutput,
} from "../../utils/validation/utils.organization-list.validation";

export async function organizationListService(
  ctx: RunActionContext,
  _input: OrganizationListInput,
): Promise<ServiceOutcome<OrganizationListOutput>> {
  const rows = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      role: member.role,
      createdAt: organization.createdAt,
      archivedAt: organization.archivedAt,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(
      activeMemberWhere(
        and(eq(member.userId, ctx.userId), isNull(organization.deletedAt)),
      ),
    );

  return {
    kind: "success",
    data: { items: rows },
    message: "Organizations loaded.",
  };
}
