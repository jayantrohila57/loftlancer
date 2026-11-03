import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";

const unavailable = {
  kind: "failed" as const,
  message:
    "Custom organization roles are not available. Use Owner, Manager, or Member.",
};

export async function organizationRoleListService(): Promise<
  ServiceOutcome<never[]>
> {
  return unavailable;
}
export async function organizationRoleCreateService(): Promise<
  ServiceOutcome<{ id: string }>
> {
  return unavailable;
}
export async function organizationRoleUpdateService(): Promise<
  ServiceOutcome<{ success: true }>
> {
  return unavailable;
}
export async function organizationRoleDeleteService(): Promise<
  ServiceOutcome<{ success: true }>
> {
  return unavailable;
}
export async function organizationRoleAssignService(): Promise<
  ServiceOutcome<{ success: true }>
> {
  return unavailable;
}
