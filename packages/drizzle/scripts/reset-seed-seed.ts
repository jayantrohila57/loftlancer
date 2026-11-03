import { encrypt } from "@loftlancer/crypto";
import { db } from "@loftlancer/drizzle";
import { E2E_DEMO_SEED_MARKER } from "@loftlancer/drizzle/e2e-demo-variables";
import { auditLog } from "@loftlancer/drizzle/schema/audit";
import { auditEvent } from "@loftlancer/drizzle/schema/audit-event";
import { notification } from "@loftlancer/drizzle/schema/notifications";
import { organization } from "@loftlancer/drizzle/schema/organization";
import {
  projectManager,
  projectMemberGrant,
  projectTeam,
} from "@loftlancer/drizzle/schema/project-access";
import {
  environment,
  environmentVariable,
  project,
} from "@loftlancer/drizzle/schema/projects";
import { team, teamMember } from "@loftlancer/drizzle/schema/team";
import { eq } from "drizzle-orm";

import {
  insertSeedInvitation,
  insertSeedMembers,
  insertSeedUsers,
} from "./reset-seed-inserts";

export const SEED_MARKER = "reset-seed-v1";

const FAKE_SECRET_PLACEHOLDER = "sample-fake-secret-not-real";
const FAKE_CONFIG_PLACEHOLDER = "sample-config-value";

type SeedProject = {
  slug: string;
  name: string;
  description: string;
  org: "personal" | "team";
  envCount: 2 | 3;
};

const PROJECTS: SeedProject[] = [
  {
    slug: "northwind-checkout",
    name: "Northwind Checkout",
    description: "Demo storefront payment flow",
    org: "personal",
    envCount: 2,
  },
  {
    slug: "personal-notes-api",
    name: "Personal Notes API",
    description: "Side-project markdown sync",
    org: "personal",
    envCount: 2,
  },
  {
    slug: "home-lab-metrics",
    name: "Home Lab Metrics",
    description: "Raspberry Pi telemetry",
    org: "personal",
    envCount: 3,
  },
  {
    slug: "weekend-game-server",
    name: "Weekend Game Server",
    description: "LAN party lobby service",
    org: "personal",
    envCount: 2,
  },
  {
    slug: "acme-web-portal",
    name: "Acme Web Portal",
    description: "Customer-facing dashboard",
    org: "team",
    envCount: 3,
  },
  {
    slug: "acme-billing-worker",
    name: "Acme Billing Worker",
    description: "Invoice and usage jobs",
    org: "team",
    envCount: 3,
  },
  {
    slug: "acme-mobile-gateway",
    name: "Acme Mobile Gateway",
    description: "BFF for mobile clients",
    org: "team",
    envCount: 2,
  },
  {
    slug: "stellar-search",
    name: "Stellar Search",
    description: "Full-text index service",
    org: "team",
    envCount: 3,
  },
  {
    slug: "stellar-ingest",
    name: "Stellar Ingest",
    description: "CDC pipeline workers",
    org: "team",
    envCount: 2,
  },
  {
    slug: "orbit-notifications",
    name: "Orbit Notifications",
    description: "Email and push fan-out",
    org: "team",
    envCount: 3,
  },
  {
    slug: "orbit-admin",
    name: "Orbit Admin",
    description: "Internal ops console",
    org: "team",
    envCount: 2,
  },
  {
    slug: "lumen-analytics",
    name: "Lumen Analytics",
    description: "Event aggregation API",
    org: "team",
    envCount: 3,
  },
  {
    slug: "lumen-exports",
    name: "Lumen Exports",
    description: "Scheduled CSV exports",
    org: "team",
    envCount: 2,
  },
  {
    slug: "harbor-integrations",
    name: "Harbor Integrations",
    description: "Third-party webhooks",
    org: "team",
    envCount: 3,
  },
  {
    slug: "harbor-docs",
    name: "Harbor Docs Site",
    description: "Public documentation",
    org: "team",
    envCount: 2,
  },
];

const ENV_TEMPLATES = [
  {
    slug: "development",
    name: "Development",
    branch: "main",
    isProduction: false,
  },
  {
    slug: "staging",
    name: "Staging",
    branch: "staging",
    isProduction: false,
  },
  {
    slug: "production",
    name: "Production",
    branch: "release",
    isProduction: true,
  },
];

const VARIABLE_DEFS = [
  {
    key: "APP_URL",
    type: "config" as const,
    note: `${E2E_DEMO_SEED_MARKER}: public base URL`,
    sample: FAKE_CONFIG_PLACEHOLDER,
  },
  {
    key: "LOG_LEVEL",
    type: "config" as const,
    note: `${E2E_DEMO_SEED_MARKER}: log level`,
    sample: "info",
  },
  {
    key: "DATABASE_URL",
    type: "secret" as const,
    note: `${E2E_DEMO_SEED_MARKER}: postgres placeholder`,
    sample: FAKE_SECRET_PLACEHOLDER,
  },
  {
    key: "API_TOKEN",
    type: "secret" as const,
    note: `${E2E_DEMO_SEED_MARKER}: service token placeholder`,
    sample: FAKE_SECRET_PLACEHOLDER,
  },
];

function slugifyPersonal(userId: string, name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const suffix = userId.replace(/-/g, "").slice(0, 8);
  return `${base || "workspace"}-personal-${suffix}`.slice(0, 255);
}

function firstName(fullName: string): string {
  return fullName.split(" ")[0] || "My";
}

export type SeedSummary = {
  personalOrgId: string;
  teamOrgId: string;
  projectCount: number;
  environmentCount: number;
  variableCount: number;
  teammateUserIds: string[];
};

export async function seedSampleData(owner: {
  id: string;
  name: string;
  email: string;
}): Promise<SeedSummary> {
  const personalOrgId = crypto.randomUUID();
  const teamOrgId = crypto.randomUUID();
  const personalSlug = slugifyPersonal(owner.id, owner.name);
  const teamSlug = "acme-labs-demo";

  const managerId = crypto.randomUUID();
  const memberId = crypto.randomUUID();
  const platformTeamId = crypto.randomUUID();
  const integrationsTeamId = crypto.randomUUID();

  await insertSeedUsers([
    {
      id: managerId,
      name: "Morgan Sample",
      email: "seed-manager@fake.loftlancer.local",
      emailVerified: true,
    },
    {
      id: memberId,
      name: "Casey Sample",
      email: "seed-member@fake.loftlancer.local",
      emailVerified: true,
    },
  ]);

  await db.insert(organization).values([
    {
      id: personalOrgId,
      name: `${firstName(owner.name)}'s Workspace`,
      slug: personalSlug,
      metadata: JSON.stringify({ type: "personal", seed: SEED_MARKER }),
    },
    {
      id: teamOrgId,
      name: "Acme Labs (Sample)",
      slug: teamSlug,
      metadata: JSON.stringify({ type: "team", seed: SEED_MARKER }),
    },
  ]);

  await insertSeedMembers([
    {
      id: crypto.randomUUID(),
      organizationId: personalOrgId,
      userId: owner.id,
      role: "owner",
    },
    {
      id: crypto.randomUUID(),
      organizationId: teamOrgId,
      userId: owner.id,
      role: "owner",
    },
    {
      id: crypto.randomUUID(),
      organizationId: teamOrgId,
      userId: managerId,
      role: "manager",
    },
    {
      id: crypto.randomUUID(),
      organizationId: teamOrgId,
      userId: memberId,
      role: "member",
    },
  ]);

  await db.insert(team).values([
    {
      id: platformTeamId,
      name: "Platform",
      organizationId: teamOrgId,
    },
    {
      id: integrationsTeamId,
      name: "Integrations",
      organizationId: teamOrgId,
    },
  ]);

  await db.insert(teamMember).values([
    {
      id: crypto.randomUUID(),
      teamId: platformTeamId,
      userId: managerId,
    },
    {
      id: crypto.randomUUID(),
      teamId: platformTeamId,
      userId: memberId,
    },
    {
      id: crypto.randomUUID(),
      teamId: integrationsTeamId,
      userId: memberId,
    },
  ]);

  let environmentCount = 0;
  let variableCount = 0;
  const teamProjectIds: string[] = [];

  for (const def of PROJECTS) {
    const orgId = def.org === "personal" ? personalOrgId : teamOrgId;
    const projectId = crypto.randomUUID();

    await db.insert(project).values({
      id: projectId,
      name: def.name,
      slug: def.slug,
      description: def.description,
      userId: owner.id,
      organizationId: orgId,
      status: "active",
      isPublic: def.slug === "harbor-docs",
      repositoryUrl: `https://github.com/example/${def.slug}`,
    });

    if (def.org === "team") {
      teamProjectIds.push(projectId);
    }

    const envs = ENV_TEMPLATES.slice(0, def.envCount);
    for (const envDef of envs) {
      const envId = crypto.randomUUID();
      environmentCount += 1;

      await db.insert(environment).values({
        id: envId,
        name: envDef.name,
        slug: envDef.slug,
        branch: envDef.branch,
        isProduction: envDef.isProduction,
        projectId,
        createdBy: owner.id,
        updatedBy: owner.id,
        deployedUrl: `https://${def.slug}-${envDef.slug}.example.dev`,
      });

      for (const varDef of VARIABLE_DEFS) {
        variableCount += 1;
        await db.insert(environmentVariable).values({
          id: crypto.randomUUID(),
          key: varDef.key,
          encryptedValue: encrypt(varDef.sample),
          type: varDef.type,
          note: varDef.note,
          environmentId: envId,
          createdBy: owner.id,
          updatedBy: owner.id,
        });
      }
    }
  }

  const managedProjectId = teamProjectIds[0];
  const grantedProjectId = teamProjectIds[1];

  if (managedProjectId) {
    await db.insert(projectManager).values({
      id: crypto.randomUUID(),
      organizationId: teamOrgId,
      projectId: managedProjectId,
      userId: managerId,
      createdBy: owner.id,
    });
  }

  if (grantedProjectId) {
    await db.insert(projectMemberGrant).values({
      id: crypto.randomUUID(),
      organizationId: teamOrgId,
      projectId: grantedProjectId,
      userId: memberId,
      grants: ["project.read", "variable.read", "environment.read"],
      updatedBy: owner.id,
    });

    await db.insert(projectTeam).values({
      id: crypto.randomUUID(),
      organizationId: teamOrgId,
      projectId: grantedProjectId,
      teamId: integrationsTeamId,
      createdBy: owner.id,
    });
  }

  const pendingInviteId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await insertSeedInvitation({
    id: pendingInviteId,
    organizationId: teamOrgId,
    email: "pending-invite@fake.loftlancer.local",
    role: "member",
    status: "pending",
    expiresAt,
    inviterId: owner.id,
  });

  await db.insert(notification).values([
    {
      id: crypto.randomUUID(),
      recipientUserId: owner.id,
      organizationId: teamOrgId,
      type: "invitation.accepted",
      actorUserId: managerId,
      entityType: "member",
      title: "Morgan joined Acme Labs",
      body: "Morgan Sample accepted your invitation.",
      idempotencyKey: `${SEED_MARKER}:invite-accepted`,
      data: { seed: SEED_MARKER, organizationId: teamOrgId },
    },
    {
      id: crypto.randomUUID(),
      recipientUserId: owner.id,
      organizationId: teamOrgId,
      type: "project.updated",
      actorUserId: managerId,
      entityType: "project",
      entityId: managedProjectId ?? teamProjectIds[0],
      title: "Project settings updated",
      body: "A manager updated environment defaults (sample event).",
      idempotencyKey: `${SEED_MARKER}:project-updated`,
      data: { seed: SEED_MARKER },
    },
  ]);

  const sampleProjectId = teamProjectIds[0] ?? personalOrgId;
  const sampleEnvRows = await db
    .select({ id: environment.id })
    .from(environment)
    .innerJoin(project, eq(environment.projectId, project.id))
    .where(eq(project.id, sampleProjectId))
    .limit(1);
  const sampleEnvId = sampleEnvRows[0]?.id;

  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    userId: owner.id,
    projectId: sampleProjectId,
    environmentId: sampleEnvId ?? null,
    action: "UPDATE",
    entityType: "VARIABLE",
    entitySlug: "LOG_LEVEL",
    metadata: JSON.stringify({
      seed: SEED_MARKER,
      note: "Sample legacy audit row",
    }),
  });

  await db.insert(auditEvent).values([
    {
      id: crypto.randomUUID(),
      action: "project.create",
      result: "success",
      actorUserId: owner.id,
      organizationId: teamOrgId,
      projectId: sampleProjectId,
      entityType: "project",
      entitySlug: PROJECTS.find((p) => p.org === "team")?.slug,
      payload: { seed: SEED_MARKER },
      ipAddress: "127.0.0.1",
      userAgent: "reset-seed-script",
    },
    {
      id: crypto.randomUUID(),
      action: "variable.update",
      result: "success",
      actorUserId: managerId,
      organizationId: teamOrgId,
      projectId: sampleProjectId,
      environmentId: sampleEnvId ?? null,
      entityType: "variable",
      entitySlug: "LOG_LEVEL",
      payload: { seed: SEED_MARKER, type: "config" },
      ipAddress: "127.0.0.1",
      userAgent: "reset-seed-script",
    },
  ]);

  return {
    personalOrgId,
    teamOrgId,
    projectCount: PROJECTS.length,
    environmentCount,
    variableCount,
    teammateUserIds: [managerId, memberId],
  };
}
