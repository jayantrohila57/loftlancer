import {
  APP_RETENTION_DAYS,
  appRegistry,
  getAppManifest,
  resolveAppSettings,
} from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import { user } from "@loftlancer/db/schema/auth";
import { projectTeam } from "@loftlancer/db/schema/project-access";
import { projectApp } from "@loftlancer/db/schema/project-app";
import { projectAppAccess } from "@loftlancer/db/schema/project-app-access";
import { project } from "@loftlancer/db/schema/projects";
import { team, teamMember } from "@loftlancer/db/schema/team";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { projectIdFromInput } from "../actions/guard-resolve";
import { requireAction } from "../actions/require-action";
import { resolveProjectAppStatus } from "../apps/project-app-status";
import { orgProcedure, router } from "../index";
import { assertProjectAccess } from "../org-access";
import { loadProjectAccessSummary } from "../project-access/service";

const appInput = z.object({
  projectId: z.string().min(1),
  appId: z.string().min(1),
});

async function loadProject(projectId: string) {
  const [row] = await db
    .select({ id: project.id, organizationId: project.organizationId })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);
  if (!row)
    throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
  return row;
}

function requireManifest(appId: string) {
  const manifest = getAppManifest(appId);
  if (!manifest)
    throw new TRPCError({ code: "NOT_FOUND", message: "Unknown app" });
  return manifest;
}

export const projectAppsRouter = router({
  /** Catalog merged with this project's install state. */
  list: orgProcedure
    .input(z.object({ projectId: z.string().min(1) }))
    .use(actionGuard("project.app.list", projectIdFromInput))
    .query(async ({ ctx, input }) => {
      const rows = await db
        .select()
        .from(projectApp)
        .where(eq(projectApp.projectId, input.projectId));
      let canManageAccess = false;
      try {
        await requireAction("project.app.configure", {
          userId: ctx.session.user.id,
          organizationId: ctx.activeOrganizationId ?? null,
          projectId: input.projectId,
          audit: false,
        });
        canManageAccess = true;
      } catch {
        // A normal app user can still see app entries but not manage access.
      }
      return Promise.all(
        appRegistry.map(async (m) => {
          const row = rows.find((r) => r.appId === m.id);
          let canAccess = false;
          const readAction = m.nav[0]?.action;
          if (row?.status === "active" && readAction) {
            try {
              await requireAction(readAction, {
                userId: ctx.session.user.id,
                organizationId: ctx.activeOrganizationId ?? null,
                projectId: input.projectId,
                audit: false,
              });
              canAccess = true;
            } catch {
              // The UI only opens apps that the same server guard would allow.
            }
          }
          return {
            id: m.id,
            name: m.name,
            description: m.description,
            icon: m.icon,
            category: m.category,
            permissions: [...m.permissions],
            dataCreated: [...m.dataCreated],
            nav: m.nav.map((n) => ({ path: n.path, label: n.label })),
            status: resolveProjectAppStatus(row?.status),
            accessMode:
              row?.accessMode === "restricted" ? "restricted" : "inherited",
            canManageAccess,
            canAccess,
            installedAt: row?.installedAt ?? null,
            purgeAfter: row?.status === "uninstalled" ? row.purgeAfter : null,
            settingsSchema: m.settings.map((d) => ({
              key: d.key,
              label: d.label,
              description: d.description,
              options: d.options.map((o) => ({
                value: o.value,
                label: o.label,
              })),
              default: d.default,
            })),
            settings: resolveAppSettings(m, row?.settings),
            installedBy: row?.installedBy ?? null,
          };
        }),
      );
    }),

  accessSummary: orgProcedure
    .input(appInput)
    .use(actionGuard("project.app.configure", projectIdFromInput))
    .query(async ({ input }) => {
      const app = await loadActiveProjectApp(input.projectId, input.appId);
      const [users, teams, teamMembers, projectSummary] = await Promise.all([
        db
          .select({
            id: projectAppAccess.id,
            userId: projectAppAccess.userId,
            name: user.name,
            email: user.email,
          })
          .from(projectAppAccess)
          .innerJoin(user, eq(projectAppAccess.userId, user.id))
          .where(
            and(
              eq(projectAppAccess.projectAppId, app.id),
              isNull(projectAppAccess.deletedAt),
            ),
          ),
        db
          .select({
            id: projectAppAccess.id,
            teamId: projectAppAccess.teamId,
            name: team.name,
          })
          .from(projectAppAccess)
          .innerJoin(team, eq(projectAppAccess.teamId, team.id))
          .where(
            and(
              eq(projectAppAccess.projectAppId, app.id),
              isNull(projectAppAccess.deletedAt),
            ),
          ),
        db
          .select({
            userId: teamMember.userId,
            teamId: team.id,
            teamName: team.name,
          })
          .from(projectAppAccess)
          .innerJoin(team, eq(projectAppAccess.teamId, team.id))
          .innerJoin(teamMember, eq(teamMember.teamId, team.id))
          .innerJoin(
            projectTeam,
            and(
              eq(projectTeam.teamId, team.id),
              eq(projectTeam.projectId, input.projectId),
              eq(projectTeam.organizationId, app.organizationId ?? ""),
              isNull(projectTeam.deletedAt),
            ),
          )
          .where(
            and(
              eq(projectAppAccess.projectAppId, app.id),
              isNull(projectAppAccess.deletedAt),
              eq(team.organizationId, app.organizationId ?? ""),
              isNull(team.deletedAt),
            ),
          ),
        loadProjectAccessSummary(input.projectId),
      ]);
      const assignedUserIds = new Set(users.map((row) => row.userId));
      const linkedTeams = new Map(
        projectSummary.teams.map((row) => [row.teamId, row.teamName]),
      );
      const appTeamsByUser = new Map<string, Set<string>>();
      for (const row of teamMembers) {
        const names = appTeamsByUser.get(row.userId) ?? new Set<string>();
        names.add(row.teamName);
        appTeamsByUser.set(row.userId, names);
      }
      const effectivePeople = projectSummary.accessPeople.map((person) => {
        const appTeams = [...(appTeamsByUser.get(person.userId) ?? [])].map(
          (name) => `Team: ${name}`,
        );
        const direct = assignedUserIds.has(person.userId);
        const inherited = app.accessMode !== "restricted";
        const manager =
          person.role === "owner" ||
          person.role === "manager" ||
          person.userId === projectSummary.creatorUserId ||
          projectSummary.managers.some((row) => row.userId === person.userId);
        const projectCanReadApp = person.effectiveActions.includes(
          input.appId === "tasks" ? "tasks.task.read" : "environment.read",
        );
        const canAccess =
          projectCanReadApp &&
          (inherited || manager || direct || appTeams.length > 0);
        return {
          userId: person.userId,
          name: person.name,
          email: person.email,
          role: person.role,
          projectSources: person.sources,
          projectCanReadApp,
          appSources: inherited
            ? person.sources
            : [
                ...(manager ? ["Project manager access"] : []),
                ...(direct ? ["Direct app assignment"] : []),
                ...appTeams,
              ],
          canAccess,
        };
      });
      return {
        accessMode:
          app.accessMode === "restricted" ? "restricted" : "inherited",
        directUsers: users,
        teams: teams.map((row) => ({
          ...row,
          linkedToProject: row.teamId ? linkedTeams.has(row.teamId) : false,
        })),
        effectivePeople,
      };
    }),

  setAccessMode: orgProcedure
    .input(appInput.extend({ mode: z.enum(["inherited", "restricted"]) }))
    .use(actionGuard("project.app.configure", projectIdFromInput))
    .mutation(async ({ input }) => {
      const app = await loadActiveProjectApp(input.projectId, input.appId);
      await db
        .update(projectApp)
        .set({ accessMode: input.mode, updatedAt: new Date() })
        .where(eq(projectApp.id, app.id));
      return { ok: true as const };
    }),

  grantAccess: orgProcedure
    .input(
      appInput
        .extend({
          userId: z.string().min(1).optional(),
          teamId: z.string().min(1).optional(),
        })
        .refine((value) => Boolean(value.userId) !== Boolean(value.teamId)),
    )
    .use(actionGuard("project.app.configure", projectIdFromInput))
    .mutation(async ({ ctx, input }) => {
      const app = await loadActiveProjectApp(input.projectId, input.appId);
      if (input.userId) {
        await assertProjectAccess(
          input.userId,
          input.projectId,
          ctx.activeOrganizationId ?? null,
        );
      }
      if (input.teamId) {
        const [link] = await db
          .select({ id: projectTeam.id })
          .from(projectTeam)
          .innerJoin(team, eq(projectTeam.teamId, team.id))
          .where(
            and(
              eq(projectTeam.projectId, input.projectId),
              eq(projectTeam.organizationId, ctx.activeOrganizationId ?? ""),
              eq(projectTeam.teamId, input.teamId),
              eq(team.organizationId, ctx.activeOrganizationId ?? ""),
              isNull(projectTeam.deletedAt),
              isNull(team.deletedAt),
            ),
          )
          .limit(1);
        if (!link)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Link this team to the project before granting app access.",
          });
      }
      const subjectFilter = input.userId
        ? eq(projectAppAccess.userId, input.userId)
        : eq(projectAppAccess.teamId, input.teamId ?? "");
      const [existing] = await db
        .select({ id: projectAppAccess.id })
        .from(projectAppAccess)
        .where(
          and(
            eq(projectAppAccess.projectAppId, app.id),
            subjectFilter,
            isNull(projectAppAccess.deletedAt),
          ),
        )
        .limit(1);
      if (existing) return { ok: true as const };
      await db.insert(projectAppAccess).values({
        id: crypto.randomUUID(),
        projectAppId: app.id,
        organizationId: ctx.activeOrganizationId ?? "",
        projectId: input.projectId,
        userId: input.userId ?? null,
        teamId: input.teamId ?? null,
        createdBy: ctx.session.user.id,
      });
      return { ok: true as const };
    }),

  revokeAccess: orgProcedure
    .input(appInput.extend({ accessId: z.string().min(1) }))
    .use(actionGuard("project.app.configure", projectIdFromInput))
    .mutation(async ({ ctx, input }) => {
      const app = await loadActiveProjectApp(input.projectId, input.appId);
      const result = await db
        .update(projectAppAccess)
        .set({ deletedAt: new Date(), deletedBy: ctx.session.user.id })
        .where(
          and(
            eq(projectAppAccess.id, input.accessId),
            eq(projectAppAccess.projectAppId, app.id),
            isNull(projectAppAccess.deletedAt),
          ),
        )
        .returning({ id: projectAppAccess.id });
      if (result.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App access not found",
        });
      return { ok: true as const };
    }),

  install: orgProcedure
    .input(appInput)
    .use(actionGuard("project.app.install", projectIdFromInput))
    .mutation(async ({ ctx, input }) => {
      const manifest = requireManifest(input.appId);
      const proj = await loadProject(input.projectId);
      const now = new Date();
      await db
        .insert(projectApp)
        .values({
          id: crypto.randomUUID(),
          organizationId: proj.organizationId,
          projectId: proj.id,
          appId: manifest.id,
          appVersion: manifest.version,
          status: "active",
          installedBy: ctx.session.user.id,
        })
        .onConflictDoUpdate({
          target: [projectApp.projectId, projectApp.appId],
          // Reinstall within the retention window restores existing data.
          set: {
            status: "active",
            installedBy: ctx.session.user.id,
            installedAt: now,
            updatedAt: now,
            uninstalledAt: null,
            uninstalledBy: null,
            purgeAfter: null,
          },
        });
      return { ok: true as const };
    }),

  uninstall: orgProcedure
    .input(appInput)
    .use(actionGuard("project.app.uninstall", projectIdFromInput))
    .mutation(async ({ ctx, input }) => {
      requireManifest(input.appId);
      const now = new Date();
      const purgeAfter = new Date(
        now.getTime() + APP_RETENTION_DAYS * 86_400_000,
      );
      const res = await db
        .update(projectApp)
        .set({
          status: "uninstalled",
          uninstalledAt: now,
          uninstalledBy: ctx.session.user.id,
          purgeAfter,
          updatedAt: now,
        })
        .where(
          and(
            eq(projectApp.projectId, input.projectId),
            eq(projectApp.appId, input.appId),
            eq(projectApp.status, "active"),
          ),
        )
        .returning({ id: projectApp.id });
      if (res.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App isn't installed",
        });
      return { ok: true as const, purgeAfter };
    }),

  configure: orgProcedure
    .input(appInput.extend({ settings: z.record(z.string()) }))
    .use(actionGuard("project.app.configure", projectIdFromInput))
    .mutation(async ({ input }) => {
      const manifest = requireManifest(input.appId);
      for (const [key, value] of Object.entries(input.settings)) {
        const def = manifest.settings.find((d) => d.key === key);
        if (!def?.options.some((o) => o.value === value)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid setting ${key}`,
          });
        }
      }
      const settings = resolveAppSettings(manifest, input.settings);
      const res = await db
        .update(projectApp)
        .set({ settings, updatedAt: new Date() })
        .where(
          and(
            eq(projectApp.projectId, input.projectId),
            eq(projectApp.appId, input.appId),
            eq(projectApp.status, "active"),
          ),
        )
        .returning({ id: projectApp.id });
      if (res.length === 0)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "App isn't installed",
        });
      return { ok: true as const, settings };
    }),
});

async function loadActiveProjectApp(projectId: string, appId: string) {
  const [row] = await db
    .select()
    .from(projectApp)
    .where(
      and(
        eq(projectApp.projectId, projectId),
        eq(projectApp.appId, appId),
        eq(projectApp.status, "active"),
      ),
    )
    .limit(1);
  if (!row)
    throw new TRPCError({ code: "NOT_FOUND", message: "App isn't installed" });
  return row;
}
