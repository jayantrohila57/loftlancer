import { normalizeOrgRole } from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import {
  member,
  organization,
  organizationProfile,
  organizationSettings,
} from "@loftlancer/db/schema/organization";
import type { RunActionContext } from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { and, eq, isNull } from "drizzle-orm";
import type {
  OrganizationProfilePatch,
  OrganizationSettingsPatch,
} from "../../utils/validation/utils.organization-admin.validation";

const failed = (message: string) => ({ kind: "failed" as const, message });

export async function organizationSettingsGetService(
  ctx: RunActionContext,
): Promise<
  ServiceOutcome<{
    timeZone: string;
    locale: string;
    dateFormat: "short" | "medium" | "long";
    timeFormat: "12h" | "24h";
    weekStart: number;
    displayCurrency: string;
    defaultProjectVisibility: "private" | "public";
    notificationDefaults: { email: boolean; inApp: boolean; version: 1 };
    canEdit: boolean;
  }>
> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const [row] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, ctx.orgId))
    .limit(1);
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
  return {
    kind: "success",
    data: {
      timeZone: row?.timeZone ?? "UTC",
      locale: row?.locale ?? "en",
      dateFormat: row?.dateFormat ?? "medium",
      timeFormat: row?.timeFormat ?? "12h",
      weekStart: row?.weekStart ?? 1,
      displayCurrency: row?.displayCurrency ?? "USD",
      defaultProjectVisibility: row?.defaultProjectVisibility ?? "private",
      notificationDefaults: row?.notificationDefaults ?? {
        email: true,
        inApp: true,
        version: 1,
      },
      canEdit: normalizeOrgRole(membership?.role) === "owner",
    },
    message: "Organization settings loaded.",
  };
}

export async function organizationSettingsUpdateService(
  ctx: RunActionContext,
  input: OrganizationSettingsPatch,
): Promise<ServiceOutcome<{ success: true }>> {
  if (!ctx.orgId) return failed("Select an organization first.");
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
  if (normalizeOrgRole(membership?.role) !== "owner")
    return failed("Only organization owners can update organization defaults.");
  await db
    .insert(organizationSettings)
    .values({
      organizationId: ctx.orgId,
      ...input,
      updatedAt: new Date(),
      updatedBy: ctx.userId,
    })
    .onConflictDoUpdate({
      target: organizationSettings.organizationId,
      set: { ...input, updatedAt: new Date(), updatedBy: ctx.userId },
    });
  return {
    kind: "success",
    data: { success: true },
    message: "Organization settings updated.",
  };
}

export async function organizationProfileUpdateService(
  ctx: RunActionContext,
  input: OrganizationProfilePatch,
): Promise<ServiceOutcome<{ success: true }>> {
  if (!ctx.orgId) return failed("Select an organization first.");
  const organizationId = ctx.orgId;
  const values = {
    ...input,
    countryCode:
      input.countryCode === undefined
        ? undefined
        : (input.countryCode?.toUpperCase() ?? null),
    updatedAt: new Date(),
    updatedBy: ctx.userId,
  };
  await db.transaction(async (tx) => {
    await tx
      .insert(organizationProfile)
      .values({ organizationId, ...values })
      .onConflictDoUpdate({
        target: organizationProfile.organizationId,
        set: values,
      });
    await tx
      .update(organization)
      .set({ updatedAt: new Date(), updatedBy: ctx.userId })
      .where(eq(organization.id, organizationId));
  });
  return {
    kind: "success",
    data: { success: true },
    message: "Organization profile updated.",
  };
}

export async function organizationLogoUpdateService(
  ctx: RunActionContext,
  logo: string | null,
): Promise<ServiceOutcome<{ success: true }>> {
  if (!ctx.orgId) return failed("Select an organization first.");
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
  if (normalizeOrgRole(membership?.role) !== "owner")
    return failed("Only organization owners can change branding.");
  const [updated] = await db
    .update(organization)
    .set({ logo, updatedAt: new Date(), updatedBy: ctx.userId })
    .where(and(eq(organization.id, ctx.orgId), isNull(organization.deletedAt)))
    .returning({ id: organization.id });
  if (!updated) return failed("Organization not found.");
  return {
    kind: "success",
    data: { success: true },
    message: "Organization branding updated.",
  };
}
