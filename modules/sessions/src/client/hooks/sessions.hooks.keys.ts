export const sessionKey = (userId: string | undefined) =>
  ["security", "sessions", userId] as const
