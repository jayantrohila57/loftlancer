"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"

import type { AuthCheckEmailState } from "./hooks/auth.check-email.client"
import { useAuthCheckEmail } from "./hooks/auth.check-email.client"

const AuthCheckEmailContext = createContext<AuthCheckEmailState | null>(null)

export function AuthCheckEmailProvider({
  children,
}: {
  readonly children: ReactNode
}) {
  const state = useAuthCheckEmail()

  return (
    <AuthCheckEmailContext.Provider value={state}>
      {children}
    </AuthCheckEmailContext.Provider>
  )
}

export function useAuthCheckEmailContext(): AuthCheckEmailState {
  const value = useContext(AuthCheckEmailContext)
  if (!value) {
    throw new Error(
      "useAuthCheckEmailContext must be used within AuthCheckEmailProvider"
    )
  }
  return value
}
