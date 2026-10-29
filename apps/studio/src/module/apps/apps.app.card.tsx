"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import Link from "next/link";
import { useState } from "react";
import { AppGlyph } from "@/module/apps/apps.app.glyph";
import type { ProjectAppItem } from "@/module/apps/apps.use.project.apps";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";

function daysLeft(date: Date | string | null) {
  if (!date) return null;
  return Math.max(
    0,
    Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000),
  );
}

/** One app in the directory: install / open / uninstall. Fixed height, no shift. */
export function AppCard({
  app,
  slug,
  projectName,
  canManage,
  busy,
  onInstall,
  onUninstall,
}: {
  app: ProjectAppItem;
  slug: string;
  projectName: string;
  canManage: boolean;
  busy: boolean;
  onInstall: () => Promise<unknown>;
  onUninstall: () => Promise<unknown>;
}) {
  const [installOpen, setInstallOpen] = useState(false);
  const [uninstallOpen, setUninstallOpen] = useState(false);
  const active = app.status === "active";
  const retained =
    app.status === "uninstalled" ? daysLeft(app.purgeAfter) : null;
  const org = useOrgSlug();
  const href = routes.app(org, slug, app.nav[0]?.path ?? app.id);

  return (
    <div
      className="flex min-h-36 flex-col gap-3 rounded-md bg-card p-4 ring-1 ring-border/60"
      data-testid={`app-card-${app.id}`}
    >
      <div className="flex items-start gap-3">
        <AppGlyph icon={app.icon} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-medium text-sm">{app.name}</h3>
            {active ? (
              <Badge variant="success" size="sm">
                Installed
              </Badge>
            ) : retained !== null ? (
              <Badge variant="warning" size="sm">
                Data kept {retained}d
              </Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">{app.category}</p>
        </div>
      </div>
      <p className="line-clamp-2 flex-1 text-muted-foreground text-xs">
        {app.description}
      </p>
      <div className="flex items-center gap-1.5">
        {active && app.canAccess ? (
          <Button size="sm" variant="outline" render={<Link href={href} />}>
            Open
          </Button>
        ) : null}
        {canManage && !active ? (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => setInstallOpen(true)}
          >
            {retained !== null ? "Reinstall" : "Install"}
          </Button>
        ) : null}
        {active && app.canAccess ? (
          <Button
            size="sm"
            variant="ghost"
            render={<Link href={routes.appSettings(org, slug, app.id)} />}
          >
            Settings
          </Button>
        ) : null}
        {active && !app.canAccess ? (
          <span className="text-muted-foreground text-xs">
            Ask a project manager for app access
          </span>
        ) : null}
        {canManage && active ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setUninstallOpen(true)}
          >
            Uninstall
          </Button>
        ) : null}
        {!canManage && !active ? (
          <span className="text-muted-foreground text-xs">
            Ask a project manager to install
          </span>
        ) : null}
      </div>

      <ConfirmDialog
        open={installOpen}
        onOpenChange={setInstallOpen}
        title={`Install ${app.name}?`}
        description={
          <div className="flex flex-col gap-2 text-xs">
            <div>
              <p className="font-medium text-foreground">It will be able to</p>
              <ul className="list-disc ps-4">
                {app.permissions.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Data it creates</p>
              <ul className="list-disc ps-4">
                {app.dataCreated.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            {retained !== null ? (
              <p>
                Your existing {app.name.toLowerCase()} data will be restored.
              </p>
            ) : null}
          </div>
        }
        confirmLabel={retained !== null ? "Reinstall" : "Install"}
        onConfirm={async () => {
          await onInstall();
          setInstallOpen(false);
        }}
        isPending={busy}
      />
      <ConfirmDialog
        open={uninstallOpen}
        onOpenChange={setUninstallOpen}
        variant="destructive"
        title={`Uninstall ${app.name}?`}
        description={`${app.name} disappears from ${projectName} for everyone. Its data is kept for 30 days, so reinstalling restores it. After that it's deleted.`}
        confirmText={projectName}
        confirmLabel="Uninstall"
        onConfirm={async () => {
          await onUninstall();
          setUninstallOpen(false);
        }}
        isPending={busy}
      />
    </div>
  );
}
