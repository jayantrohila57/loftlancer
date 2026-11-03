import { normalizeOrgRole } from "@features/authorization/utils";
import { db } from "@loftlancer/drizzle";
import {
  member,
  organization,
  organizationProfile,
} from "@loftlancer/drizzle/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationGetProfileInput,
  OrganizationGetProfileOutput,
} from "../../utils/validation/utils.organization-get-profile.validation";

export async function organizationGetProfileService(
  ctx: RunActionContext,
  _input: OrganizationGetProfileInput,
): Promise<ServiceOutcome<OrganizationGetProfileOutput>> {
  if (!ctx.orgId)
    return { kind: "failed", message: "Select an organization first." };

  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, ctx.orgId),
        eq(member.userId, ctx.userId),
        isNull(member.deletedAt),
      ),
    )
    .limit(1);
  const canManageProfile = normalizeOrgRole(membership?.role) === "owner";
  const [row] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
      archivedAt: organization.archivedAt,
      description: organizationProfile.description,
      legalName: organizationProfile.legalName,
      websiteUrl: organizationProfile.websiteUrl,
      industry: organizationProfile.industry,
      sizeBand: organizationProfile.sizeBand,
      foundedYear: organizationProfile.foundedYear,
      contactEmail: organizationProfile.contactEmail,
      contactPhone: organizationProfile.contactPhone,
      supportUrl: organizationProfile.supportUrl,
      countryCode: organizationProfile.countryCode,
      region: organizationProfile.region,
      city: organizationProfile.city,
      postalCode: organizationProfile.postalCode,
      addressLine1: organizationProfile.addressLine1,
      addressLine2: organizationProfile.addressLine2,
    })
    .from(organization)
    .leftJoin(
      organizationProfile,
      eq(organizationProfile.organizationId, organization.id),
    )
    .where(and(eq(organization.id, ctx.orgId), isNull(organization.deletedAt)))
    .limit(1);

  if (!row) return { kind: "failed", message: "Organization not found." };

  const data: OrganizationGetProfileOutput = canManageProfile
    ? { ...row, canManageBranding: true }
    : {
        ...row,
        canManageBranding: false,
        legalName: null,
        foundedYear: null,
        contactEmail: null,
        contactPhone: null,
        supportUrl: null,
        countryCode: null,
        region: null,
        city: null,
        postalCode: null,
        addressLine1: null,
        addressLine2: null,
      };

  return { kind: "success", data, message: "Organization profile loaded." };
}
