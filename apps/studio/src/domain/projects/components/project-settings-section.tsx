"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { Tabs, TabsList, TabsTab } from "@loftlancer/ui/tabs";
import { useState } from "react";
import {
  SettingsPanel,
  SettingsRow,
  SettingsSectionHeader,
} from "@/components/patterns/settings-layout";
import { StatusBadge } from "@/components/patterns/status-badge";
import { useProjectActions } from "../hooks/use-project-actions";
import { ProjectDangerZone } from "./project-danger-zone";

interface ProjectSettingsSectionProps {
  project: ProjectOutput;
}

const STATUS_OPTIONS: {
  value: "active" | "inactive" | "maintenance";
}[] = [{ value: "active" }, { value: "inactive" }, { value: "maintenance" }];

export function ProjectSettingsSection({
  project,
}: ProjectSettingsSectionProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "active" | "inactive" | "maintenance" | null
  >(null);
  const { changeProjectStatus, isChangingStatus } = useProjectActions({
    projectId: project.id,
  });

  const statusLabel = pendingStatus ?? project.status;

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel>
        <SettingsSectionHeader
          title="Project status"
          description="Set the operational state of this project."
          icon="settings"
        />
        <SettingsRow
          label="Status"
          description="Operational state for this project."
          icon="statusActive"
        >
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge status={project.status} />
            <Tabs
              value={project.status}
              onValueChange={(value) => {
                if (!value || value === project.status) return;
                setPendingStatus(
                  value as "active" | "inactive" | "maintenance",
                );
                setStatusDialogOpen(true);
              }}
            >
              <TabsList size="sm" className="h-auto w-fit justify-start">
                {STATUS_OPTIONS.map((option) => (
                  <TabsTab
                    key={option.value}
                    value={option.value}
                    disabled={isChangingStatus}
                    className="capitalize"
                  >
                    {option.value}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </SettingsRow>
      </SettingsPanel>
      <ProjectDangerZone project={project} />

      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) setPendingStatus(null);
        }}
        title="Change project status"
        description={`Mark "${project.name}" as ${statusLabel}? This updates how the project appears across the workspace.`}
        confirmLabel={`Set ${statusLabel}`}
        onConfirm={async () => {
          if (!pendingStatus) return;
          await changeProjectStatus(pendingStatus);
        }}
        isPending={isChangingStatus}
      />
    </div>
  );
}
