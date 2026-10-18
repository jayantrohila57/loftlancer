import { and, eq, isNull } from "drizzle-orm";

import { db } from "./client";
import { seedE2eDemoVariables } from "./e2e-demo-variables";
import { session, user } from "./schema/auth";
import { member, organization } from "./schema/organization";
import { environment, project } from "./schema/projects";
import {
  activeEnvironmentWhere,
  activeMemberWhere,
  activeProjectWhere,
  activeUserWhere,
} from "./soft-delete";

const E2E_EMAIL = "e2e-playwright@loftlancer.local";
export const E2E_PROJECT_NAME = "E2E Demo Project";
const E2E_PROJECT_SLUG = "e2e-demo-project";
const E2E_ENV_NAME = "Development";
const E2E_ENV_SLUG = "development";

function personalOrgSlugForUser(userId: string, name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  return `${base || "workspace"}-personal-${suffix}`.slice(0, 255);
}

async function ensureE2ePersonalOrganization(
  userId: string,
  name: string,
): Promise<string> {
  const [existingMember] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(activeMemberWhere(eq(member.userId, userId)))
    .limit(1);

  if (existingMember?.organizationId) {
    return existingMember.organizationId;
  }

  const organizationId = crypto.randomUUID();
  const orgName = `${name.split(" ")[0] || "My"}'s Workspace`;
  await db.insert(organization).values({
    id: organizationId,
    name: orgName,
    slug: personalOrgSlugForUser(userId, name),
    metadata: JSON.stringify({ type: "personal", e2e: true }),
  });
  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId,
    userId,
    role: "owner",
  });
  return organizationId;
}

/** Idempotent Playwright demo workspace: personal org, project, env, and variables. */
export async function ensureE2eDemoProject(): Promise<string | undefined> {
  const [userRow] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(activeUserWhere(eq(user.email, E2E_EMAIL)))
    .limit(1);

  if (!userRow) {
    return undefined;
  }

  const organizationId = await ensureE2ePersonalOrganization(
    userRow.id,
    userRow.name,
  );

  await db
    .update(project)
    .set({ organizationId })
    .where(and(eq(project.userId, userRow.id), isNull(project.organizationId)));

  let [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      activeProjectWhere(
        and(eq(project.userId, userRow.id), eq(project.slug, E2E_PROJECT_SLUG)),
      ),
    )
    .limit(1);

  const demoUrls = {
    repositoryUrl: "https://github.com/collidr/e2e-demo",
    websiteUrl: "https://example.com/e2e-demo",
  };

  if (!projectRow) {
    const projectId = crypto.randomUUID();
    await db.insert(project).values({
      id: projectId,
      name: E2E_PROJECT_NAME,
      slug: E2E_PROJECT_SLUG,
      description: "Seeded for Playwright local verification.",
      userId: userRow.id,
      organizationId,
      ...demoUrls,
    });
    projectRow = { id: projectId };
  } else {
    await db
      .update(project)
      .set({ ...demoUrls, organizationId })
      .where(eq(project.id, projectRow.id));
  }

  let [envRow] = await db
    .select({ id: environment.id })
    .from(environment)
    .where(
      activeEnvironmentWhere(
        and(
          eq(environment.projectId, projectRow.id),
          eq(environment.slug, E2E_ENV_SLUG),
        ),
      ),
    )
    .limit(1);

  if (!envRow) {
    const envId = crypto.randomUUID();
    await db.insert(environment).values({
      id: envId,
      name: E2E_ENV_NAME,
      slug: E2E_ENV_SLUG,
      projectId: projectRow.id,
    });
    envRow = { id: envId };
  }

  await seedE2eDemoVariables(envRow.id, userRow.id);

  await db
    .update(session)
    .set({ activeOrganizationId: organizationId })
    .where(eq(session.userId, userRow.id));

  return organizationId;
}
