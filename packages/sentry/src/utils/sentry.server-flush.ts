import { vercelWaitUntil } from "@sentry/core/server"
import type { FlushableSentry } from "../types/sentry.types"

export type { FlushableSentry }

export function createCoalescedServerFlush(
  flush: (timeout?: number) => Promise<boolean>,
  waitUntil: (task: Promise<unknown>) => void = vercelWaitUntil
): () => void {
  let scheduled = false
  return () => {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      waitUntil(flush(2000))
    })
  }
}

const flushByClient = new WeakMap<
  FlushableSentry,
  ReturnType<typeof createCoalescedServerFlush>
>()

export function coalescedServerLogFlush(sentry: FlushableSentry): void {
  if (!sentry.flush) return
  let schedule = flushByClient.get(sentry)
  if (!schedule) {
    schedule = createCoalescedServerFlush(sentry.flush.bind(sentry))
    flushByClient.set(sentry, schedule)
  }
  schedule()
}
