/**
 * Stress-test seed: fills three seed orgs with lots of varied data for UI testing.
 * Idempotent (deterministic `seed-` ids / seed UUIDs + ON CONFLICT DO NOTHING) and batched.
 *
 *   SEED_CONFIRM=yes DATABASE_URL=... ENCRYPTION_KEY=... SKIP_ENV_VALIDATION=1 \
 *     pnpm --filter @loftlancer/drizzle db:seed-stress
 *
 * Counts: SEED_USERS, SEED_TEAMS, SEED_INVITATIONS, SEED_PROJECTS, SEED_VARS_MIN,
 * SEED_VARS_MAX, SEED_PINS, SEED_AUDIT_EVENTS, SEED_NOTIFICATIONS, SEED_BATCH.
 * Remove everything with `db:seed-stress:clean`.
 */

import { createHash } from "node:crypto";
import {
  type ActionDefinition,
  actionRegistry,
} from "@features/authorization/utils";
import { decrypt, encrypt } from "@loftlancer/crypto";
import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { user } from "@loftlancer/drizzle/schema/auth";
import { notification } from "@loftlancer/drizzle/schema/notifications";
import {
  invitation,
  member,
  organization,
} from "@loftlancer/drizzle/schema/organization";
import {
  projectApp,
  task,
  taskComment,
} from "@loftlancer/drizzle/schema/project-app";
import { projectPin } from "@loftlancer/drizzle/schema/project-pin";
import {
  environment,
  environmentVariable,
  project,
} from "@loftlancer/drizzle/schema/projects";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import { eq, inArray, not, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

let db: Awaited<ReturnType<typeof getSeedDb>>;

import { getSeedDb } from "./seed-db";
import { SEED_ORGS, type SeedConfig, seedConfig } from "./seed-stress-config";

/**
 * SEED_ONLY=apps: regenerate the same deterministic data but only write the
 * apps rows (project_app, tasks, task comments, task notifications). Needs no
 * ENCRYPTION_KEY, since variables are skipped.
 */
const ONLY_APPS = process.env.SEED_ONLY === "apps";
const APPS_LABELS = new Set([
  "project apps",
  "tasks",
  "task comments",
  "task notifications",
]);

/**
 * Deterministic RFC 4122 v5-style UUID for a seed key. Projects, environments,
 * variables, apps and tasks must use UUIDs: the API validates those ids with
 * z.string().uuid(), so `seed-proj-0126`-style ids 400 (#248, #250).
 */
function seedUuid(key: string): string {
  const h = createHash("sha1").update(`loftlancer-seed:${key}`).digest();
  h[6] = ((h[6] ?? 0) & 0x0f) | 0x50;
  h[8] = ((h[8] ?? 0) & 0x3f) | 0x80;
  const x = h.subarray(0, 16).toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}
/** Seed project uuid -> its zero-padded seed number, for child ids. */
const projectKey = new Map<string, string>();
const pkey = (pid: string) => projectKey.get(pid) ?? pid;

const DAY = 86_400_000;
const NOW = Date.now();

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let rand = mulberry32(1);
const int = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));
const pick = <T>(xs: readonly T[]): T =>
  xs[Math.floor(rand() * xs.length)] as T;
const chance = (p: number) => rand() < p;
const pad = (n: number, w = 4) => String(n).padStart(w, "0");
/** Random time in the last `days`, biased towards recent. */
const pastDate = (days: number) =>
  new Date(NOW - Math.floor(rand() ** 1.6 * days * DAY) - int(0, DAY));
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const FIRST = [
  "Ava",
  "Liam",
  "Noah",
  "Mia",
  "Zoe",
  "Arjun",
  "Priya",
  "Kenji",
  "Sofia",
  "Mateo",
  "Amara",
  "Lucas",
  "Ingrid",
  "Omar",
  "Chen",
  "Fatima",
  "Diego",
  "Hana",
  "Yusuf",
  "Elena",
  "Ravi",
  "Nora",
  "Tariq",
  "Lena",
  "Kofi",
  "Sakura",
  "Bjorn",
  "Aisha",
  "Pierre",
  "Maximilian-Alexander",
];
const LAST = [
  "Smith",
  "Patel",
  "Kim",
  "Garcia",
  "Okafor",
  "Nakamura",
  "Rossi",
  "Müller",
  "Ivanova",
  "Silva",
  "Haddad",
  "Johansson",
  "O'Connor",
  "Nguyen",
  "Kowalski",
  "Fernández-Ortega",
  "Wright",
  "Banerjee",
  "Lee",
  "Abernathy-Whitfield",
];
const WORDS = [
  "atlas",
  "beacon",
  "cobalt",
  "delta",
  "ember",
  "falcon",
  "granite",
  "harbor",
  "ion",
  "juniper",
  "kepler",
  "lumen",
  "matrix",
  "nova",
  "orbit",
  "pulse",
  "quartz",
  "relay",
  "summit",
  "titan",
  "umbra",
  "vertex",
  "willow",
  "xenon",
  "yonder",
  "zephyr",
];
const SUFFIX = [
  "api",
  "web",
  "worker",
  "gateway",
  "dashboard",
  "billing service",
  "auth",
  "mobile app",
  "data pipeline",
  "infra",
  "docs",
  "cli",
  "edge functions",
  "admin portal",
];
const TEAM_KINDS = [
  "Platform",
  "Payments",
  "Growth",
  "Mobile",
  "Infra",
  "Security",
  "Data",
  "Design Systems",
  "Developer Experience",
  "Customer Success Engineering",
  "QA",
  "Ops",
];
const CUSTOM_ENVS = [
  "preview",
  "qa",
  "demo",
  "canary",
  "sandbox",
  "eu-production",
  "load-test",
  "hotfix",
  "uat",
  "perf",
];
const KEY_STEMS = [
  "DATABASE_URL",
  "REDIS_URL",
  "API_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_APP_URL",
  "SENTRY_DSN",
  "JWT_SECRET",
  "S3_BUCKET",
  "SMTP_HOST",
  "LOG_LEVEL",
  "FEATURE_FLAG",
  "OPENAI_API_KEY",
  "WEBHOOK_SECRET",
  "CDN_URL",
  "PORT",
  "NODE_ENV",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "PRIVATE_KEY",
  "ALLOWED_ORIGINS",
];

function makeKey(i: number) {
  if (chance(0.08)) {
    return `VERY_LONG_${pick(KEY_STEMS)}_${Array.from({ length: int(4, 9) }, () => pick(WORDS).toUpperCase()).join("_")}_${i}`;
  }
  return `${pick(KEY_STEMS)}${chance(0.6) ? `_${pick(WORDS).toUpperCase()}` : ""}_${i}`;
}

function randomToken(len: number) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += abc[Math.floor(rand() * abc.length)];
  return s;
}

function makeValue(): {
  value: string;
  type: "secret" | "config";
  note: string | null;
} {
  const r = rand();
  // Empty values are opt-in: the app currently cannot decrypt an encrypted ""
  // (decrypt throws "Invalid encrypted text parts"), which breaks the variables list.
  if (r < 0.06 && process.env.SEED_EMPTY_VALUES === "1") {
    return { value: "", type: "config", note: "Intentionally empty" };
  }
  if (r < 0.14) {
    const body = Array.from({ length: int(4, 12) }, () => randomToken(64)).join(
      "\n",
    );
    return {
      value: `-----BEGIN FAKE PRIVATE KEY-----\n${body}\n-----END FAKE PRIVATE KEY-----`,
      type: "secret",
      note: "Multiline (fake, seed data)",
    };
  }
  if (r < 0.2)
    return {
      value: `seed_${randomToken(int(400, 1800))}`,
      type: "secret",
      note: "Very long value",
    };
  if (r < 0.55)
    return {
      value: `sk_seed_${randomToken(int(24, 64))}`,
      type: "secret",
      note: null,
    };
  if (r < 0.75)
    return {
      value: `https://${pick(WORDS)}.example.com/${pick(WORDS)}?region=${pick(["ap", "eu", "us"])}`,
      type: "config",
      note: null,
    };
  return {
    value: pick([
      "true",
      "false",
      "debug",
      "info",
      "3000",
      "production",
      "50",
      `{"enabled":true,"rollout":${int(0, 100)}}`,
    ]),
    type: "config",
    note: chance(0.2) ? "Plain config value" : null,
  };
}

async function insertBatched(
  label: string,
  table: PgTable,
  rows: Record<string, unknown>[],
  cfg: SeedConfig,
) {
  if (ONLY_APPS && !APPS_LABELS.has(label)) {
    console.log(`  ${label}: skipped (SEED_ONLY=apps)`);
    return;
  }
  let done = 0;
  for (let i = 0; i < rows.length; i += cfg.batchSize) {
    const chunk = rows.slice(i, i + cfg.batchSize);
    await db
      .insert(table)
      // biome-ignore lint/suspicious/noExplicitAny: generic batched insert across tables; row shape varies per table
      .values(chunk as any)
      .onConflictDoNothing();
    done += chunk.length;
  }
  console.log(`  ${label}: ${done}`);
}

function weightedOrg() {
  const r = rand();
  let acc = 0;
  for (const o of SEED_ORGS) {
    acc += o.weight;
    if (r < acc) return o;
  }
  return SEED_ORGS[0];
}

async function preflight(cfg: SeedConfig) {
  if (process.env.SEED_CONFIRM !== "yes") {
    console.error("Refusing to run: set SEED_CONFIRM=yes.");
    process.exit(1);
  }
  const [owner] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, cfg.ownerUserId))
    .limit(1);
  if (!owner) throw new Error(`Owner user ${cfg.ownerUserId} not found`);
  if (ONLY_APPS) return;
  // Ensure ENCRYPTION_KEY matches the app's key by decrypting one existing non-seed value.
  const [sample] = await db
    .select({ v: environmentVariable.encryptedValue })
    .from(environmentVariable)
    .innerJoin(
      environment,
      eq(environment.id, environmentVariable.environmentId),
    )
    .innerJoin(project, eq(project.id, environment.projectId))
    .where(
      not(
        inArray(
          project.organizationId,
          SEED_ORGS.map((o) => o.id),
        ),
      ),
    )
    .limit(1);
  if (sample) decrypt(sample.v);
  const roundTrip = decrypt(encrypt("seed-check"));
  if (roundTrip !== "seed-check")
    throw new Error("encrypt/decrypt round trip failed");
}

async function main() {
  db = await getSeedDb();
  const cfg = seedConfig();
  rand = mulberry32(cfg.rngSeed);
  await preflight(cfg);
  const owner = cfg.ownerUserId;
  console.log("Seeding with", { ...cfg, ownerUserId: "<owner>" });

  // Orgs + owner memberships
  await insertBatched(
    "organizations",
    organization,
    SEED_ORGS.map((o, i) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      metadata: null,
      createdAt: new Date(NOW - (400 - i) * DAY),
    })),
    cfg,
  );

  // Users
  const users = Array.from({ length: cfg.users }, (_, i) => {
    const n = i + 1;
    const first = pick(FIRST);
    const last = pick(LAST);
    return {
      id: `seed-user-${pad(n)}`,
      name: chance(0.05)
        ? `${first} ${last} ${pick(LAST)} (Contractor, ${pick(TEAM_KINDS)})`
        : `${first} ${last}`,
      email: `seed-${pad(n)}.${slugify(first)}@example.com`,
      emailVerified: chance(0.8),
      role: "user",
      createdAt: pastDate(365),
    };
  });
  await insertBatched("users", user, users, cfg);

  // Members: owner in every org, each user in a primary org, ~10% also in a second org
  const orgMembers = new Map<string, { userId: string; role: string }[]>(
    SEED_ORGS.map((o) => [o.id, [{ userId: owner, role: "owner" }]]),
  );
  const members: Record<string, unknown>[] = SEED_ORGS.map((o) => ({
    id: `seed-member-${o.id}-owner`,
    organizationId: o.id,
    userId: owner,
    role: "owner",
    createdAt: new Date(NOW - 400 * DAY),
  }));
  for (const u of users) {
    const orgs = new Set([weightedOrg().id]);
    if (chance(0.1)) orgs.add(pick(SEED_ORGS).id);
    for (const orgId of orgs) {
      const role = chance(0.05) ? "owner" : chance(0.22) ? "manager" : "member";
      orgMembers.get(orgId)?.push({ userId: u.id, role });
      members.push({
        id: `seed-member-${orgId}-${u.id}`,
        organizationId: orgId,
        userId: u.id,
        role,
        createdAt: pastDate(360),
      });
    }
  }
  await insertBatched("members", member, members, cfg);

  // Teams + team members
  const teams: Record<string, unknown>[] = [];
  const teamMembers: Record<string, unknown>[] = [];
  const teamsByOrg = new Map<string, string[]>(
    SEED_ORGS.map((o) => [o.id, []]),
  );
  for (let i = 1; i <= cfg.teams; i++) {
    const org = weightedOrg();
    const id = `seed-team-${pad(i)}`;
    const pool = orgMembers.get(org.id) ?? [];
    const chosen = new Set<string>();
    const size = chance(0.1) ? 0 : int(1, Math.min(12, pool.length));
    while (chosen.size < size) chosen.add(pick(pool).userId);
    for (const userId of chosen) {
      teamMembers.push({
        id: `seed-tm-${pad(i)}-${userId}`,
        teamId: id,
        userId,
        membershipKey: `seed:${id}:${userId}`,
        createdAt: pastDate(300),
      });
    }
    teamsByOrg.get(org.id)?.push(id);
    const name = chance(0.08)
      ? `${pick(TEAM_KINDS)} ${pick(TEAM_KINDS)} and ${pick(WORDS)} working group ${i}`
      : `${pick(TEAM_KINDS)} ${pick(WORDS)} ${i}`;
    teams.push({
      id,
      name,
      memberCount: chosen.size,
      organizationId: org.id,
      createdAt: pastDate(330),
    });
  }
  await insertBatched("teams", team, teams, cfg);
  await insertBatched("team members", teamMember, teamMembers, cfg);

  // Invitations: pending (half expired), accepted, rejected, canceled
  const invitations = Array.from({ length: cfg.invitations }, (_, i) => {
    const org = weightedOrg();
    const created = pastDate(120);
    const r = rand();
    const status =
      r < 0.4
        ? "pending"
        : r < 0.65
          ? "accepted"
          : r < 0.8
            ? "rejected"
            : "canceled";
    const expired = status === "pending" ? chance(0.5) : true;
    const inviters = (orgMembers.get(org.id) ?? []).filter(
      (m) => m.role !== "member",
    );
    return {
      id: `seed-inv-${pad(i + 1)}`,
      organizationId: org.id,
      email: `seed-invitee-${pad(i + 1)}@example.com`,
      role: chance(0.1) ? "owner" : chance(0.3) ? "manager" : "member",
      status,
      expiresAt: expired
        ? new Date(created.getTime() + 2 * DAY)
        : new Date(NOW + int(1, 7) * DAY),
      inviterId: chance(0.5) ? owner : pick(inviters).userId,
      teamId: chance(0.25)
        ? (pick(teamsByOrg.get(org.id) ?? [null]) ?? null)
        : null,
      createdAt: created,
    };
  });
  await insertBatched("invitations", invitation, invitations, cfg);

  // Projects, environments, variables
  const projects: Record<string, unknown>[] = [];
  const envs: { id: string; projectId: string; orgId: string; slug: string }[] =
    [];
  const envRows: Record<string, unknown>[] = [];
  let varCount = 0;
  const projectsByOrg = new Map<string, { id: string; slug: string }[]>(
    SEED_ORGS.map((o) => [o.id, []]),
  );
  for (let i = 1; i <= cfg.projects; i++) {
    const org = weightedOrg();
    const pid = seedUuid(`proj-${pad(i)}`);
    projectKey.set(pid, pad(i));
    const name = chance(0.1)
      ? `${pick(WORDS)} ${pick(WORDS)} ${pick(SUFFIX)} for the ${pick(TEAM_KINDS)} team (legacy migration ${i})`
      : chance(0.15)
        ? `${pick(WORDS)}`
        : `${pick(WORDS)} ${pick(SUFFIX)}`;
    const slug = `seed-${slugify(name).slice(0, 40)}-${i}`;
    const created = pastDate(365);
    const pool = orgMembers.get(org.id) ?? [];
    projects.push({
      id: pid,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      slug,
      description: chance(0.3)
        ? null
        : chance(0.15)
          ? `Seed project ${i}. ${Array.from({ length: 30 }, () => pick(WORDS)).join(" ")}.`
          : `Seed ${pick(SUFFIX)} for ${org.name}.`,
      isArchived: chance(0.08),
      isPublic: chance(0.25),
      repositoryUrl: chance(0.6)
        ? `https://github.com/seed-example/${slugify(name)}`
        : null,
      websiteUrl: chance(0.3) ? `https://${slugify(name)}.example.com` : null,
      status: chance(0.85)
        ? "active"
        : pick(["inactive", "maintenance"] as const),
      userId: chance(0.4) ? owner : pick(pool).userId,
      organizationId: org.id,
      createdAt: created,
      updatedAt: pastDate(60),
    });
    projectsByOrg.get(org.id)?.push({ id: pid, slug });
    const base = ["development", "staging", "production"].filter(() =>
      chance(0.85),
    );
    if (base.length === 0) base.push("development");
    const custom = Array.from({ length: chance(0.4) ? int(1, 3) : 0 }, () =>
      pick(CUSTOM_ENVS),
    );
    for (const envName of new Set([...base, ...custom])) {
      const eslug = slugify(envName);
      const eid = seedUuid(`env-${pad(i)}-${eslug}`);
      envs.push({ id: eid, projectId: pid, orgId: org.id, slug: eslug });
      envRows.push({
        id: eid,
        name: envName,
        slug: eslug,
        branch:
          envName === "production" ? "main" : chance(0.5) ? envName : null,
        deployedUrl: chance(0.5)
          ? `https://${eslug}.${slugify(name)}.example.com`
          : null,
        status: chance(0.85)
          ? "active"
          : pick(["inactive", "building", "failed"] as const),
        isProduction: envName.includes("production"),
        projectId: pid,
        createdBy: owner,
        createdAt: created,
      });
    }
  }
  await insertBatched("projects", project, projects, cfg);
  await insertBatched("environments", environment, envRows, cfg);

  // Variables in streamed batches to keep memory and pool use low
  const envsByProject = new Map<string, typeof envs>();
  for (const e of envs)
    envsByProject.set(e.projectId, [
      ...(envsByProject.get(e.projectId) ?? []),
      e,
    ]);
  let buffer: Record<string, unknown>[] = [];
  const flush = async () => {
    if (!buffer.length) return;
    if (ONLY_APPS) {
      buffer = [];
      return;
    }
    await db
      .insert(environmentVariable)
      // biome-ignore lint/suspicious/noExplicitAny: buffered seed rows are built loosely; drizzle validates columns at insert
      .values(buffer as any)
      .onConflictDoNothing();
    varCount += buffer.length;
    buffer = [];
  };
  for (const [pid, pEnvs] of envsByProject) {
    const total = int(cfg.varMin, cfg.varMax);
    for (let v = 0; v < total; v++) {
      const env = pEnvs[v % pEnvs.length];
      if (!env) continue;
      const { value, type, note } = makeValue();
      buffer.push({
        id: seedUuid(`var-${pkey(pid)}-${pad(v, 3)}`),
        key: makeKey(v),
        encryptedValue: ONLY_APPS ? "" : encrypt(value),
        type,
        note,
        environmentId: env.id,
        createdBy: owner,
        createdAt: pastDate(300),
      });
      if (buffer.length >= cfg.batchSize) await flush();
    }
  }
  await flush();
  console.log(
    ONLY_APPS
      ? "  variables: skipped (SEED_ONLY=apps)"
      : `  variables: ${varCount}`,
  );

  // Pins for the owner (Seed Test projects)
  const pinPool = projectsByOrg.get(SEED_ORGS[0].id) ?? [];
  await insertBatched(
    "pins",
    projectPin,
    pinPool.slice(0, cfg.pins).map((p, i) => ({
      userId: owner,
      projectId: p.id,
      createdAt: new Date(NOW - i * 3_600_000),
    })),
    cfg,
  );

  // Apps (#245/#246): every seed project gets env + tasks installed, then tasks.
  // Separate RNG so adding this block doesn't reshuffle the rows after it.
  const mainRand = rand;
  rand = mulberry32(cfg.rngSeed + 246);
  const appRows: Record<string, unknown>[] = [];
  const taskRows: Record<string, unknown>[] = [];
  const commentRows: Record<string, unknown>[] = [];
  const taskNotifs: Record<string, unknown>[] = [];
  const STATUSES = [
    "backlog",
    "todo",
    "todo",
    "in_progress",
    "in_progress",
    "done",
    "done",
    "done",
    "canceled",
  ];
  const PRIORITIES = [
    "none",
    "none",
    "low",
    "medium",
    "medium",
    "high",
    "urgent",
  ];
  const LABELS = [
    "bug",
    "feature",
    "chore",
    "docs",
    "infra",
    "security",
    "ux",
    "perf",
  ];
  const VERBS = [
    "Fix",
    "Add",
    "Refactor",
    "Document",
    "Investigate",
    "Remove",
    "Upgrade",
    "Ship",
    "Audit",
    "Rotate",
  ];
  for (const p of projects) {
    const pid = p.id as string;
    const orgId = p.organizationId as string;
    for (const appId of ["env", "tasks"]) {
      appRows.push({
        id: seedUuid(`app-${pkey(pid)}-${appId}`),
        organizationId: orgId,
        projectId: pid,
        appId,
        appVersion: 1,
        status: "active",
        installedBy: owner,
        installedAt: p.createdAt,
      });
    }
    const members = orgMembers.get(orgId) ?? [];
    const pool = members.length ? members : [{ userId: owner, role: "owner" }];
    const n = int(cfg.tasksMin, cfg.tasksMax);
    for (let t = 1; t <= n; t++) {
      const id = seedUuid(`task-${pkey(pid)}-${pad(t, 3)}`);
      const created = pastDate(180);
      const assignee = chance(0.75)
        ? chance(0.15)
          ? owner
          : pick(pool).userId
        : null;
      const title = chance(0.1)
        ? `${pick(VERBS)} ${Array.from({ length: 16 }, () => pick(WORDS)).join(" ")}`
        : `${pick(VERBS)} ${pick(WORDS)} ${pick(SUFFIX)}`;
      taskRows.push({
        id,
        organizationId: orgId,
        projectId: pid,
        number: t,
        title,
        description: chance(0.6)
          ? `Seed task ${t}. ${Array.from({ length: int(5, 60) }, () => pick(WORDS)).join(" ")}.`
          : null,
        status: pick(STATUSES),
        priority: pick(PRIORITIES),
        assigneeId: assignee,
        reporterId: chance(0.3) ? owner : pick(pool).userId,
        dueDate: chance(0.4)
          ? new Date(created.getTime() + int(1, 60) * DAY)
          : null,
        labels: LABELS.filter(() => chance(0.15)).slice(0, 3),
        createdAt: created,
        updatedAt: new Date(
          Math.min(NOW, created.getTime() + int(0, 30) * DAY),
        ),
      });
      for (let c = 1, cn = chance(0.5) ? int(1, 6) : 0; c <= cn; c++) {
        commentRows.push({
          id: seedUuid(`tc-${pkey(pid)}-${pad(t, 3)}-${c}`),
          taskId: id,
          authorId: chance(0.2) ? owner : pick(pool).userId,
          body: Array.from({ length: int(3, 40) }, () => pick(WORDS)).join(" "),
          createdAt: new Date(created.getTime() + c * int(1, 48) * 3_600_000),
        });
      }
      if (assignee === owner && taskNotifs.length < cfg.taskNotifications) {
        taskNotifs.push({
          id: `seed-notif-task-${pad(taskNotifs.length + 1)}`,
          recipientUserId: owner,
          organizationId: orgId,
          type: chance(0.6) ? "task.assigned" : "task.mentioned",
          actorUserId: pick(pool).userId,
          entityType: "task",
          entityId: id,
          data: {
            projectSlug: p.slug,
            projectName: p.name,
            taskId: id,
            taskNumber: t,
            title,
          },
          readAt: chance(0.5) ? new Date(NOW - int(1, 72) * 3_600_000) : null,
          idempotencyKey: `seed-notif-task-${pad(taskNotifs.length + 1)}`,
          createdAt: pastDate(30),
        });
      }
    }
  }
  rand = mainRand;
  await insertBatched("project apps", projectApp, appRows, cfg);
  await insertBatched("tasks", task, taskRows, cfg);
  await insertBatched("task comments", taskComment, commentRows, cfg);

  // Audit events: every canonical write action at least once, then random
  const writeActions = (
    Object.values(actionRegistry) as ActionDefinition[]
  ).filter(
    (d) =>
      !/\.(read|list|view)$/.test(d.name) &&
      !d.name.startsWith("audit.timeline.view."),
  );
  const audits: Record<string, unknown>[] = [];
  for (let i = 0; i < cfg.auditEvents; i++) {
    const def = i < writeActions.length ? writeActions[i] : pick(writeActions);
    if (!def) break;
    const org = weightedOrg();
    const pool = orgMembers.get(org.id) ?? [];
    const orgProjects = projectsByOrg.get(org.id) ?? [];
    const proj: { id: string | null; slug: string | null } = orgProjects.length
      ? pick(orgProjects)
      : { id: null, slug: null };
    const projEnvs = proj.id ? (envsByProject.get(proj.id) ?? []) : [];
    const env: { id: string | null } = projEnvs.length
      ? pick(projEnvs)
      : { id: null };
    const r = rand();
    const result = r < 0.8 ? "success" : r < 0.92 ? "failure" : "denied";
    const scoped = def.scope === "project";
    const envScoped =
      scoped && /environment|variable/.test(def.audit.entityType);
    const viaMcp = chance(0.1);
    audits.push({
      id: `seed-audit-${pad(i + 1, 5)}`,
      action: def.name,
      result,
      actorUserId: chance(0.4) ? owner : pick(pool).userId,
      organizationId: def.scope === "user" ? null : org.id,
      projectId: scoped ? proj.id : null,
      environmentId: envScoped ? (env.id ?? null) : null,
      entityType: def.audit.entityType,
      entityId: scoped ? proj.id : null,
      entitySlug: scoped ? proj.slug : null,
      targetUserId:
        def.audit.entityType === "member" ? pick(pool).userId : null,
      denialReason:
        result === "denied"
          ? pick([
              "missing_permission",
              "not_a_member",
              "project_grant_required",
            ])
          : null,
      errorCode:
        result === "failure"
          ? pick([
              "INTERNAL_SERVER_ERROR",
              "CONFLICT",
              "BAD_REQUEST",
              "TIMEOUT",
            ])
          : null,
      payload: { seed: true },
      ipAddress: `203.0.113.${int(1, 254)}`,
      userAgent: pick([
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Gecko/20100101 Firefox/131.0",
        "loftlancer-cli/1.4.0",
      ]),
      durationMs: int(3, 2400),
      source: viaMcp ? "mcp" : "trpc",
      mcpTool: viaMcp ? def.name.replace(/\./g, "_") : null,
      createdAt: pastDate(365),
    });
  }
  await insertBatched("audit events", auditEvent, audits, cfg);

  // Notifications for the owner: every type, read and unread
  const types = [
    "invitation.received",
    "invitation.accepted",
    "support.ticket.reply",
  ] as const;
  const notifs = Array.from({ length: cfg.notifications }, (_, i) => {
    const type = types[i % types.length] as (typeof types)[number];
    const org = weightedOrg();
    const pool = orgMembers.get(org.id) ?? [];
    const actor = pick(pool);
    const inv = pick(invitations);
    const actorName =
      users.find((u) => u.id === actor.userId)?.name ?? "Seed user";
    const data =
      type === "invitation.received"
        ? {
            organizationId: org.id,
            organizationName: org.name,
            invitationId: inv.id,
            inviterName: actorName,
          }
        : type === "invitation.accepted"
          ? {
              organizationId: org.id,
              organizationName: org.name,
              invitationId: inv.id,
              memberName: actorName,
              memberUserId: actor.userId,
            }
          : {
              ticketId: `seed-ticket-${pad(i + 1)}`,
              ticketNumber: 9000 + i,
              subject: chance(0.2)
                ? `Seed ticket ${i}: ${Array.from({ length: 14 }, () => pick(WORDS)).join(" ")}`
                : `Seed ticket ${i}`,
            };
    const created = pastDate(120);
    return {
      id: `seed-notif-${pad(i + 1)}`,
      recipientUserId: owner,
      organizationId: type === "support.ticket.reply" ? null : org.id,
      type,
      actorUserId: actor.userId,
      entityType:
        type === "support.ticket.reply" ? "support_ticket" : "invitation",
      entityId: type === "support.ticket.reply" ? data.ticketId : inv.id,
      data,
      readAt: chance(0.5)
        ? new Date(created.getTime() + int(1, 48) * 3_600_000)
        : null,
      idempotencyKey: `seed-notif-${pad(i + 1)}`,
      createdAt: created,
    };
  });
  await insertBatched("notifications", notification, notifs, cfg);
  await insertBatched("task notifications", notification, taskNotifs, cfg);

  // Final totals straight from the DB (#259): one line per seeded table.
  const totals = (
    await db.execute(
      sql`select
        (select count(*)::int from environment_variable where id like 'seed-%') as variables,
        (select count(*)::int from project_app where id like 'seed-%') as apps,
        (select count(*)::int from task where id like 'seed-%') as tasks,
        (select count(*)::int from task_comment where id like 'seed-%') as comments`,
    )
  ).rows[0] as {
    variables: number;
    apps: number;
    tasks: number;
    comments: number;
  };
  console.log(
    `Done. Seed rows in DB: ${totals.variables} variables, ${totals.apps} app installs, ${totals.tasks} tasks, ${totals.comments} task comments.`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
