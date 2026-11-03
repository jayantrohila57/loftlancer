import { and, eq } from "drizzle-orm";

import { db } from "../core/drizzle.client";
import { user } from "../schema/better-auth";
import { environment, project } from "../schema/projects";
import { seedE2eDemoVariables } from "./drizzle.e2e-demo-variables";
import {
  activeEnvironmentWhere,
  activeProjectWhere,
  activeUserWhere,
} from "./drizzle.soft-delete";

const E2E_EMAIL = "e2e-playwright@loftlancer.local";
const E2E_PROJECT_SLUG = "e2e-demo-project";
const E2E_ENV_SLUG = "development";

/** @deprecated Prefer `ensureE2eDemoProject`, which also seeds variables. */
export async function ensureE2eDemoVariable() {
  const [userRow] = await db
    .select({ id: user.id })
    .from(user)
    .where(activeUserWhere(eq(user.email, E2E_EMAIL)))
    .limit(1);

  if (!userRow) {
    return;
  }

  const [projectRow] = await db
    .select({ id: project.id })
    .from(project)
    .where(
      activeProjectWhere(
        and(eq(project.userId, userRow.id), eq(project.slug, E2E_PROJECT_SLUG)),
      ),
    )
    .limit(1);

  if (!projectRow) {
    return;
  }

  const [envRow] = await db
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
    return;
  }

  await seedE2eDemoVariables(envRow.id, userRow.id);
}
