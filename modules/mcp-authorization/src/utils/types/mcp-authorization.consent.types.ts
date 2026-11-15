export interface McpAuthorizationConsentRequest {
  readonly clientId: string
  readonly scope: string
  readonly scopes: readonly string[]
  readonly code: string
  readonly claims?: string
}
