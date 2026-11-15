"use client"

import { Field, FieldLabel } from "@packages/ui/components/field"
import { Input } from "@packages/ui/components/input"
import { useTranslations } from "next-intl"

import { authSignInLayout } from "../auth.sign-in-layout"
import { useAuthSsoSignInContext } from "./auth.sso-sign-in.context.client"

export function AuthSsoEmailInput() {
  const t = useTranslations("ui")
  const { email, pending, setEmail } = useAuthSsoSignInContext()

  return (
    <Field className={authSignInLayout.magicLink.field}>
      <FieldLabel>{t("workEmail")}</FieldLabel>
      <Input
        autoComplete="email"
        disabled={pending}
        name="email"
        onChange={(event) => setEmail(event.target.value)}
        placeholder={t("workEmailPlaceholder")}
        required
        size="lg"
        type="email"
        value={email}
      />
    </Field>
  )
}
