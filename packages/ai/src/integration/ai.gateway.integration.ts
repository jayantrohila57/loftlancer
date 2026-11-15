import { generateText } from "ai"
import type {
  GatewayTextInput,
  GatewayTextResult,
} from "../types/ai.gateway.types"

/** Server-side primitive. Callers must authorize and meter each request. */
export async function generateGatewayText(
  input: GatewayTextInput
): Promise<GatewayTextResult> {
  if (!input.model.trim() || !input.prompt.trim()) {
    throw new Error("A model and prompt are required")
  }
  if (
    !Number.isSafeInteger(input.maxOutputTokens) ||
    input.maxOutputTokens < 1
  ) {
    throw new Error("A positive output token limit is required")
  }

  const result = await generateText({
    model: input.model,
    prompt: input.prompt,
    maxOutputTokens: input.maxOutputTokens,
    ...(input.abortSignal ? { abortSignal: input.abortSignal } : {}),
  })
  return {
    text: result.text,
    inputTokens: result.usage.inputTokens,
    outputTokens: result.usage.outputTokens,
  }
}
