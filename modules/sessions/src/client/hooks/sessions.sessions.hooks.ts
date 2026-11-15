"use client"
import { useSessions } from "./sessions.hook.list"
import { useRevokeSession } from "./sessions.hook.revoke"
import { useRevokeOtherSessions } from "./sessions.hook.revoke-other"
export const useSessionsApi = {
  useList: useSessions,
  useRevoke: useRevokeSession,
  useRevokeOthers: useRevokeOtherSessions,
}
export const securityApi = {
  useSessions,
  useRevokeOtherSessions,
  useRevokeSession,
}
