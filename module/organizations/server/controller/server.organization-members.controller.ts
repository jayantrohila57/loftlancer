import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationMembersInputSchema,
  organizationMembersOutputSchema,
} from "../../utils/validation/utils.organization-members.validation";
import { organizationMembersService } from "../service/server.organization-members.service";

export async function organizationMembersController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationMembersInputSchema.safeParse(input);
  const response = await runAction({
    action: "member.list",
    ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(organizationMembersOutputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Unable to load organization members.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        };
      return organizationMembersService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationMembersOutputSchema).parse(response);
}
