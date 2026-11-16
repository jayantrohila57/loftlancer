import { AsyncLocalStorage } from "node:async_hooks"

type OrgAuthRequestContext = {
  readonly userId: string
}

const orgAuthRequestStore = new AsyncLocalStorage<OrgAuthRequestContext>()

export function runWithOrgAuthActor<T>(
  userId: string | null | undefined,
  run: () => T | Promise<T>
): T | Promise<T> {
  if (!userId) return run()
  return orgAuthRequestStore.run({ userId }, run)
}

export function readOrgAuthActorUserId(): string | null {
  return orgAuthRequestStore.getStore()?.userId ?? null
}
