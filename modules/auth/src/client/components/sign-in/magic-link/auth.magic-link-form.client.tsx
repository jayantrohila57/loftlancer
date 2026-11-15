"use client"

import { authSignInLayout } from "../auth.sign-in-layout"
import { AuthMagicLinkEmailInput } from "./auth.magic-link-email-input.client"
import { AuthMagicLinkSendButton } from "./auth.magic-link-send-button.client"
import {
  AuthMagicLinkSignInProvider,
  useAuthMagicLinkSignInContext,
} from "./auth.magic-link-sign-in.context.client"

function AuthMagicLinkFormFields() {
  const { onSubmit } = useAuthMagicLinkSignInContext()

  return (
    <form className={authSignInLayout.magicLink.form} onSubmit={onSubmit}>
      <AuthMagicLinkEmailInput />
      <AuthMagicLinkSendButton />
    </form>
  )
}

export function AuthMagicLinkForm() {
  return (
    <AuthMagicLinkSignInProvider>
      <AuthMagicLinkFormFields />
    </AuthMagicLinkSignInProvider>
  )
}
