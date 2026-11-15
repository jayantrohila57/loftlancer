/** Derive a Better Auth organization slug from a display name. */
export function organizationSlugFromName(name: string): string {
  const base = name.trim().toLowerCase()
  if (!base) {
    return `org-${crypto.randomUUID().slice(0, 8)}`
  }
  const slug = base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
  return slug.length > 0 ? slug : `org-${crypto.randomUUID().slice(0, 8)}`
}
