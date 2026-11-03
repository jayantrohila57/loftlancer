import type { RunActionContext } from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationMemberAccessSummaryOutputSchema,
  organizationMemberAdminOutputSchema,
  organizationMemberIdInputSchema,
  organizationMemberProfileInputSchema,
  organizationMemberSuspendInputSchema,
} from "../../utils/validation/utils.organization-admin.validation";
import {
  organizationMemberAccessSummaryService,
  organizationMemberProfileUpdateService,
  organizationMemberSetSuspendedService,
} from "../service/server.organization-member-admin.service";
import { organizationAdminAction } from "./server.organization-admin-action";

type Call = { ctx: RunActionContext; input?: unknown };
const organizationMemberProfileUpdateControllerAction = ({
  ctx,
  input,
}: Call) =>
  organizationAdminAction({
    input,
    schema: organizationMemberProfileInputSchema,
    outputSchema: organizationMemberAdminOutputSchema,
    action: "member.profile.update",
    ctx,
    audit: true,
    failureMessage: "Check the member profile.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.memberId,
      payload: { fields: ["jobTitle", "department"] },
    }),
    handler: (parsed) => organizationMemberProfileUpdateService(ctx, parsed),
  });
const organizationMemberSetSuspendedControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input,
    schema: organizationMemberSuspendInputSchema,
    outputSchema: organizationMemberAdminOutputSchema,
    action: "member.suspend",
    ctx,
    audit: true,
    failureMessage: "Check the member access settings.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.memberId,
      payload: { suspended: parsed.suspended },
    }),
    handler: (parsed) => organizationMemberSetSuspendedService(ctx, parsed),
  });
const organizationMemberAccessSummaryControllerAction = ({
  ctx,
  input,
}: Call) =>
  organizationAdminAction({
    input,
    schema: organizationMemberIdInputSchema,
    outputSchema: organizationMemberAccessSummaryOutputSchema,
    action: "member.list",
    ctx,
    audit: false,
    failureMessage: "Unable to load member access.",
    scope: (parsed, current) => ({ ...current, entityId: parsed.memberId }),
    handler: (parsed) =>
      organizationMemberAccessSummaryService(ctx, parsed.memberId),
  });

export async function organizationMemberProfileUpdateController(
  input: Parameters<typeof organizationMemberProfileUpdateControllerAction>[0],
) {
  const response = await organizationMemberProfileUpdateControllerAction(input);
  return serviceResponseSchema(organizationMemberAdminOutputSchema).parse(
    response,
  );
}

export async function organizationMemberSetSuspendedController(
  input: Parameters<typeof organizationMemberSetSuspendedControllerAction>[0],
) {
  const response = await organizationMemberSetSuspendedControllerAction(input);
  return serviceResponseSchema(organizationMemberAdminOutputSchema).parse(
    response,
  );
}

export async function organizationMemberAccessSummaryController(
  input: Parameters<typeof organizationMemberAccessSummaryControllerAction>[0],
) {
  const response = await organizationMemberAccessSummaryControllerAction(input);
  return serviceResponseSchema(
    organizationMemberAccessSummaryOutputSchema,
  ).parse(response);
}
