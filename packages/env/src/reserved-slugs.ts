/**
 * Route words that org / project slugs may not take (#299, #301): studio
 * URLs are /[org]/[project], so a slug must never shadow a static segment.
 * Shared by the route builder (ui) and slug validation (api, auth).
 */

/** Top-level studio segments an org slug may not use. */
export const RESERVED_ORG_SLUGS = [
  "new",
  "invitations",
  "notifications",
  "activity",
  "support",
  "onboarding",
  "settings",
  "account",
  "api",
  "sign-in",
  "sign-up",
  "sign-out",
  "forbidden",
  "dashboard",
  "p",
  "apps",
  "help",
  "admin",
  "studio",
  "auth",
  "docs",
  "_next",
  "sentry-test",
] as const;

/** Org-level segments a project slug may not use. */
export const RESERVED_PROJECT_SLUGS = [
  "new",
  "projects",
  "teams",
  "members",
  "invitations",
  "roles",
  "settings",
  "activity",
  "apps",
  "overview",
] as const;

export function isReservedOrgSlug(slug: string): boolean {
  return (RESERVED_ORG_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

/** Slugs reserved for new organizations, including the legacy directory collision. */
export function isReservedOrgSlugForCreation(slug: string): boolean {
  return slug.toLowerCase() === "organizations" || isReservedOrgSlug(slug);
}

export function isReservedProjectSlug(slug: string): boolean {
  return (RESERVED_PROJECT_SLUGS as readonly string[]).includes(
    slug.toLowerCase(),
  );
}
