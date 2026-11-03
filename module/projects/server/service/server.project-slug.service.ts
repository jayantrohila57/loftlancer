import { activeProjectWhere, db } from "@loftlancer/drizzle";
import { project } from "@loftlancer/drizzle/schema/projects";
import { isReservedProjectSlug } from "@loftlancer/t3-env/reserved-slugs";
import { and, eq, isNull } from "drizzle-orm";

export function slugifyProjectName(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug;
}

export function buildProjectSlugFromName(name: string): string {
  const slug = slugifyProjectName(name.trim());
  if (slug.length > 0) {
    return slug.slice(0, 255);
  }
  return `project-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}

/**
 * First free slug in this org (#301). Reserved route words (settings,
 * projects, …) get a suffix so /[org]/[project] never shadows an org page.
 */
export async function ensureUniqueProjectSlug(
  baseSlug: string,
  organizationId: string | null,
  excludeProjectId?: string,
): Promise<string> {
  const base = isReservedProjectSlug(baseSlug)
    ? `${baseSlug}-project`
    : baseSlug;
  let candidate = base.slice(0, 255);
  let suffix = 1;

  while (suffix < 10_000) {
    const existing = await db
      .select({ id: project.id })
      .from(project)
      .where(
        activeProjectWhere(
          and(
            eq(project.slug, candidate),
            organizationId
              ? eq(project.organizationId, organizationId)
              : isNull(project.organizationId),
          ),
        ),
      )
      .limit(1);

    const taken = existing[0];
    if (!taken || (excludeProjectId && taken.id === excludeProjectId)) {
      return candidate;
    }

    const suffixStr = `-${suffix}`;
    const trimmedBase = base.slice(0, Math.max(1, 255 - suffixStr.length));
    candidate = `${trimmedBase}${suffixStr}`;
    suffix += 1;
  }

  return `project-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
}
