import { ORPCError } from "@packages/orpc/server"

export function assertBillingOrgManager(input: { canManageBilling: boolean }) {
  if (!input.canManageBilling) {
    throw new ORPCError("FORBIDDEN", {
      message: "Only organization owners and admins can manage billing.",
      data: { code: "rbac.org_owner_required" },
    })
  }
}

/** @deprecated Use assertBillingOrgManager */
export function assertBillingOrgOwner(input: { isOrgOwner: boolean }) {
  assertBillingOrgManager({ canManageBilling: input.isOrgOwner })
}
