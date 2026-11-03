import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationMyInvitationsInputSchema,
  organizationMyInvitationsOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationMyInvitationsService } from "../service/server.organization-my-invitations.service";

export async function organizationMyInvitationsController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext & { email: string; emailVerified: boolean };
}) {
  const parsed = organizationMyInvitationsInputSchema.safeParse(input);
  const response = await runAction({
    action: "organization.list",
    ctx,
    audit: false,
    validate: (result) =>
      serviceResponseSchema(organizationMyInvitationsOutputSchema).parse(
        result,
      ),
    handler: async () => {
      if (!parsed.success) {
        return {
          kind: "failed" as const,
          message: "Unable to load invitations.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      }
      return organizationMyInvitationsService(ctx);
    },
  });
  return serviceResponseSchema(organizationMyInvitationsOutputSchema).parse(
    response,
  );
}
