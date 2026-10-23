import { count, eq } from "drizzle-orm";
import { db } from "./client";
import { member } from "./schema/organization";
import { project } from "./schema/projects";
import { activeMemberWhere, activeProjectWhere } from "./soft-delete";

function parseMetadata(
  metadata: string | Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function assertOrganizationCanBeDeleted(
  org: {
    id: string;
    slug: string;
    metadata?: string | Record<string, unknown> | null;
  },
  userId: string,
): Promise<void> {
  const meta = parseMetadata(org.metadata ?? null);
  if (meta.type === "personal") {
    throw new Error(
      "Your personal organization cannot be deleted. Create another organization first if you need a separate team space.",
    );
  }

  const membershipRows = await db
    .select({ value: count() })
    .from(member)
    .where(activeMemberWhere(eq(member.userId, userId)));
  const membershipCount = membershipRows[0]?.value ?? 0;

  if (membershipCount <= 1) {
    throw new Error(
      "You cannot delete your only organization. Create another one first or leave this organization after joining another.",
    );
  }

  const projectRows = await db
    .select({ value: count() })
    .from(project)
    .where(activeProjectWhere(eq(project.organizationId, org.id)));
  const projectCount = projectRows[0]?.value ?? 0;

  if (projectCount > 0) {
    throw new Error(
      "This organization still has projects. Move or delete them before deleting the organization.",
    );
  }
}
