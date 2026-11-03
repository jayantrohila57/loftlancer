import { activeProjectWhere, db } from "@loftlancer/drizzle";
import { project } from "@loftlancer/drizzle/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq, ne, sql } from "drizzle-orm";

export async function assertUniqueProjectName(
  userId: string,
  name: string,
  excludeProjectId?: string,
): Promise<void> {
  const trimmed = name.trim();
  const conditions = [
    eq(project.userId, userId),
    sql`lower(trim(${project.name})) = lower(${trimmed})`,
  ];

  if (excludeProjectId) {
    conditions.push(ne(project.id, excludeProjectId));
  }

  const existing = await db
    .select({ id: project.id })
    .from(project)
    .where(activeProjectWhere(and(...conditions)))
    .limit(1);

  if (existing.length > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "A project with this name already exists. Try a different name.",
    });
  }
}
