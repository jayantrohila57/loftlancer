import type { RunActionContext } from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationSecurityDomainCreateInputSchema,
  organizationSecurityDomainCreateOutputSchema,
  organizationSecurityDomainIdInputSchema,
  organizationSecurityDomainListInputSchema,
  organizationSecurityDomainListOutputSchema,
  organizationSecurityDomainMutationOutputSchema,
  organizationSecurityDomainVerifyOutputSchema,
} from "../../utils/validation/utils.organization-admin.validation";
import {
  organizationSecurityDomainCreateService,
  organizationSecurityDomainListService,
  organizationSecurityDomainRevokeService,
  organizationSecurityDomainVerifyService,
} from "../service/server.organization-security-domains.service";
import { organizationAdminAction } from "./server.organization-admin-action";

type Call = { ctx: RunActionContext; input?: unknown };
const organizationSecurityDomainListControllerAction = ({ ctx, input }: Call) =>
  organizationAdminAction({
    input: input ?? {},
    schema: organizationSecurityDomainListInputSchema,
    outputSchema: organizationSecurityDomainListOutputSchema,
    action: "organization.settings.view",
    ctx,
    audit: false,
    failureMessage: "Unable to load organization security domains.",
    handler: () => organizationSecurityDomainListService(ctx),
  });
const organizationSecurityDomainCreateControllerAction = ({
  ctx,
  input,
}: Call) =>
  organizationAdminAction({
    input,
    schema: organizationSecurityDomainCreateInputSchema,
    outputSchema: organizationSecurityDomainCreateOutputSchema,
    action: "organization.settings.update",
    ctx,
    audit: true,
    failureMessage: "Check the domain hostname.",
    scope: (_parsed, current) => ({
      ...current,
      payload: { surface: "organization_domain", changedFields: ["hostname"] },
    }),
    handler: (parsed) =>
      organizationSecurityDomainCreateService(ctx, parsed.hostname),
  });
const organizationSecurityDomainVerifyControllerAction = ({
  ctx,
  input,
}: Call) =>
  organizationAdminAction({
    input,
    schema: organizationSecurityDomainIdInputSchema,
    outputSchema: organizationSecurityDomainVerifyOutputSchema,
    action: "organization.settings.update",
    ctx,
    audit: true,
    failureMessage: "Check the domain.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.domainId,
      payload: { surface: "organization_domain", changedFields: ["state"] },
    }),
    handler: (parsed) =>
      organizationSecurityDomainVerifyService(ctx, parsed.domainId),
  });
const organizationSecurityDomainRevokeControllerAction = ({
  ctx,
  input,
}: Call) =>
  organizationAdminAction({
    input,
    schema: organizationSecurityDomainIdInputSchema,
    outputSchema: organizationSecurityDomainMutationOutputSchema,
    action: "organization.settings.update",
    ctx,
    audit: true,
    failureMessage: "Check the domain.",
    scope: (parsed, current) => ({
      ...current,
      entityId: parsed.domainId,
      payload: { surface: "organization_domain", changedFields: ["state"] },
    }),
    handler: (parsed) =>
      organizationSecurityDomainRevokeService(ctx, parsed.domainId),
  });

export async function organizationSecurityDomainListController(
  input: Parameters<typeof organizationSecurityDomainListControllerAction>[0],
) {
  const response = await organizationSecurityDomainListControllerAction(input);
  return serviceResponseSchema(
    organizationSecurityDomainListOutputSchema,
  ).parse(response);
}

export async function organizationSecurityDomainCreateController(
  input: Parameters<typeof organizationSecurityDomainCreateControllerAction>[0],
) {
  const response =
    await organizationSecurityDomainCreateControllerAction(input);
  return serviceResponseSchema(
    organizationSecurityDomainCreateOutputSchema,
  ).parse(response);
}

export async function organizationSecurityDomainVerifyController(
  input: Parameters<typeof organizationSecurityDomainVerifyControllerAction>[0],
) {
  const response =
    await organizationSecurityDomainVerifyControllerAction(input);
  return serviceResponseSchema(
    organizationSecurityDomainVerifyOutputSchema,
  ).parse(response);
}

export async function organizationSecurityDomainRevokeController(
  input: Parameters<typeof organizationSecurityDomainRevokeControllerAction>[0],
) {
  const response =
    await organizationSecurityDomainRevokeControllerAction(input);
  return serviceResponseSchema(
    organizationSecurityDomainMutationOutputSchema,
  ).parse(response);
}
