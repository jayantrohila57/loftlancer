import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { notification } from "../src/schema/notifications";
import {
  environment,
  environmentVariable,
  project,
} from "../src/schema/projects";
import {
  activeEnvironmentVariableWhere,
  activeEnvironmentWhere,
  activeNotificationWhere,
  activeProjectWhere,
} from "../src/utils/drizzle.soft-delete";

describe("active*Where helpers", () => {
  it("omit deleted_at filter when soft deletes are disabled", () => {
    const prev = process.env.SOFT_DELETES_ENABLED;
    process.env.SOFT_DELETES_ENABLED = "false";

    const projectWhere = activeProjectWhere(eq(project.userId, "user-1"));
    assert.equal(String(projectWhere), String(eq(project.userId, "user-1")));

    const envWhere = activeEnvironmentWhere(
      eq(environment.projectId, "project-1"),
    );
    assert.equal(
      String(envWhere),
      String(eq(environment.projectId, "project-1")),
    );

    const variableWhere = activeEnvironmentVariableWhere(
      eq(environmentVariable.environmentId, "env-1"),
    );
    assert.equal(
      String(variableWhere),
      String(eq(environmentVariable.environmentId, "env-1")),
    );

    const notificationWhere = activeNotificationWhere(
      eq(notification.recipientUserId, "user-1"),
    );
    assert.equal(
      String(notificationWhere),
      String(eq(notification.recipientUserId, "user-1")),
    );

    if (prev === undefined) {
      delete process.env.SOFT_DELETES_ENABLED;
    } else {
      process.env.SOFT_DELETES_ENABLED = prev;
    }
  });

  it("merge soft-delete filters when soft deletes are enabled", () => {
    const prev = process.env.SOFT_DELETES_ENABLED;
    process.env.SOFT_DELETES_ENABLED = "true";

    const userFilter = eq(project.userId, "user-1");
    assert.notStrictEqual(activeProjectWhere(userFilter), userFilter);
    assert.notStrictEqual(
      activeEnvironmentWhere(eq(environment.projectId, "project-1")),
      eq(environment.projectId, "project-1"),
    );
    assert.notStrictEqual(
      activeEnvironmentVariableWhere(
        eq(environmentVariable.environmentId, "env-1"),
      ),
      eq(environmentVariable.environmentId, "env-1"),
    );
    assert.notStrictEqual(
      activeNotificationWhere(eq(notification.recipientUserId, "user-1")),
      eq(notification.recipientUserId, "user-1"),
    );

    if (prev === undefined) {
      delete process.env.SOFT_DELETES_ENABLED;
    } else {
      process.env.SOFT_DELETES_ENABLED = prev;
    }
  });
});
