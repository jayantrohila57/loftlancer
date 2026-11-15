import type { BetterAuthDatabaseHooks as DatabaseHooks } from "@packages/better-auth"

type HookPhase<T> = {
  before?: T
  after?: T
}

type HookResult = false | undefined | { data: unknown }

type HookCallback<T extends unknown[]> = (
  ...args: T
) => Promise<HookResult | unknown>

function isDataResult(result: unknown): result is { data: unknown } {
  return typeof result === "object" && result !== null && "data" in result
}

function chainHooks<T extends unknown[]>(
  hooks: Array<HookCallback<T> | undefined>
): (...args: T) => Promise<HookResult> {
  return async (...args: T) => {
    for (const hook of hooks) {
      if (!hook) continue
      const result = await hook(...args)
      if (result === false) return false
      if (isDataResult(result)) return result
    }
  }
}

function mergeHookPhase<T extends unknown[]>(
  phases: Array<HookPhase<HookCallback<T>>>
): HookPhase<(...args: T) => Promise<HookResult>> | undefined {
  const beforeHooks = phases
    .map((phase) => phase.before)
    .filter((hook): hook is NonNullable<typeof hook> => Boolean(hook))
  const afterHooks = phases
    .map((phase) => phase.after)
    .filter((hook): hook is NonNullable<typeof hook> => Boolean(hook))
  if (!beforeHooks.length && !afterHooks.length) return undefined
  return {
    ...(beforeHooks.length ? { before: chainHooks(beforeHooks) } : {}),
    ...(afterHooks.length ? { after: chainHooks(afterHooks) } : {}),
  }
}

function mergeHookResource<T extends unknown[]>(
  resources: Array<Record<string, HookPhase<HookCallback<T>>>>
) {
  const keys = new Set(
    resources.flatMap((resource) => Object.keys(resource ?? {}))
  )
  const merged: Record<
    string,
    HookPhase<(...args: T) => Promise<HookResult>>
  > = {}
  for (const key of keys) {
    const phase = mergeHookPhase(
      resources.map((resource) => resource[key] ?? {})
    )
    if (phase) merged[key] = phase
  }
  return Object.keys(merged).length > 0 ? merged : undefined
}

export function mergeDatabaseHooks(
  ...hookSets: DatabaseHooks[]
): DatabaseHooks {
  const users = mergeHookResource(hookSets.map((hooks) => hooks.user ?? {}))
  const sessions = mergeHookResource(
    hookSets.map((hooks) => hooks.session ?? {})
  )
  const accounts = mergeHookResource(
    hookSets.map((hooks) => hooks.account ?? {})
  )
  return {
    ...(users ? { user: users } : {}),
    ...(sessions ? { session: sessions } : {}),
    ...(accounts ? { account: accounts } : {}),
  }
}
