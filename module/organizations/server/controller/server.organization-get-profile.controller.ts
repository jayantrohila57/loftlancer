import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationGetProfileInputSchema,
  organizationGetProfileOutputSchema,
} from "../../utils/validation/utils.organization-get-profile.validation";
import { organizationGetProfileService } from "../service/server.organization-get-profile.service";

export async function organizationGetProfileController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationGetProfileInputSchema.safeParse(input);
  const response = await runAction({
    action: "organization.settings.view",
    ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(organizationGetProfileOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Unable to load organization profile.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return organizationGetProfileService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationGetProfileOutputSchema).parse(
    response,
  );
}
