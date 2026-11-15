"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"

import type { AuthSsoSignInState } from "../hooks/auth.sso-sign-in.client"
import { useAuthSsoSignIn } from "../hooks/auth.sso-sign-in.client"

const AuthSsoSignInContext = createContext<AuthSsoSignInState | null>(null)

export function AuthSsoSignInProvider(props: { children: ReactNode }) {
  const value = useAuthSsoSignIn()
  return (
    <AuthSsoSignInContext.Provider value={value}>
      {props.children}
    </AuthSsoSignInContext.Provider>
  )
}

export function useAuthSsoSignInContext(): AuthSsoSignInState {
  const value = useContext(AuthSsoSignInContext)
  if (!value) {
    throw new Error("AuthSsoSignInProvider is missing")
  }
  return value
}
