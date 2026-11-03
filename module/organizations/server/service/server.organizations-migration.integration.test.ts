import assert from "node:assert/strict";
import { mock, test } from "node:test";

const databaseUrl = process.env.TEST_ORGANIZATIONS_DATABASE_URL;

test("organization migration controllers preserve invitations, member removal, and role assignment availability", {
  skip: !databaseUrl,
}, async () => {
  const url = new URL(databaseUrl ?? "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.equal(url.pathname, "/loftlancer_organizations_929");
  process.env.DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL_POOLED = databaseUrl;

  const deliveries: string[] = [];
  mock.module(
    "@features/authentication/core/server/authentication.organization-invitation-email",
    {
      namedExports: {
        sendOrganizationInvitationEmail: async (input: { email: string }) => {
          deliveries.push(input.email);
        },
      },
    },
  );

  const { db } = await import("@loftlancer/drizzle");
  const { user } = await import("@loftlancer/drizzle/schema/auth");
  const { invitation, member, organization } = await import(
    "@loftlancer/drizzle/schema/organization"
  );
  const { and, eq, isNull } = await import("drizzle-orm");
  const { organizationInvitationCreateController } = await import(
    "../controller/server.organization-invitation-create.controller"
  );
  const { organizationMemberRemoveController } = await import(
    "../controller/server.organization-member-remove.controller"
  );
  const { organizationRoleAssignController } = await import(
    "../controller/server.organization-roles.controller"
  );

  const ownerId = crypto.randomUUID();
  const targetId = crypto.randomUUID();
  const organizationId = crypto.randomUUID();
  const ownerMemberId = crypto.randomUUID();
  const targetMemberId = crypto.randomUUID();
  const context = {
    userId: ownerId,
    orgId: organizationId,
    ip: "127.0.0.1",
    userAgent: "organizations-migration-test",
  };

  await db.insert(user).values([
    {
      id: ownerId,
      name: "Organization migration owner",
      email: `${ownerId}@organizations.local`,
    },
    {
      id: targetId,
      name: "Organization migration member",
      email: `${targetId}@organizations.local`,
    },
  ]);
  await db.insert(organization).values({
    id: organizationId,
    name: "Organization migration fixture",
    slug: `migration-${organizationId}`,
  });
  await db.insert(member).values([
    {
      id: ownerMemberId,
      userId: ownerId,
      organizationId,
      role: "owner",
    },
    {
      id: targetMemberId,
      userId: targetId,
      organizationId,
      role: "member",
    },
  ]);

  try {
    const inviteEmail = `invite-${crypto.randomUUID()}@organizations.local`;
    const created = await organizationInvitationCreateController({
      ctx: context,
      input: { organizationId, email: inviteEmail, role: "member" },
    });
    assert.equal(created.status, "success");
    assert.deepEqual(deliveries, [inviteEmail]);
    const [storedInvitation] = await db
      .select({ status: invitation.status })
      .from(invitation)
      .where(
        and(
          eq(invitation.organizationId, organizationId),
          eq(invitation.email, inviteEmail),
        ),
      );
    assert.equal(storedInvitation?.status, "pending");

    const removed = await organizationMemberRemoveController({
      ctx: context,
      input: { userId: targetId },
    });
    assert.equal(removed.status, "success");
    const [remainingTarget] = await db
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.id, targetMemberId), isNull(member.deletedAt)));
    assert.equal(remainingTarget, undefined);

    const roleAssignment = await organizationRoleAssignController({
      ctx: context,
      input: { memberId: ownerMemberId, roleId: crypto.randomUUID() },
    });
    assert.equal(roleAssignment.status, "failed");
    assert.match(
      roleAssignment.message,
      /Custom organization roles are not available/,
    );
  } finally {
    await db.delete(organization).where(eq(organization.id, organizationId));
    await db.delete(user).where(eq(user.id, ownerId));
    await db.delete(user).where(eq(user.id, targetId));
  }
});
