/**
 * Run AFTER 0004_organizations.sql on the target database.
 *
 *   DATABASE_URL=... pnpm exec tsx packages/drizzle/scripts/backfill-personal-orgs.ts
 */
import { db } from "@loftlancer/drizzle";
import { user } from "@loftlancer/drizzle/schema/auth";
import { member, organization } from "@loftlancer/drizzle/schema/organization";
import { project } from "@loftlancer/drizzle/schema/projects";
import { eq, sql } from "drizzle-orm";

function slugifyPersonal(userId: string, name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  return `${base || "workspace"}-personal-${suffix}`.slice(0, 255);
}

async function main() {
  const users = await db.select({ id: user.id, name: user.name }).from(user);

  for (const u of users) {
    const owned = await db
      .select({ id: project.id })
      .from(project)
      .where(eq(project.userId, u.id));

    if (owned.length === 0) {
      continue;
    }

    const orgName = `${u.name.split(" ")[0] || "My"}'s Workspace`;
    const orgId = crypto.randomUUID();
    const orgSlug = slugifyPersonal(u.id, u.name);

    const existingMember = await db
      .select({ organizationId: member.organizationId })
      .from(member)
      .where(eq(member.userId, u.id))
      .limit(1);

    let organizationId = existingMember[0]?.organizationId;

    if (!organizationId) {
      await db.insert(organization).values({
        id: orgId,
        name: orgName,
        slug: orgSlug,
        logo: null,
        metadata: JSON.stringify({ type: "personal", backfill: true }),
      });

      await db.insert(member).values({
        id: crypto.randomUUID(),
        organizationId: orgId,
        userId: u.id,
        role: "owner",
      });

      organizationId = orgId;
      console.log(`Created org ${orgSlug} for user ${u.id}`);
    }

    await db.execute(sql`
      UPDATE project
      SET organization_id = ${organizationId}
      WHERE user_id = ${u.id}
        AND organization_id IS NULL
    `);

    console.log(
      `Linked projects to org ${organizationId} for user ${u.id} (${owned.length} owned)`,
    );
  }

  const unassigned = await db.execute(sql`
    SELECT count(*)::int AS count FROM project WHERE organization_id IS NULL
  `);

  const count =
    (unassigned.rows[0] as { count?: number } | undefined)?.count ?? 0;
  console.log(`Done. Projects without organization_id: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
