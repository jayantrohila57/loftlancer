import type { ActionName } from "@features/authorization/utils";
import {
  type RunActionContext,
  runAction,
} from "@module/shared/server/run-action";
import type { ServiceOutcome } from "@module/shared/utils/types/utils.service-outcome.types";
import { serviceResponseSchema } from "@module/shared/utils/validation/utils.service-response.validation";
import { toServiceFieldErrors } from "@module/shared/utils/validation/utils.zod-field-errors.validation";
import type { z } from "zod";

export async function organizationAdminAction<I, O>(input: {
  input: unknown;
  schema: z.ZodType<I>;
  outputSchema: z.ZodType<O>;
  action: ActionName;
  ctx: RunActionContext;
  audit: boolean;
  failureMessage: string;
  scope?: (parsed: I, ctx: RunActionContext) => RunActionContext;
  handler: (parsed: I) => Promise<ServiceOutcome<O>>;
}): Promise<unknown> {
  const parsed = input.schema.safeParse(input.input);
  const ctx =
    parsed.success && input.scope
      ? input.scope(parsed.data, input.ctx)
      : input.ctx;
  const response = await runAction({
    action: input.action,
    ctx,
    audit: input.audit,
    validate: (result) =>
      serviceResponseSchema(input.outputSchema).parse(result),
    handler: async () => {
      if (!parsed.success)
        return {
          kind: "failed" as const,
          message: input.failureMessage,
          fieldErrors: toServiceFieldErrors(parsed.error),
        };
      return input.handler(parsed.data);
    },
  });
  return serviceResponseSchema(input.outputSchema).parse(response);
}
