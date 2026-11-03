import type { RunActionContext } from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationLogoInputSchema,
  organizationProfilePatchSchema,
  organizationSettingsInputSchema,
  organizationSettingsMutationOutputSchema,
  organizationSettingsOutputSchema,
  organizationSettingsPatchSchema,
} from "../../utils/validation/utils.organization-admin.validation";
import {
  organizationLogoUpdateService,
  organizationProfileUpdateService,
  organizationSettingsGetService,
  organizationSettingsUpdateService,
} from "../service/server.organization-settings.service";
import { organizationAdminAction } from "./server.organization-admin-action";

const organizationSettingsGetControllerAction = ({
  ctx,
  input,
}: {
  ctx: RunActionContext;
  input?: unknown;
}) =>
  organizationAdminAction({
    input: input ?? {},
    schema: organizationSettingsInputSchema,
    outputSchema: organizationSettingsOutputSchema,
    action: "organization.settings.view",
    ctx,
    audit: false,
    failureMessage: "Unable to load organization settings.",
    handler: () => organizationSettingsGetService(ctx),
  });
const organizationSettingsUpdateControllerAction = ({
  ctx,
  input,
}: {
  ctx: RunActionContext;
  input: unknown;
}) =>
  organizationAdminAction({
    input,
    schema: organizationSettingsPatchSchema,
    outputSchema: organizationSettingsMutationOutputSchema,
    action: "organization.settings.update",
    ctx,
    audit: true,
    failureMessage: "Check the organization settings.",
    scope: (parsed, current) => ({
      ...current,
      payload: {
        surface: "organization_settings",
        changedFields: Object.keys(parsed).sort(),
      },
    }),
    handler: (parsed) => organizationSettingsUpdateService(ctx, parsed),
  });
const organizationProfileUpdateControllerAction = ({
  ctx,
  input,
}: {
  ctx: RunActionContext;
  input: unknown;
}) =>
  organizationAdminAction({
    input,
    schema: organizationProfilePatchSchema,
    outputSchema: organizationSettingsMutationOutputSchema,
    action: "organization.settings.update",
    ctx,
    audit: true,
    failureMessage: "Check the organization profile.",
    scope: (parsed, current) => ({
      ...current,
      payload: {
        surface: "organization_profile",
        changedFields: Object.keys(parsed).sort(),
      },
    }),
    handler: (parsed) => organizationProfileUpdateService(ctx, parsed),
  });
const organizationLogoUpdateControllerAction = ({
  ctx,
  input,
}: {
  ctx: RunActionContext;
  input: unknown;
}) =>
  organizationAdminAction({
    input,
    schema: organizationLogoInputSchema,
    outputSchema: organizationSettingsMutationOutputSchema,
    action: "organization.settings.update",
    ctx,
    audit: true,
    failureMessage: "Check the organization logo.",
    scope: (_parsed, current) => ({
      ...current,
      payload: { surface: "organization_branding", changedFields: ["logo"] },
    }),
    handler: (parsed) => organizationLogoUpdateService(ctx, parsed.logo),
  });

export async function organizationSettingsGetController(
  input: Parameters<typeof organizationSettingsGetControllerAction>[0],
) {
  const response = await organizationSettingsGetControllerAction(input);
  return serviceResponseSchema(organizationSettingsOutputSchema).parse(
    response,
  );
}

export async function organizationSettingsUpdateController(
  input: Parameters<typeof organizationSettingsUpdateControllerAction>[0],
) {
  const response = await organizationSettingsUpdateControllerAction(input);
  return serviceResponseSchema(organizationSettingsMutationOutputSchema).parse(
    response,
  );
}

export async function organizationProfileUpdateController(
  input: Parameters<typeof organizationProfileUpdateControllerAction>[0],
) {
  const response = await organizationProfileUpdateControllerAction(input);
  return serviceResponseSchema(organizationSettingsMutationOutputSchema).parse(
    response,
  );
}

export async function organizationLogoUpdateController(
  input: Parameters<typeof organizationLogoUpdateControllerAction>[0],
) {
  const response = await organizationLogoUpdateControllerAction(input);
  return serviceResponseSchema(organizationSettingsMutationOutputSchema).parse(
    response,
  );
}
