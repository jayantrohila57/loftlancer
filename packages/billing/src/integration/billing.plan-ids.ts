import { serverEnv } from "@packages/t3-env/server"
import {
  AUTUMN_DEFAULT_PLAN_ID_FREE,
  AUTUMN_DEFAULT_PLAN_ID_PAID,
} from "./billing.constants"

export function resolveAutumnPlanIdFree() {
  return serverEnv.AUTUMN_PLAN_ID_FREE ?? AUTUMN_DEFAULT_PLAN_ID_FREE
}

export function resolveAutumnPlanIdPaid() {
  return serverEnv.AUTUMN_PLAN_ID_PAID ?? AUTUMN_DEFAULT_PLAN_ID_PAID
}

export function planIdToProductTier(planId: string): "free" | "paid" {
  const paidId = resolveAutumnPlanIdPaid()
  if (planId === paidId) return "paid"
  return "free"
}
