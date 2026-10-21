import {
  APP_RETENTION_DAYS,
  appRegistry,
  getAppManifest,
  resolveAppSettings,
} from "@loftlancer/actions";
import { db } from "@loftlancer/db";
import { projectApp } from "@loftlancer/db/schema/project-app";
import { project } from "@loftlancer/db/schema/projects";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v3";
import { actionGuard } from "../actions/action-guard";
import { projectIdFromInput } from "../actions/guard-resolve";
import { resolveProjectAppStatus } from "../apps/project-app-status";
import { orgProcedure, router } from "../index";

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
    .query(async ({ input }) => {
      const rows = await db
        .select()
        .from(projectApp)
        .where(eq(projectApp.projectId, input.projectId));
      return appRegistry.map((m) => {
        const row = rows.find((r) => r.appId === m.id);
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
          installedAt: row?.installedAt ?? null,
          purgeAfter: row?.status === "uninstalled" ? row.purgeAfter : null,
          settingsSchema: m.settings.map((d) => ({
            key: d.key,
            label: d.label,
            description: d.description,
            options: d.options.map((o) => ({ value: o.value, label: o.label })),
            default: d.default,
          })),
          settings: resolveAppSettings(m, row?.settings),
          installedBy: row?.installedBy ?? null,
        };
      });
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
