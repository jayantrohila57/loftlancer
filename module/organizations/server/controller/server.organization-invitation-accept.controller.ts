import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationInvitationAcceptInputSchema,
  organizationInvitationAcceptOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationInvitationAcceptService } from "../service/server.organization-invitation-accept.service";

async function acceptInvitation({
  input,
  ctx,
  emailVerified,
  invitationType,
}: {
  input?: unknown;
  ctx: RunActionContext;
  emailVerified: boolean;
  invitationType?: "team" | "project";
}) {
  const parsed = organizationInvitationAcceptInputSchema.safeParse(input);
  const scoped = {
    ...ctx,
    targetUserId: ctx.userId,
    ...(parsed.success ? { entityId: parsed.data.invitationId } : {}),
  };
  const response = await runAction({
    action: "invitation.accept",
    ctx: scoped,
    audit: true,
    validate: (result) =>
      serviceResponseSchema(organizationInvitationAcceptOutputSchema).parse(
        result,
      ),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the invitation details.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      if (!emailVerified)
        return {
          kind: "failed" as const,
          message: "Verify your email before accepting this invitation.",
        };
      const outcome = await organizationInvitationAcceptService(
        ctx,
        parsed.data,
        {
          invitationType,
        },
      );
      if (
        outcome.kind === "success" &&
        outcome.data &&
        !Array.isArray(outcome.data)
      )
        scoped.orgId = outcome.data.organizationId;
      return outcome;
    },
  });
  return serviceResponseSchema(organizationInvitationAcceptOutputSchema).parse(
    response,
  );
}

export function organizationTeamInvitationAcceptController(input: {
  input?: unknown;
  ctx: RunActionContext;
  emailVerified: boolean;
}) {
  return acceptInvitation({ ...input, invitationType: "team" });
}

export function organizationProjectInvitationAcceptController(input: {
  input?: unknown;
  ctx: RunActionContext;
  emailVerified: boolean;
}) {
  return acceptInvitation({ ...input, invitationType: "project" });
}

export function organizationInvitationAcceptController(input: {
  input?: unknown;
  ctx: RunActionContext;
  emailVerified: boolean;
}) {
  return acceptInvitation(input);
}
