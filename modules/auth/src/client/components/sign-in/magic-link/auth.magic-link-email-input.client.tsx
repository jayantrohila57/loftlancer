"use client"

import { Field, FieldLabel } from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"
import { useTranslations } from "next-intl"

import { authSignInLayout } from "../auth.sign-in-layout"
import { useAuthMagicLinkSignInContext } from "./auth.magic-link-sign-in.context.client"

export function AuthMagicLinkEmailInput() {
  const t = useTranslations("ui")

  const { email, pending, setEmail } = useAuthMagicLinkSignInContext()

  return (
    <Field className={authSignInLayout.magicLink.field}>
      <FieldLabel htmlFor="auth-magic-link-email">{t("email")}</FieldLabel>
      <Input
        autoComplete="email"
        disabled={pending}
        id="auth-magic-link-email"
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        required
        size="lg"
        type="email"
        value={email}
      />
    </Field>
  )
}
