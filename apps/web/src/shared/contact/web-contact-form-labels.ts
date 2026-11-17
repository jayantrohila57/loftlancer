import type { WebContactTopic } from "@/shared/contact/web-contact.schema"

export type WebContactFormLabels = {
  readonly consent: string
  readonly email: string
  readonly error: {
    readonly rateLimited: string
    readonly sendFailed: string
    readonly validation: string
  }
  readonly message: string
  readonly name: string
  readonly submit: string
  readonly success: string
  readonly topic: string
  readonly topicOptions: Record<WebContactTopic, string>
}
