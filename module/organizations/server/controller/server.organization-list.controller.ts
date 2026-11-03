import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationListInputSchema,
  organizationListOutputSchema,
} from "../../utils/validation/utils.organization-list.validation";
import { organizationListService } from "../service/server.organization-list.service";

export async function organizationListController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationListInputSchema.safeParse(input);
  const response = await runAction({
    action: "organization.list",
    ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(organizationListOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Unable to load organizations.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      return organizationListService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationListOutputSchema).parse(response);
}
