import {
  RESERVED_ORG_SLUGS,
  RESERVED_PROJECT_SLUGS,
} from "../constants/t3-env.reserved-slugs.constants";

export {
  RESERVED_ORG_SLUGS,
  RESERVED_PROJECT_SLUGS,
} from "../constants/t3-env.reserved-slugs.constants";

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
