import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

const PLACEHOLDER_ENCRYPTED_VALUE = "ci-test-export-placeholder-ciphertext";

type DbIntegrationConfig =
  | { enabled: true; testDatabaseUrl: string }
  | { enabled: false; skipReason: string };

function resolveDbIntegrationConfig(): DbIntegrationConfig {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();
  const runFlag = process.env.RUN_DB_INTEGRATION_TESTS === "1";

  if (!testDatabaseUrl && !runFlag) {
    return {
      enabled: false,
      skipReason:
        "Set TEST_DATABASE_URL or RUN_DB_INTEGRATION_TESTS=1 to run DB integration tests",
    };
  }

  if (!testDatabaseUrl) {
    return {
      enabled: false,
      skipReason:
        "TEST_DATABASE_URL is required for DB integration tests (DATABASE_URL is not used)",
    };
  }

  return { enabled: true, testDatabaseUrl };
}

const integrationConfig = resolveDbIntegrationConfig();
const describeIntegration = integrationConfig.enabled
  ? describe
  : describe.skip;

describeIntegration(
  "account.exportData integration",
  { concurrency: 1 },
  () => {
    let databaseAvailable = false;
    const runId = randomUUID().slice(0, 8);
    const testUserId = `export-ac39-user-${runId}`;
    const activeProjectId = `export-ac39-proj-active-${runId}`;
    const deletedProjectId = `export-ac39-proj-deleted-${runId}`;
    const activeEnvId = `export-ac39-env-active-${runId}`;
    const deletedEnvId = `export-ac39-env-deleted-${runId}`;
    const activeVarId = `export-ac39-var-active-${runId}`;
    const deletedVarId = `export-ac39-var-deleted-${runId}`;
    const activeNotificationId = `export-ac39-notif-active-${runId}`;
    const deletedNotificationId = `export-ac39-notif-deleted-${runId}`;

    let db: typeof import("@loftlancer/drizzle").db;
    let activeEnvironmentVariableWhere: typeof import("@loftlancer/drizzle").activeEnvironmentVariableWhere;
    let activeEnvironmentWhere: typeof import("@loftlancer/drizzle").activeEnvironmentWhere;
    let activeNotificationWhere: typeof import("@loftlancer/drizzle").activeNotificationWhere;
    let activeProjectWhere: typeof import("@loftlancer/drizzle").activeProjectWhere;
    let user: typeof import("@loftlancer/drizzle/schema/auth").user;
    let notification: typeof import("@loftlancer/drizzle/schema/notifications").notification;
    let environment: typeof import("@loftlancer/drizzle/schema/projects").environment;
    let environmentVariable: typeof import("@loftlancer/drizzle/schema/projects").environmentVariable;
    let project: typeof import("@loftlancer/drizzle/schema/projects").project;
    let eq: typeof import("drizzle-orm").eq;
    let inArray: typeof import("drizzle-orm").inArray;
    let appRouter: typeof import("./index").appRouter;
    type Context = import("../core/orpc.create-context").Context;

    function exportQueriesForUser(userId: string) {
      return {
        projects: () =>
          db
            .select({ id: project.id })
            .from(project)
            .where(activeProjectWhere(eq(project.userId, userId))),
        notifications: () =>
          db
            .select({ id: notification.id })
            .from(notification)
            .where(
              activeNotificationWhere(eq(notification.recipientUserId, userId)),
            ),
        environments: (projectIds: string[]) =>
          projectIds.length === 0
            ? Promise.resolve([])
            : db
                .select({ id: environment.id })
                .from(environment)
                .where(
                  activeEnvironmentWhere(
                    inArray(environment.projectId, projectIds),
                  ),
                ),
        variables: (environmentIds: string[]) =>
          environmentIds.length === 0
            ? Promise.resolve([])
            : db
                .select({
                  id: environmentVariable.id,
                  key: environmentVariable.key,
                })
                .from(environmentVariable)
                .where(
                  activeEnvironmentVariableWhere(
                    inArray(environmentVariable.environmentId, environmentIds),
                  ),
                ),
      };
    }

    before(async () => {
      if (!integrationConfig.enabled) {
        return;
      }

      process.env.SKIP_ENV_VALIDATION = "1";
      process.env.DATABASE_URL = integrationConfig.testDatabaseUrl;

      const dbModule = await import("@loftlancer/drizzle");
      db = dbModule.db;
      activeEnvironmentVariableWhere = dbModule.activeEnvironmentVariableWhere;
      activeEnvironmentWhere = dbModule.activeEnvironmentWhere;
      activeNotificationWhere = dbModule.activeNotificationWhere;
      activeProjectWhere = dbModule.activeProjectWhere;

      const authSchema = await import("@loftlancer/drizzle/schema/auth");
      user = authSchema.user;
      const notificationsSchema = await import(
        "@loftlancer/drizzle/schema/notifications"
      );
      notification = notificationsSchema.notification;
      const projectsSchema = await import(
        "@loftlancer/drizzle/schema/projects"
      );
      environment = projectsSchema.environment;
      environmentVariable = projectsSchema.environmentVariable;
      project = projectsSchema.project;

      const drizzleOrm = await import("drizzle-orm");
      eq = drizzleOrm.eq;
      inArray = drizzleOrm.inArray;

      const routerModule = await import("./index");
      appRouter = routerModule.appRouter;

      try {
        await db.select({ id: user.id }).from(user).limit(1);
        databaseAvailable = true;
      } catch {
        databaseAvailable = false;
        return;
      }

      const deletedAt = new Date();
      await db.insert(user).values({
        id: testUserId,
        name: "Export AC39 Test",
        email: `export-ac39-${runId}@users.test.local`,
      });

      await db.insert(project).values([
        {
          id: activeProjectId,
          name: "Active project",
          slug: `active-${runId}`,
          userId: testUserId,
        },
        {
          id: deletedProjectId,
          name: "Deleted project",
          slug: `deleted-${runId}`,
          userId: testUserId,
          deletedAt,
          deletedBy: testUserId,
        },
      ]);

      await db.insert(environment).values([
        {
          id: activeEnvId,
          name: "Active env",
          slug: `active-env-${runId}`,
          projectId: activeProjectId,
        },
        {
          id: deletedEnvId,
          name: "Deleted env",
          slug: `deleted-env-${runId}`,
          projectId: activeProjectId,
          deletedAt,
          deletedBy: testUserId,
        },
      ]);

      await db.insert(environmentVariable).values([
        {
          id: activeVarId,
          key: `ACTIVE_KEY_${runId}`,
          encryptedValue: PLACEHOLDER_ENCRYPTED_VALUE,
          environmentId: activeEnvId,
        },
        {
          id: deletedVarId,
          key: `DELETED_KEY_${runId}`,
          encryptedValue: PLACEHOLDER_ENCRYPTED_VALUE,
          environmentId: activeEnvId,
          deletedAt,
          deletedBy: testUserId,
        },
      ]);

      await db.insert(notification).values([
        {
          id: activeNotificationId,
          recipientUserId: testUserId,
          type: "export_ac39_active",
          data: {},
        },
        {
          id: deletedNotificationId,
          recipientUserId: testUserId,
          type: "export_ac39_deleted",
          data: {},
          deletedAt,
          deletedBy: testUserId,
        },
      ]);
    });

    after(async () => {
      if (!integrationConfig.enabled || !databaseAvailable) {
        return;
      }
      await db
        .delete(environmentVariable)
        .where(inArray(environmentVariable.id, [activeVarId, deletedVarId]));
      await db
        .delete(environment)
        .where(inArray(environment.id, [activeEnvId, deletedEnvId]));
      await db
        .delete(notification)
        .where(
          inArray(notification.id, [
            activeNotificationId,
            deletedNotificationId,
          ]),
        );
      await db
        .delete(project)
        .where(inArray(project.id, [activeProjectId, deletedProjectId]));
      await db.delete(user).where(eq(user.id, testUserId));
    });

    it("omits soft-deleted rows from export-shaped selects when SOFT_DELETES_ENABLED is on", async (t) => {
      if (!databaseAvailable) {
        t.skip("TEST_DATABASE_URL database not reachable");
        return;
      }

      const prev = process.env.SOFT_DELETES_ENABLED;
      process.env.SOFT_DELETES_ENABLED = "true";

      try {
        const queries = exportQueriesForUser(testUserId);
        const projects = await queries.projects();
        const notifications = await queries.notifications();
        const projectIds = projects.map((row) => row.id);
        const environments = await queries.environments(projectIds);
        const environmentIds = environments.map((row) => row.id);
        const variables = await queries.variables(environmentIds);

        assert.deepEqual(
          projects.map((row) => row.id).sort(),
          [activeProjectId].sort(),
        );
        assert.deepEqual(
          notifications.map((row) => row.id).sort(),
          [activeNotificationId].sort(),
        );
        assert.deepEqual(
          environments.map((row) => row.id).sort(),
          [activeEnvId].sort(),
        );
        assert.deepEqual(
          variables.map((row) => row.id).sort(),
          [activeVarId].sort(),
        );
        for (const row of variables) {
          assert.notEqual(
            (row as { encryptedValue?: string }).encryptedValue,
            PLACEHOLDER_ENCRYPTED_VALUE,
          );
        }
      } finally {
        if (prev === undefined) {
          delete process.env.SOFT_DELETES_ENABLED;
        } else {
          process.env.SOFT_DELETES_ENABLED = prev;
        }
      }
    });

    it("includes soft-deleted rows in export-shaped selects when SOFT_DELETES_ENABLED is off", async (t) => {
      if (!databaseAvailable) {
        t.skip("TEST_DATABASE_URL database not reachable");
        return;
      }

      const prev = process.env.SOFT_DELETES_ENABLED;
      process.env.SOFT_DELETES_ENABLED = "false";

      try {
        const queries = exportQueriesForUser(testUserId);
        const projects = await queries.projects();
        const notifications = await queries.notifications();
        const projectIds = projects.map((row) => row.id);
        const environments = await queries.environments(projectIds);
        const environmentIds = environments.map((row) => row.id);
        const variables = await queries.variables(environmentIds);

        assert.ok(projects.some((row) => row.id === deletedProjectId));
        assert.ok(
          notifications.some((row) => row.id === deletedNotificationId),
        );
        assert.ok(environments.some((row) => row.id === deletedEnvId));
        assert.ok(variables.some((row) => row.id === deletedVarId));
      } finally {
        if (prev === undefined) {
          delete process.env.SOFT_DELETES_ENABLED;
        } else {
          process.env.SOFT_DELETES_ENABLED = prev;
        }
      }
    });

    it("account.exportData mutation omits soft-deleted entities when SOFT_DELETES_ENABLED is on", async (t) => {
      if (!databaseAvailable) {
        t.skip("TEST_DATABASE_URL database not reachable");
        return;
      }

      const prevSoftDeletes = process.env.SOFT_DELETES_ENABLED;
      const prevAudit = process.env.ACTIONS_AUDIT_ENABLED;
      process.env.SOFT_DELETES_ENABLED = "true";
      process.env.ACTIONS_AUDIT_ENABLED = "false";

      try {
        const ctx: Context = {
          session: {
            user: {
              id: testUserId,
              email: `export-ac39-${runId}@users.test.local`,
              name: "Export AC39 Test",
              emailVerified: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            session: {
              id: `session-${runId}`,
              userId: testUserId,
              token: `token-${runId}`,
              createdAt: new Date(),
              updatedAt: new Date(),
              expiresAt: new Date(Date.now() + 60_000),
            },
          },
        };
        const caller = appRouter.createCaller(ctx);

        const payload = await caller.account.exportData();

        const projectIds = payload.projects.map((row) => row.id);
        const notificationIds = payload.notifications.map((row) => row.id);
        const environmentIds = payload.environments.map((row) => row.id);
        const variableIds = payload.variables.map((row) => row.id);

        assert.ok(projectIds.includes(activeProjectId));
        assert.ok(!projectIds.includes(deletedProjectId));
        assert.ok(notificationIds.includes(activeNotificationId));
        assert.ok(!notificationIds.includes(deletedNotificationId));
        assert.ok(environmentIds.includes(activeEnvId));
        assert.ok(!environmentIds.includes(deletedEnvId));
        assert.ok(variableIds.includes(activeVarId));
        assert.ok(!variableIds.includes(deletedVarId));

        assert.doesNotMatch(
          JSON.stringify(payload.variables),
          new RegExp(PLACEHOLDER_ENCRYPTED_VALUE),
        );
        for (const row of payload.variables) {
          assert.equal("encryptedValue" in row, false);
          assert.equal("value" in row, false);
        }
      } finally {
        if (prevSoftDeletes === undefined) {
          delete process.env.SOFT_DELETES_ENABLED;
        } else {
          process.env.SOFT_DELETES_ENABLED = prevSoftDeletes;
        }
        if (prevAudit === undefined) {
          delete process.env.ACTIONS_AUDIT_ENABLED;
        } else {
          process.env.ACTIONS_AUDIT_ENABLED = prevAudit;
        }
      }
    });
  },
);
