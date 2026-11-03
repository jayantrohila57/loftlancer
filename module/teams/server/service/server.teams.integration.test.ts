import assert from "node:assert/strict";
import { test } from "node:test";

const databaseUrl = process.env.TEST_TEAMS_DATABASE_URL;
test("teams list/get/create and membership invariants against isolated Postgres", {
  skip: !databaseUrl,
}, async () => {
  const url = new URL(databaseUrl ?? "");
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.match(url.pathname, /^\/loftlancer_teams_916$/);
  process.env.DATABASE_URL = databaseUrl;
  process.env.DATABASE_URL_POOLED = databaseUrl;
  const { db } = await import("@loftlancer/drizzle");
  const { user } = await import("@loftlancer/drizzle/schema/auth");
  const { organization, member } = await import(
    "@loftlancer/drizzle/schema/organization"
  );
  const { teamMember } = await import("@loftlancer/drizzle/schema/team");
  const { auditEvent } = await import("@loftlancer/drizzle/schema/audit-event");
  const { eq } = await import("drizzle-orm");
  const { teamCreateController } = await import(
    "../controller/server.team-create.controller"
  );
  const { teamListController } = await import(
    "../controller/server.team-list.controller"
  );
  const { teamGetController } = await import(
    "../controller/server.team-get.controller"
  );
  const { teamMemberRemoveController } = await import(
    "../controller/server.team-member-remove.controller"
  );
  const { teamDeleteController } = await import(
    "../controller/server.team-delete.controller"
  );
  const { teamRestoreController } = await import(
    "../controller/server.team-restore.controller"
  );
  const id = crypto.randomUUID();
  const orgId = crypto.randomUUID();
  const otherOrg = crypto.randomUUID();
  await db
    .insert(user)
    .values({ id, name: "Teams QA", email: `${id}@teams.local` });
  await db.insert(organization).values([
    { id: orgId, name: "Teams QA", slug: `teams-${orgId}` },
    { id: otherOrg, name: "Other", slug: `teams-${otherOrg}` },
  ]);
  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    userId: id,
    role: "owner",
  });
  await db.insert(member).values({
    id: crypto.randomUUID(),
    organizationId: otherOrg,
    userId: id,
    role: "owner",
  });
  const ctx = {
    userId: id,
    orgId,
    ip: "127.0.0.1",
    userAgent: "teams-integration",
  };
  try {
    const empty = await teamListController({ ctx });
    assert.equal(empty.status, "success");
    assert.deepEqual(empty.data, []);
    const created = await teamCreateController({
      ctx,
      input: { name: " Platform ", purpose: "Shipping" },
    });
    assert.equal(created.status, "success");
    assert.ok(created.data && !Array.isArray(created.data));
    const teamId = created.data.id;
    const leads = await db
      .select()
      .from(teamMember)
      .where(eq(teamMember.teamId, teamId));
    assert.equal(leads.length, 1);
    assert.equal(leads[0]?.role, "lead");
    const loaded = await teamGetController({ ctx, input: { teamId } });
    assert.equal(loaded.status, "success");
    assert.ok(loaded.data && !Array.isArray(loaded.data));
    assert.equal(loaded.data.name, "Platform");
    const crossOrg = await teamGetController({
      ctx: { ...ctx, orgId: otherOrg },
      input: { teamId },
    });
    assert.equal(crossOrg.status, "failed");
    assert.equal(crossOrg.data, null);
    const invalid = await teamCreateController({ ctx, input: { name: "" } });
    assert.equal(invalid.status, "failed");
    const lastLead = await teamMemberRemoveController({
      ctx,
      input: { teamId, userId: id },
    });
    assert.equal(lastLead.status, "failed");
    assert.match(lastLead.message, /at least one lead/);
    const removed = await teamDeleteController({ ctx, input: { teamId } });
    assert.equal(removed.status, "success");
    const missing = await teamGetController({ ctx, input: { teamId } });
    assert.equal(missing.status, "failed");
    const restored = await teamRestoreController({ ctx, input: { teamId } });
    assert.equal(restored.status, "success");
    const restoredGet = await teamGetController({ ctx, input: { teamId } });
    assert.equal(restoredGet.status, "success");
    const events = await db
      .select()
      .from(auditEvent)
      .where(eq(auditEvent.organizationId, orgId));
    const creates = events.filter((event) => event.action === "team.create");
    assert.equal(creates.length, 2);
    assert.deepEqual(creates.map((event) => event.result).sort(), [
      "failure",
      "success",
    ]);
    assert.ok(events.every((event) => event.ipAddress === ctx.ip));
  } finally {
    await db.delete(organization).where(eq(organization.id, orgId));
    await db.delete(organization).where(eq(organization.id, otherOrg));
    await db.delete(user).where(eq(user.id, id));
  }
});
