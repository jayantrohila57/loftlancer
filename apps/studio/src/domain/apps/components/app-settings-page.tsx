"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { FieldSelect } from "@/domain/tasks/components/field-select";
import { actionToast } from "@/lib/action-toast";
import { LayoutGrid } from "@/lib/icons";
import { trpc } from "@/utils/trpc";
import { useProjectApps } from "../hooks/use-project-apps";
import { AppGlyph } from "./app-glyph";

const cardClass =
  "flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-border/60";

/** /[org]/[project]/[app]/settings — details, real manifest settings, uninstall (#258). */
export function AppSettingsPage({
  slug,
  appId,
}: {
  slug: string;
  appId: string;
}) {
  const queryClient = useQueryClient();
  const {
    project,
    projectId,
    apps,
    isLoading,
    isError,
    canManage,
    uninstall,
    isMutating,
    refetch,
  } = useProjectApps(slug);
  const app = apps.find((a) => a.id === appId);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [uninstallOpen, setUninstallOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  useEffect(() => {
    if (app) setDraft(app.settings);
  }, [app]);
  const configure = useMutation({
    ...trpc.projectApps.configure.mutationOptions(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: trpc.projectApps.list.pathKey(),
      }),
  });
  if (isLoading) {
    return (
      <DashboardSection title="App settings" back={false} hideTabs>
        <div className="flex flex-col gap-4" role="status" aria-busy="true">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </DashboardSection>
    );
  }
  if (isError) {
    return (
      <DashboardSection title="App settings" back={false} hideTabs>
        <ErrorState
          title="App settings unavailable"
          description="We couldn't load this app for the project."
          onRetry={() => void refetch()}
        />
      </DashboardSection>
    );
  }
  if (app?.status !== "active") {
    return (
      <DashboardSection title={app?.name ?? "App"} back={false} hideTabs>
        <EmptyState
          icon={LayoutGrid}
          title={app ? `${app.name} isn't installed` : "Unknown app"}
          description={
            app
              ? canManage
                ? "Use Apps in the project navigation to install it before configuring it."
                : "Ask a project manager to install this app."
              : "This app doesn't exist."
          }
        />
      </DashboardSection>
    );
  }

  const dirty = app.settingsSchema.some(
    (d) => draft[d.key] !== app.settings[d.key],
  );
  const defaults = Object.fromEntries(
    app.settingsSchema.map((d) => [d.key, d.default]),
  );
  const customized = app.settingsSchema.some(
    (d) => app.settings[d.key] !== d.default,
  );
  return (
    <DashboardSection
      title={`Settings for ${app.name}`}
      description={
        project ? `Configure ${app.name} for ${project.name}.` : undefined
      }
      back={false}
      hideTabs
    >
      <div className="flex max-w-3xl flex-col gap-4">
        <section className={cardClass}>
          <div className="flex items-center gap-3">
            <AppGlyph icon={app.icon} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Badge variant="success" size="sm">
                  Installed
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {app.category}
                {app.installedAt ? (
                  <>
                    {" · installed "}
                    <LocalDateTime value={app.installedAt} />
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{app.description}</p>
          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <div>
              <p className="font-medium">Permissions</p>
              <ul className="list-disc ps-4 text-muted-foreground">
                {app.permissions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Data it stores</p>
              <ul className="list-disc ps-4 text-muted-foreground">
                {app.dataCreated.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="font-medium text-sm">Settings</h2>
          {app.settingsSchema.length === 0 ? (
            <p className="text-muted-foreground text-xs">
              {app.name} has no settings.
            </p>
          ) : (
            <>
              {app.settingsSchema.map((d) => (
                <div
                  key={d.key}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm">{d.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {d.description}
                    </p>
                  </div>
                  <FieldSelect
                    ariaLabel={d.label}
                    className="w-40"
                    disabled={!canManage}
                    value={draft[d.key] ?? d.default}
                    onChange={(v) => setDraft((s) => ({ ...s, [d.key]: v }))}
                    options={d.options}
                  />
                </div>
              ))}
              {canManage ? (
                <div className="flex justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="me-auto"
                    disabled={!customized || configure.isPending || !projectId}
                    onClick={() => setResetOpen(true)}
                  >
                    Reset to defaults
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={!dirty}
                    onClick={() => setDraft(app.settings)}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    disabled={!dirty || configure.isPending || !projectId}
                    onClick={() => {
                      if (!projectId) return;
                      actionToast(
                        configure.mutateAsync({
                          projectId,
                          appId: app.id,
                          settings: draft,
                        }),
                        {
                          loading: "Saving…",
                          success: "Settings saved",
                          error: "Couldn't save settings",
                        },
                      );
                    }}
                  >
                    Save settings
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">
                  Only project managers and owners can change settings.
                </p>
              )}
            </>
          )}
        </section>

        {canManage ? (
          <section className={`${cardClass} ring-destructive/30`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-medium text-sm">Uninstall {app.name}</h2>
                <p className="text-muted-foreground text-xs">
                  Hidden for everyone. Data is kept for 30 days, then
                  permanently deleted.
                </p>
              </div>
              <Button
                size="sm"
                variant="destructive-outline"
                disabled={isMutating}
                onClick={() => setUninstallOpen(true)}
              >
                Uninstall
              </Button>
            </div>
          </section>
        ) : null}
      </div>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={`Reset ${app.name} settings?`}
        description={`Restores the defaults for ${project?.name ?? "this project"}: ${app.settingsSchema
          .map(
            (d) =>
              `${d.label} → ${d.options.find((o) => o.value === d.default)?.label ?? d.default}`,
          )
          .join(", ")}.`}
        confirmLabel="Reset to defaults"
        isPending={configure.isPending}
        onConfirm={async () => {
          if (!projectId) return;
          await actionToast(
            configure.mutateAsync({
              projectId,
              appId: app.id,
              settings: defaults,
            }),
            {
              loading: "Resetting…",
              success: "Settings reset to defaults",
              error: "Couldn't reset settings",
            },
          );
          setDraft(defaults);
          setResetOpen(false);
        }}
      />
      <ConfirmDialog
        open={uninstallOpen}
        onOpenChange={setUninstallOpen}
        variant="destructive"
        title={`Uninstall ${app.name}?`}
        description={`${app.name} disappears from ${project?.name ?? "this project"} for everyone. Its data is kept for 30 days, so reinstalling restores it. After that it's deleted.`}
        confirmText={project?.name}
        confirmLabel="Uninstall"
        isPending={isMutating}
        onConfirm={async () => {
          await uninstall(app.id, app.name);
          setUninstallOpen(false);
        }}
      />
    </DashboardSection>
  );
}
