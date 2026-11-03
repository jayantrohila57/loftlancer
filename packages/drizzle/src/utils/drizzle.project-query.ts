import { and, eq } from "drizzle-orm";

import { db } from "../core/drizzle.client";
import { project } from "../schema/projects";
import { activeProjectWhere } from "./drizzle.soft-delete";

export async function getOwnedProjectBySlug(userId: string, slug: string) {
  const rows = await db
    .select({
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
    })
    .from(project)
    .where(
      activeProjectWhere(
        and(eq(project.slug, slug), eq(project.userId, userId)),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}
