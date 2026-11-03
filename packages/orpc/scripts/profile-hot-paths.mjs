/**
 * Measure DB round-trips for hot API paths (requires DATABASE_URL).
 *
 * Usage:
 *   SKIP_ENV_VALIDATION=1 DATABASE_URL=... node packages/orpc/scripts/profile-hot-paths.mjs
 */
import { performance } from "node:perf_hooks";

const queries = [];
let originalQuery;

async function main() {
  const { db } = await import("@loftlancer/drizzle");
  const { fetchUserAccountStats } = await import("../src/routers/dashboard.ts");
  const { buildPermissionsSnapshot } = await import(
    "../src/actions/permissions-snapshot.ts"
  );
  const { eq, isNull } = await import("drizzle-orm");
  const { user } = await import("@loftlancer/drizzle/schema/auth");
  const { member } = await import("@loftlancer/drizzle/schema/organization");

  const pool = db.$client;
  if (pool?.query) {
    originalQuery = pool.query.bind(pool);
    pool.query = async (...args) => {
      queries.push(args[0]?.text?.slice(0, 80) ?? "query");
      return originalQuery(...args);
    };
  }

  const [userRow] = await db
    .select({ id: user.id })
    .from(user)
    .where(isNull(user.deletedAt))
    .limit(1);
  const userId = userRow?.id;
  if (!userId) {
    console.error("No user in database — seed dev branch first.");
    process.exit(1);
  }

  const [memberRow] = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .limit(1);
  const organizationId = memberRow?.organizationId ?? null;

  async function bench(label, fn) {
    queries.length = 0;
    const start = performance.now();
    await fn();
    const ms = performance.now() - start;
    console.log(
      JSON.stringify({
        label,
        ms: Math.round(ms),
        queryCount: queries.length,
        sampleQueries: [...new Set(queries)].slice(0, 8),
      }),
    );
  }

  await bench("fetchUserAccountStats", () => fetchUserAccountStats(userId));
  await bench("buildPermissionsSnapshot", () =>
    buildPermissionsSnapshot({
      userId,
      organizationId,
      projectId: null,
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
