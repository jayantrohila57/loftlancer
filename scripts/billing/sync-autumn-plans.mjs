/**
 * Sync Free/Paid plan features and the Paid placeholder price to Autumn sandbox.
 * Loads apps/auth/.env; never prints secret values.
 */
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const require = createRequire(resolve(root, "packages/billing/package.json"))
const { Autumn } = require("autumn-js")

function loadEnv(pathname) {
  const env = {}
  for (const line of readFileSync(pathname, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
    const eq = trimmed.indexOf("=")
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[key] = value
  }
  return env
}

const env = loadEnv(resolve(root, "apps/auth/.env"))
const secretKey = env.AUTUMN_SECRET_KEY
const serverURL = env.AUTUMN_API_BASE_URL
if (!secretKey || !serverURL) {
  console.error("AUTUMN_SECRET_KEY or AUTUMN_API_BASE_URL is missing")
  process.exit(1)
}

const client = new Autumn({
  secretKey,
  serverURL,
  xApiVersion: env.AUTUMN_X_API_VERSION ?? "2.3.0",
})

const FREE = {
  planId: env.AUTUMN_PLAN_ID_FREE ?? "free",
  items: [
    { featureId: "org_storage_bytes", included: 2_147_483_648 },
    {
      featureId: "ai_usage_credits",
      included: 0,
      reset: { interval: "month" },
    },
    { featureId: "organization_count", included: 1 },
  ],
}

const PAID = {
  planId: env.AUTUMN_PLAN_ID_PAID ?? "paid",
  price: { amount: 9, interval: "month" },
  items: [
    { featureId: "org_storage_bytes", included: 5_368_709_120 },
    {
      featureId: "ai_usage_credits",
      included: 1000,
      reset: { interval: "month" },
    },
    { featureId: "organization_count", included: 10 },
  ],
}

function summarize(plan) {
  const price = plan?.price ?? null
  return {
    id: plan?.id,
    env: plan?.env,
    version: plan?.version,
    amount: price?.amount ?? null,
    interval: price?.interval ?? null,
    display:
      price?.display?.primaryText ?? price?.display?.primary_text ?? null,
    features: (plan?.items ?? []).map((item) => ({
      featureId: item.featureId ?? item.feature_id,
      included: item.included ?? null,
      reset: item.reset?.interval ?? item.reset ?? null,
    })),
  }
}

await client.plans.update({
  planId: FREE.planId,
  items: FREE.items,
})
await client.plans.update({
  planId: PAID.planId,
  price: PAID.price,
  items: PAID.items,
})

const listed = await client.plans.list()
const byId = new Map((listed.list ?? []).map((plan) => [plan.id, plan]))
console.log("free", JSON.stringify(summarize(byId.get(FREE.planId))))
console.log("paid", JSON.stringify(summarize(byId.get(PAID.planId))))
