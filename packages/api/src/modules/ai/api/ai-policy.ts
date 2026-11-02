import { z } from "zod/v3";

export const DEFAULT_AI_MODELS: string[] = ["openai/gpt-4.1-mini"];
export const DEFAULT_MONTHLY_TOKEN_LIMIT = 100_000;

const modelIdSchema = z
  .string()
  .trim()
  .regex(
    /^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/i,
    "Use a gateway model id such as openai/gpt-4.1-mini.",
  );

export const aiPolicyPatchSchema = z.object({
  allowedModels: z.array(modelIdSchema).min(1).max(20),
  monthlyTokenLimit: z.number().int().min(0).max(100_000_000),
});

export type AiPolicyPatch = z.infer<typeof aiPolicyPatchSchema>;

export function normalizeTokenCount(value: number | undefined): number {
  return value !== undefined && Number.isSafeInteger(value) && value > 0
    ? value
    : 0;
}
