"use client"

import { FormKit } from "@features/form"
import { Button } from "@packages/ui/components/button"
import { useActionState } from "react"
import type { WebContactActionState } from "@/shared/contact/web-contact.action"
import {
  submitWebContactForm,
  webContactActionInitialState,
} from "@/shared/contact/web-contact.action"
import type { WebContactFormValues } from "@/shared/contact/web-contact.schema"
import {
  webContactFormSchema,
  webContactTopicValues,
} from "@/shared/contact/web-contact.schema"
import type { WebContactFormLabels } from "@/shared/contact/web-contact-form-labels"

export interface WebContactFormProps {
  readonly labels: WebContactFormLabels
}

function errorMessage(
  state: WebContactActionState,
  labels: WebContactFormLabels
): string | null {
  if (state.status !== "error") {
    return null
  }
  if (state.code === "validation") {
    return labels.error.validation
  }
  if (state.code === "rateLimited") {
    return labels.error.rateLimited
  }
  return labels.error.sendFailed
}

export function WebContactForm({ labels }: WebContactFormProps) {
  const [state, formAction, pending] = useActionState(
    submitWebContactForm,
    webContactActionInitialState
  )

  const topicOptions = webContactTopicValues.map((value) => ({
    value,
    label: labels.topicOptions[value],
  }))

  return (
    <FormKit<WebContactFormValues>
      defaultValues={{
        name: "",
        email: "",
        topic: "support",
        message: "",
        consent: false,
        companyWebsite: "",
      }}
      onSubmit={async (values) => {
        const formData = new FormData()
        formData.set("name", values.name)
        formData.set("email", values.email)
        formData.set("topic", values.topic)
        formData.set("message", values.message)
        if (values.consent) {
          formData.set("consent", "on")
        }
        formData.set("companyWebsite", values.companyWebsite ?? "")
        await formAction(formData)
      }}
      schema={webContactFormSchema}
      variant="embedded"
    >
      {state.status === "success" ? (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
          {labels.success}
        </p>
      ) : null}
      {errorMessage(state, labels) ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage(state, labels)}
        </p>
      ) : null}
      <input
        aria-hidden
        autoComplete="off"
        className="hidden"
        defaultValue=""
        name="companyWebsite"
        tabIndex={-1}
        type="text"
      />
      <FormKit.Field label={labels.name} name="name" required type="text" />
      <FormKit.Field label={labels.email} name="email" required type="email" />
      <FormKit.Field
        label={labels.topic}
        name="topic"
        options={topicOptions}
        required
        type="select"
      />
      <FormKit.Field
        label={labels.message}
        name="message"
        required
        type="textarea"
      />
      <FormKit.Field
        label={labels.consent}
        name="consent"
        required
        type="checkbox"
      />
      <FormKit.Actions>
        <Button disabled={pending} type="submit">
          {labels.submit}
        </Button>
      </FormKit.Actions>
    </FormKit>
  )
}
