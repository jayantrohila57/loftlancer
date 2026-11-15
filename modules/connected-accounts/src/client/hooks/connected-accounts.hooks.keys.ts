export const accountsKey = (userId: string | undefined) =>
  ["security", "accounts", userId] as const

export const signInMethodsKey = (userId: string | undefined) =>
  ["security", "sign-in-methods", userId] as const
