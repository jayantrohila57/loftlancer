import { requireAction } from "@loftlancer/api/actions/require-action";
import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import {
  organizationInvitationCreateInputSchema,
  organizationInvitationCreateOutputSchema,
} from "../../utils/validation/utils.organization-invitations.validation";
import { organizationInvitationCreateService } from "../service/server.organization-invitation-create.service";

export async function organizationInvitationCreateController({
  input,
  ctx,
}: {
  input?: unknown;
  ctx: RunActionContext;
}) {
  const parsed = organizationInvitationCreateInputSchema.safeParse(input);
  const scoped = parsed.success
    ? {
        ...ctx,
        projectId: parsed.data.projectId,
        teamId: parsed.data.teamId,
        payload: {
          role: parsed.data.role,
          scope: parsed.data.projectId
            ? "project"
            : parsed.data.teamId
              ? "team"
              : "organization",
        },
      }
    : ctx;
  const response = await runAction({
    action: "member.invite",
    ctx: scoped,
    audit: true,
    authorize: async () => {
      if (!parsed.success) return;
      if (parsed.data.projectId)
        await requireAction("project.permission.grant", {
          userId: ctx.userId,
          organizationId: ctx.orgId,
          projectId: parsed.data.projectId,
          audit: false,
        });
      if (parsed.data.teamId)
        await requireAction("team.member.add", {
          userId: ctx.userId,
          organizationId: ctx.orgId,
          teamId: parsed.data.teamId,
          audit: false,
        });
    },
    validate: (result) =>
      serviceResponseSchema(organizationInvitationCreateOutputSchema).parse(
        result,
      ),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: "Check the invitation details.",
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      return organizationInvitationCreateService(ctx, parsed.data);
    },
  });
  return serviceResponseSchema(organizationInvitationCreateOutputSchema).parse(
    response,
  );
}
