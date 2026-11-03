import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationGetBySlugInputSchema,
  organizationGetBySlugOutputSchema,
} from "../../utils/validation/utils.organization-get-by-slug.validation";
import { organizationGetBySlugService } from "../service/server.organization-get-by-slug.service";

export async function organizationGetBySlugController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationGetBySlugInputSchema.safeParse(input);
  const response = await runAction({
    action: "organization.hub.view",
    ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(organizationGetBySlugOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the organization details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return organizationGetBySlugService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationGetBySlugOutputSchema).parse(
    response,
  );
}
