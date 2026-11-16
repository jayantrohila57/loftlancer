import { ORPCError } from "@packages/orpc/server"

export function assertBillingOrgViewer(input: { canViewBilling: boolean }) {
  if (!input.canViewBilling) {
    throw new ORPCError("FORBIDDEN", {
      message:
        "Only organization owners, admins, and managers can view billing.",
      data: { code: "rbac.forbidden" },
    })
  }
}

export function assertBillingOrgManager(input: { canManageBilling: boolean }) {
  if (!input.canManageBilling) {
    throw new ORPCError("FORBIDDEN", {
      message: "Only organization owners and admins can manage billing.",
      data: { code: "rbac.forbidden" },
    })
  }
}

/** @deprecated Use assertBillingOrgManager */
export function assertBillingOrgOwner(input: { isOrgOwner: boolean }) {
  assertBillingOrgManager({ canManageBilling: input.isOrgOwner })
}
