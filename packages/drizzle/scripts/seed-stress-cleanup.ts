/**
 * Removes every row created by seed-stress.ts (ids prefixed `seed-`) plus anything the
 * app later wrote inside the seed orgs. Never touches non-seed orgs.
 *
 *   CLEANUP_CONFIRM=yes DATABASE_URL=... SKIP_ENV_VALIDATION=1 \
 *     pnpm --filter @loftlancer/drizzle db:seed-stress:clean
 */
import { sql } from "drizzle-orm";

let db: Awaited<ReturnType<typeof getSeedDb>>;

import { getSeedDb } from "./seed-db";
import { SEED_ORGS } from "./seed-stress-config";

const ORG_IDS = SEED_ORGS.map((o) => o.id);

async function run(label: string, query: ReturnType<typeof sql>) {
  const res = await db.execute(query);
  console.log(`  ${label}: ${res.rowCount ?? 0}`);
}

async function main() {
  db = await getSeedDb();
  if (process.env.CLEANUP_CONFIRM !== "yes") {
    console.error("Refusing to run: set CLEANUP_CONFIRM=yes.");
    process.exit(1);
  }
  const orgs = sql.join(
    ORG_IDS.map((id) => sql`${id}`),
    sql`, `,
  );
  const seedProjects = sql`(select id from project where id like 'seed-%' or organization_id in (${orgs}))`;
  await run(
    "notifications",
    sql`delete from notification where id like 'seed-%' or organization_id in (${orgs})`,
  );
  await run(
    "audit events",
    sql`delete from audit_event where id like 'seed-%' or organization_id in (${orgs}) or project_id in ${seedProjects}`,
  );
  await run(
    "task comments",
    sql`delete from task_comment where task_id in (select id from task where project_id in ${seedProjects})`,
  );
  await run("tasks", sql`delete from task where project_id in ${seedProjects}`);
  await run(
    "project apps",
    sql`delete from project_app where project_id in ${seedProjects}`,
  );
  await run(
    "pins",
    sql`delete from project_pin where project_id in ${seedProjects}`,
  );
  await run(
    "variables",
    sql`delete from environment_variable where environment_id in (select id from environment where project_id in ${seedProjects})`,
  );
  await run(
    "environments",
    sql`delete from environment where project_id in ${seedProjects}`,
  );
  await run(
    "project member grants",
    sql`delete from project_member_grant where project_id in ${seedProjects}`,
  );
  await run(
    "project teams",
    sql`delete from project_team where project_id in ${seedProjects}`,
  );
  await run(
    "project managers",
    sql`delete from project_manager where project_id in ${seedProjects}`,
  );
  await run("projects", sql`delete from project where id in ${seedProjects}`);
  await run(
    "team members",
    sql`delete from team_member where id like 'seed-%' or team_id in (select id from team where organization_id in (${orgs}))`,
  );
  await run("teams", sql`delete from team where organization_id in (${orgs})`);
  await run(
    "invitations",
    sql`delete from invitation where organization_id in (${orgs})`,
  );
  await run(
    "members",
    sql`delete from member where organization_id in (${orgs}) or user_id like 'seed-user-%'`,
  );
  await run(
    "sessions (active org reset)",
    sql`update session set active_organization_id = null where active_organization_id in (${orgs})`,
  );
  await run(
    "organizations",
    sql`delete from organization where id in (${orgs})`,
  );
  await run(
    "seed user sessions",
    sql`delete from session where user_id like 'seed-user-%'`,
  );
  await run(
    "seed user accounts",
    sql`delete from account where user_id like 'seed-user-%'`,
  );
  await run("seed users", sql`delete from "user" where id like 'seed-user-%'`);
  console.log("Cleanup complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
