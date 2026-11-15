export interface GatewayTextInput {
  readonly model: string
  readonly prompt: string
  readonly maxOutputTokens: number
  readonly abortSignal?: AbortSignal
}

export interface GatewayTextResult {
  readonly text: string
  readonly inputTokens: number | undefined
  readonly outputTokens: number | undefined
}
