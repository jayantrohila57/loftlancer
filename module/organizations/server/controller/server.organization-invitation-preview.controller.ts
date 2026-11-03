import {
  mapOutcomeToResponse,
  serviceResponseSchema,
} from "@module/shared/utils/validation/utils.service-response.validation";
import {
  organizationInvitationPreviewInputSchema,
  organizationInvitationPreviewOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationInvitationPreviewService } from "../service/server.organization-invitation-preview.service";

export async function organizationInvitationPreviewController({
  input,
}: {
  input?: unknown;
}) {
  const parsed = organizationInvitationPreviewInputSchema.safeParse(input);
  const response = mapOutcomeToResponse(
    parsed.success
      ? await organizationInvitationPreviewService(parsed.data)
      : {
          kind: "failed" as const,
          message: "Check the invitation details.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
  );
  return serviceResponseSchema(organizationInvitationPreviewOutputSchema).parse(
    response,
  );
}
