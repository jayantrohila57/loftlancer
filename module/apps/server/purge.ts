/**
 * Apps retention purge (#257). Uninstalled apps keep their data for 30 days
 * (`purge_after`); after that this hard-deletes the app's data for that
 * project and marks the install row `purged`. Idempotent: a purged row is
 * never selected again, and every delete is scoped to one project.
 *
 * DB-backed deps live in `./purge-db` so unit tests can import this module
 * without initializing `@loftlancer/drizzle`.
 */
export type PurgeCandidate = {
  id: string;
  appId: string;
  projectId: string;
  status: string;
  purgeAfter: Date | null;
};

export function selectPurgeable(
  rows: PurgeCandidate[],
  now: Date,
): PurgeCandidate[] {
  return rows.filter(
    (r) =>
      r.status === "uninstalled" &&
      r.purgeAfter !== null &&
      r.purgeAfter.getTime() <= now.getTime(),
  );
}

export type PurgeDeps = {
  listCandidates: (now: Date, limit: number) => Promise<PurgeCandidate[]>;
  deleteAppData: (appId: string, projectId: string) => Promise<number>;
  markPurged: (id: string, now: Date) => Promise<boolean>;
};

export async function purgeExpiredApps(
  deps: PurgeDeps,
  now = new Date(),
  limit = 200,
) {
  const due = selectPurgeable(await deps.listCandidates(now, limit), now);
  const purged: { appId: string; projectId: string; rows: number }[] = [];
  for (const row of due) {
    const rows = await deps.deleteAppData(row.appId, row.projectId);
    // Only count it if we flipped uninstalled -> purged (guards concurrent runs).
    if (await deps.markPurged(row.id, now))
      purged.push({ appId: row.appId, projectId: row.projectId, rows });
  }
  return { checked: due.length, purged };
}
