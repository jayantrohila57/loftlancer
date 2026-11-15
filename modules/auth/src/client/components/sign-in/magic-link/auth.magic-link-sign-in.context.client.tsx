"use client"

import type { FormEvent, ReactNode } from "react"
import { createContext, useContext } from "react"
import type { AuthMagicLinkSignInState } from "../hooks/auth.magic-link-sign-in.client"
import { useAuthMagicLinkSignIn } from "../hooks/auth.magic-link-sign-in.client"

const AuthMagicLinkSignInContext =
  createContext<AuthMagicLinkSignInState | null>(null)

export function AuthMagicLinkSignInProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const state = useAuthMagicLinkSignIn()

  return (
    <AuthMagicLinkSignInContext.Provider value={state}>
      {children}
    </AuthMagicLinkSignInContext.Provider>
  )
}

export function useAuthMagicLinkSignInContext(): AuthMagicLinkSignInState {
  const value = useContext(AuthMagicLinkSignInContext)
  if (!value) {
    throw new Error(
      "useAuthMagicLinkSignInContext must be used within AuthMagicLinkSignInProvider"
    )
  }
  return value
}

export type AuthMagicLinkFormSubmitHandler =
  AuthMagicLinkSignInState["onSubmit"]

export type AuthMagicLinkFormSubmitEvent = FormEvent<HTMLFormElement>
