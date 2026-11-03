import assert from "node:assert/strict";
import { mock, test } from "node:test";

const databaseUrl = process.env.TEST_TEAMS_MIGRATION_DATABASE_URL;
test("native team invitations and project links preserve scope, delivery and terminal audit", {
  skip: !databaseUrl,
}, async () => {
  const url = new URL(databaseUrl ?? "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.equal(url.pathname, "/loftlancer_teams_918");
  process.env.DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL_POOLED = databaseUrl;
  let rejectDelivery = false;
  const deliveries: string[] = [];
  mock.module("@loftlancer/auth/organization-invitation-email", {
    namedExports: {
      sendOrganizationInvitationEmail: async (input: { email: string }) => {
        if (rejectDelivery) throw new Error("mail provider credential secret");
        deliveries.push(input.email);
      },
    },
  });
  const { db } = await import("@loftlancer/db");
  const { user } = await import("@loftlancer/db/schema/auth");
  const { organization, member, invitation } = await import(
    "@loftlancer/db/schema/organization"
  );
  const { project } = await import("@loftlancer/db/schema/projects");
  const { projectTeam, projectMemberGrant } = await import(
    "@loftlancer/db/schema/project-access"
  );
  const { teamMember } = await import("@loftlancer/db/schema/team");
  const { auditEvent } = await import("@loftlancer/db/schema/audit-event");
  const { and, eq } = await import("drizzle-orm");
  const { teamCreateController } = await import(
    "../controller/server.team-create.controller"
  );
  const { teamInvitationCreateController: invite } = await import(
    "../controller/server.team-invitation-create.controller"
  );
  const { teamInvitationListController: list } = await import(
    "../controller/server.team-invitation-list.controller"
  );
  const { teamInvitationContextController: context } = await import(
    "../controller/server.team-invitation-context.controller"
  );
  const { teamInvitationResendController: resend } = await import(
    "../controller/server.team-invitation-resend.controller"
  );
  const { teamInvitationRevokeController: revoke } = await import(
    "../controller/server.team-invitation-revoke.controller"
  );
  const { teamProjectAssignController: assign } = await import(
    "../controller/server.team-project-assign.controller"
  );
  const { teamProjectRemoveController: remove } = await import(
    "../controller/server.team-project-remove.controller"
  );
  const owner = crypto.randomUUID();
  const basic = crypto.randomUUID();
  const orgId = crypto.randomUUID();
  const otherOrg = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  const foreignProject = crypto.randomUUID();
  await db.insert(user).values([
    { id: owner, name: "Team migration owner", email: `${owner}@teams.local` },
    { id: basic, name: "Team member", email: `${basic}@teams.local` },
  ]);
  await db.insert(organization).values([
    { id: orgId, name: "Team migration", slug: `migration-${orgId}` },
    { id: otherOrg, name: "Other", slug: `migration-${otherOrg}` },
  ]);
  await db.insert(member).values([
    {
      id: crypto.randomUUID(),
      userId: owner,
      organizationId: orgId,
      role: "owner",
    },
    {
      id: crypto.randomUUID(),
      userId: owner,
      organizationId: otherOrg,
      role: "owner",
    },
    {
      id: crypto.randomUUID(),
      userId: basic,
      organizationId: orgId,
      role: "member",
    },
  ]);
  await db.insert(project).values([
    {
      id: projectId,
      userId: owner,
      organizationId: orgId,
      name: "Migration project",
      slug: `p-${projectId}`,
    },
    {
      id: foreignProject,
      userId: owner,
      organizationId: otherOrg,
      name: "Foreign project",
      slug: `p-${foreignProject}`,
    },
  ]);
  const ctx = {
    userId: owner,
    orgId,
    ip: "127.0.0.1",
    userAgent: "teams-migration-test",
  };
  const object = <T>(response: { status: string; data: T | T[] | null }) => {
    assert.equal(response.status, "success");
    assert.ok(response.data && !Array.isArray(response.data));
    return response.data as T;
  };
  try {
    const teamId = object(
      await teamCreateController({ ctx, input: { name: "Migration team" } }),
    ).id;
    const otherTeam = object(
      await teamCreateController({
        ctx: { ...ctx, orgId: otherOrg },
        input: { name: "Foreign team" },
      }),
    ).id;
    await db.insert(teamMember).values({
      id: crypto.randomUUID(),
      teamId,
      userId: basic,
      role: "member",
      addedBy: owner,
    });
    assert.equal(
      (await assign({ ctx, input: { teamId, projectId } })).status,
      "success",
    );
    assert.equal(
      (await assign({ ctx, input: { teamId, projectId: foreignProject } }))
        .status,
      "failed",
    );
    const [grant] = await db
      .select()
      .from(projectMemberGrant)
      .where(
        and(
          eq(projectMemberGrant.projectId, projectId),
          eq(projectMemberGrant.userId, basic),
        ),
      );
    assert.ok(grant?.grants.length);
    assert.equal(
      (await remove({ ctx, input: { teamId, projectId } })).status,
      "success",
    );
    const [link] = await db
      .select()
      .from(projectTeam)
      .where(
        and(
          eq(projectTeam.projectId, projectId),
          eq(projectTeam.teamId, teamId),
        ),
      );
    assert.ok(link?.deletedAt);
    assert.equal(
      (await assign({ ctx, input: { teamId, projectId } })).status,
      "success",
    );
    assert.equal(
      (await invite({ ctx, input: { teamId, email: "invalid" } })).status,
      "failed",
    );
    assert.equal(
      (
        await invite({
          ctx: { ...ctx, userId: basic },
          input: { teamId, email: "denied@teams.local" },
        })
      ).status,
      "failed",
    );
    assert.equal(
      (await invite({ ctx, input: { teamId, email: `${basic}@teams.local` } }))
        .status,
      "failed",
    );
    const email = `qa-${crypto.randomUUID()}@teams.local`;
    const invitationId = object(
      await invite({
        ctx,
        input: { teamId, email: ` ${email.toUpperCase()} ` },
      }),
    ).id;
    assert.equal(deliveries.length, 1);
    assert.equal(
      (await invite({ ctx, input: { teamId, email } })).status,
      "failed",
    );
    assert.equal(deliveries.length, 1);
    assert.equal(
      (await resend({ ctx, input: { teamId: otherTeam, invitationId } }))
        .status,
      "failed",
    );
    assert.equal(
      (await revoke({ ctx, input: { teamId: otherTeam, invitationId } }))
        .status,
      "failed",
    );
    assert.equal(
      (await list({ ctx, input: { teamId: otherTeam } })).status,
      "failed",
    );
    const rows = object(
      await list({
        ctx,
        input: { teamId, status: "all", search: "migration owner" },
      }),
    );
    assert.equal(rows.total, 1);
    assert.deepEqual(rows.rows[0]?.linkedProjects, ["Migration project"]);
    const preview = object(await context({ ctx, input: { teamId } }));
    assert.ok(preview.memberEmails.includes(`${basic}@teams.local`));
    assert.ok(preview.pendingEmails.includes(email));
    assert.equal(
      (await resend({ ctx, input: { teamId, invitationId } })).status,
      "success",
    );
    assert.equal(deliveries.length, 2);
    assert.equal(
      (await revoke({ ctx, input: { teamId, invitationId } })).status,
      "success",
    );
    assert.equal(
      (await resend({ ctx, input: { teamId, invitationId } })).status,
      "failed",
    );
    assert.equal(deliveries.length, 2);
    rejectDelivery = true;
    const failedEmail = `failed-${crypto.randomUUID()}@teams.local`;
    const failure = await invite({
      ctx,
      input: { teamId, email: failedEmail },
    });
    assert.equal(failure.status, "error");
    assert.ok(!JSON.stringify(failure).includes("credential"));
    const [cancelled] = await db
      .select()
      .from(invitation)
      .where(eq(invitation.email, failedEmail));
    assert.equal(cancelled?.status, "canceled");
    const events = await db
      .select()
      .from(auditEvent)
      .where(eq(auditEvent.organizationId, orgId));
    const invites = events.filter((e) => e.action === "member.invite");
    assert.equal(invites.length, 9); // create attempts and resend attempts, including denied and failed
    assert.ok(invites.some((e) => e.result === "denied"));
    const createdEvent = invites.find(
      (e) => e.entityId === invitationId && e.result === "success",
    );
    assert.ok(createdEvent);
    assert.equal(createdEvent.payload?.teamId, teamId);
    assert.ok(invites.some((e) => e.result === "failure"));
    assert.ok(events.every((e) => e.ipAddress === ctx.ip));
    assert.equal(
      events.filter((e) => e.action === "project.assign_team").length,
      4,
    );
    assert.ok(!events.some((e) => e.action === "member.list"));
  } finally {
    await db.delete(organization).where(eq(organization.id, orgId));
    await db.delete(organization).where(eq(organization.id, otherOrg));
    await db.delete(user).where(eq(user.id, owner));
    await db.delete(user).where(eq(user.id, basic));
  }
});
