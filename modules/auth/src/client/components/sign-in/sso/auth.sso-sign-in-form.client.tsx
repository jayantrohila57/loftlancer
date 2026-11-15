"use client"

import { authSignInLayout } from "../auth.sign-in-layout"
import { AuthSsoDomainHint } from "./auth.sso-domain-hint.client"
import { AuthSsoEmailInput } from "./auth.sso-email-input.client"
import {
  AuthSsoSignInProvider,
  useAuthSsoSignInContext,
} from "./auth.sso-sign-in.context.client"
import { AuthSsoSubmitButton } from "./auth.sso-submit-button.client"

function AuthSsoSignInFormFields() {
  const { onSubmit } = useAuthSsoSignInContext()

  return (
    <form className={authSignInLayout.magicLink.form} onSubmit={onSubmit}>
      <AuthSsoEmailInput />
      <AuthSsoDomainHint />
      <AuthSsoSubmitButton />
    </form>
  )
}

export function AuthSsoSignInForm() {
  return (
    <AuthSsoSignInProvider>
      <AuthSsoSignInFormFields />
    </AuthSsoSignInProvider>
  )
}
