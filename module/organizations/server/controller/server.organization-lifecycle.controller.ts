import type { RunActionContext } from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationLifecycleInputSchema,
  organizationLifecycleOutputSchema,
  organizationTransferOwnershipInputSchema,
  organizationTransferOwnershipOutputSchema,
} from "../../utils/validation/utils.organization-admin.validation";
import {
  organizationArchiveService,
  organizationTransferOwnershipService,
  organizationUnarchiveService,
} from "../service/server.organization-lifecycle.service";
import { organizationAdminAction } from "./server.organization-admin-action";

type Call = { ctx: RunActionContext; input?: unknown };
const organizationArchiveControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input: input ?? {},
    schema: organizationLifecycleInputSchema,
    outputSchema: organizationLifecycleOutputSchema,
    action: "organization.archive",
    ctx,
    audit: true,
    failureMessage: "Unable to archive organization.",
    handler: () => organizationArchiveService(ctx),
  });
const organizationUnarchiveControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input: input ?? {},
    schema: organizationLifecycleInputSchema,
    outputSchema: organizationLifecycleOutputSchema,
    action: "organization.unarchive",
    ctx,
    audit: true,
    failureMessage: "Unable to restore organization.",
    handler: () => organizationUnarchiveService(ctx),
  });
const organizationTransferOwnershipControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input,
    schema: organizationTransferOwnershipInputSchema,
    outputSchema: organizationTransferOwnershipOutputSchema,
    action: "organization.transfer_ownership",
    ctx,
    audit: true,
    failureMessage: "Check the ownership transfer details.",
    scope: (parsed, current) => ({
      ...current,
      targetUserId: parsed.targetUserId,
    }),
    handler: (parsed) =>
      organizationTransferOwnershipService(ctx, parsed.targetUserId),
  });

export async function organizationArchiveController(
  input: Parameters<typeof organizationArchiveControllerAction>[0],
) {
  const response = await organizationArchiveControllerAction(input);
  return serviceResponseSchema(organizationLifecycleOutputSchema).parse(
    response,
  );
}

export async function organizationUnarchiveController(
  input: Parameters<typeof organizationUnarchiveControllerAction>[0],
) {
  const response = await organizationUnarchiveControllerAction(input);
  return serviceResponseSchema(organizationLifecycleOutputSchema).parse(
    response,
  );
}

export async function organizationTransferOwnershipController(
  input: Parameters<typeof organizationTransferOwnershipControllerAction>[0],
) {
  const response = await organizationTransferOwnershipControllerAction(input);
  return serviceResponseSchema(organizationTransferOwnershipOutputSchema).parse(
    response,
  );
}
