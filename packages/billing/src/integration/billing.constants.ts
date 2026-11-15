/** Slice-1 Autumn feature IDs (dashboard must match). */
export const AUTUMN_FEATURE_ORG_STORAGE_BYTES = "org_storage_bytes"
export const AUTUMN_FEATURE_AI_USAGE_CREDITS = "ai_usage_credits"
export const AUTUMN_FEATURE_ORGANIZATION_COUNT = "organization_count"

/** Default Autumn plan IDs — override via env when dashboard differs. */
export const AUTUMN_DEFAULT_PLAN_ID_FREE = "free"
export const AUTUMN_DEFAULT_PLAN_ID_PAID = "paid"

/** Included storage bytes synced to Drizzle per plan tier. */
export const BILLING_FREE_PLAN_QUOTA_BYTES = 2_147_483_648
export const BILLING_PAID_PLAN_QUOTA_BYTES = 5_368_709_120
