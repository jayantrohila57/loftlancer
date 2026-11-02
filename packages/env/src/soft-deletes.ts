/**
 * Soft deletes are disabled by default until the combined migration adds
 * `deleted_at` / `deleted_by` columns and partial unique indexes (see docs/product.md).
 */
export function isSoftDeletesEnabled(): boolean {
  return process.env.SOFT_DELETES_ENABLED === "true";
}
