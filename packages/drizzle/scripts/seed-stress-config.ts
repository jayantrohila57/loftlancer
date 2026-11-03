/** Shared ids/config for the stress seed and its cleanup. Every seeded row id starts with `seed-`. */
export const SEED_PREFIX = "seed-";

export const SEED_ORGS = [
  { id: "seed-org-test", name: "Seed Test", slug: "seed-test", weight: 0.7 },
  {
    id: "seed-org-acme",
    name: "Seed Acme Labs",
    slug: "seed-acme-labs",
    weight: 0.15,
  },
  {
    id: "seed-org-umbrella",
    name: "Seed Umbrella Co",
    slug: "seed-umbrella-co",
    weight: 0.15,
  },
] as const;

function num(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  const n = raw ? Number(raw) : fallback;
  if (!Number.isFinite(n) || n < 0)
    throw new Error(`${name} must be a non-negative number`);
  return Math.floor(n);
}

export function seedConfig() {
  return {
    ownerUserId:
      process.env.SEED_OWNER_USER_ID?.trim() ||
      "XQuIY1Bt37bLjU77xH02oSxnKlkQF0AO",
    users: num("SEED_USERS", 500),
    teams: num("SEED_TEAMS", 500),
    invitations: num("SEED_INVITATIONS", 500),
    projects: num("SEED_PROJECTS", 500),
    varMin: num("SEED_VARS_MIN", 5),
    varMax: num("SEED_VARS_MAX", 80),
    pins: num("SEED_PINS", 12),
    auditEvents: num("SEED_AUDIT_EVENTS", 1500),
    notifications: num("SEED_NOTIFICATIONS", 500),
    tasksMin: num("SEED_TASKS_MIN", 0),
    tasksMax: num("SEED_TASKS_MAX", 30),
    taskNotifications: num("SEED_TASK_NOTIFICATIONS", 60),
    batchSize: Math.max(1, num("SEED_BATCH", 250)),
    rngSeed: num("SEED_RNG", 20261016),
  };
}

export type SeedConfig = ReturnType<typeof seedConfig>;
