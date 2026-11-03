import type { RunActionContext } from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationRoleAssignInputSchema,
  organizationRoleCreateInputSchema,
  organizationRoleCreateOutputSchema,
  organizationRoleIdInputSchema,
  organizationRoleListInputSchema,
  organizationRoleListOutputSchema,
  organizationRoleMutationOutputSchema,
  organizationRoleUpdateInputSchema,
} from "../../utils/validation/utils.organization-admin.validation";
import {
  organizationRoleAssignService,
  organizationRoleCreateService,
  organizationRoleDeleteService,
  organizationRoleListService,
  organizationRoleUpdateService,
} from "../service/server.organization-roles.service";
import { organizationAdminAction } from "./server.organization-admin-action";

type Call = { ctx: RunActionContext; input?: unknown };
const organizationRoleListControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input: input ?? {},
    schema: organizationRoleListInputSchema,
    outputSchema: organizationRoleListOutputSchema,
    action: "member.list",
    ctx,
    audit: false,
    failureMessage: "Unable to load organization roles.",
    handler: () => organizationRoleListService(),
  });
const organizationRoleCreateControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input,
    schema: organizationRoleCreateInputSchema,
    outputSchema: organizationRoleCreateOutputSchema,
    action: "organization.role.create",
    ctx,
    audit: true,
    failureMessage: "Check the organization role.",
    scope: (parsed, current) => ({
      ...current,
      payload: {
        fields: ["name", "description", "permissions"],
        permissionCount: parsed.actions.length,
      },
    }),
    handler: () => organizationRoleCreateService(),
  });
const organizationRoleUpdateControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input,
    schema: organizationRoleUpdateInputSchema,
    outputSchema: organizationRoleMutationOutputSchema,
    action: "organization.role.update",
    ctx,
    audit: true,
    failureMessage: "Check the organization role.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.roleId,
      payload: {
        fields: ["name", "description", "permissions"],
        permissionCount: parsed.actions.length,
      },
    }),
    handler: () => organizationRoleUpdateService(),
  });
const organizationRoleDeleteControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input,
    schema: organizationRoleIdInputSchema,
    outputSchema: organizationRoleMutationOutputSchema,
    action: "organization.role.delete",
    ctx,
    audit: true,
    failureMessage: "Check the organization role.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.roleId,
      payload: { operation: "delete" },
    }),
    handler: () => organizationRoleDeleteService(),
  });
const organizationRoleAssignControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input,
    schema: organizationRoleAssignInputSchema,
    outputSchema: organizationRoleMutationOutputSchema,
    action: "organization.role.assign",
    ctx,
    audit: true,
    failureMessage: "Check the member role assignment.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.memberId,
      payload: { roleId: parsed.roleId },
    }),
    handler: () => organizationRoleAssignService(),
  });

export async function organizationRoleListController(
  input: Parameters<typeof organizationRoleListControllerAction>[0],
) {
  const response = await organizationRoleListControllerAction(input);
  return serviceResponseSchema(organizationRoleListOutputSchema).parse(
    response,
  );
}

export async function organizationRoleCreateController(
  input: Parameters<typeof organizationRoleCreateControllerAction>[0],
) {
  const response = await organizationRoleCreateControllerAction(input);
  return serviceResponseSchema(organizationRoleCreateOutputSchema).parse(
    response,
  );
}

export async function organizationRoleUpdateController(
  input: Parameters<typeof organizationRoleUpdateControllerAction>[0],
) {
  const response = await organizationRoleUpdateControllerAction(input);
  return serviceResponseSchema(organizationRoleMutationOutputSchema).parse(
    response,
  );
}

export async function organizationRoleDeleteController(
  input: Parameters<typeof organizationRoleDeleteControllerAction>[0],
) {
  const response = await organizationRoleDeleteControllerAction(input);
  return serviceResponseSchema(organizationRoleMutationOutputSchema).parse(
    response,
  );
}

export async function organizationRoleAssignController(
  input: Parameters<typeof organizationRoleAssignControllerAction>[0],
) {
  const response = await organizationRoleAssignControllerAction(input);
  return serviceResponseSchema(organizationRoleMutationOutputSchema).parse(
    response,
  );
}
