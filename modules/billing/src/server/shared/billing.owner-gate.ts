import { ORPCError } from "@packages/orpc/server"

export function assertBillingOrgOwner(input: { isOrgOwner: boolean }) {
  if (!input.isOrgOwner) {
    throw new ORPCError("FORBIDDEN", {
      message: "Only organization owners can manage billing.",
      data: { code: "rbac.org_owner_required" },
    })
  }
}
