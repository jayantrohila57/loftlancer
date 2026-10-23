"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@loftlancer/ui/select";
import { useState } from "react";
import { SettingsRow } from "@/components/patterns/settings-layout";
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
      <AccordionSection
        title="Project status"
        description="Set the operational state of this project."
      >
        <SettingsRow
          label="Status"
          description="Operational state for this project."
          icon="statusActive"
        >
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <StatusBadge status={project.status} />
            <Select
              value={project.status}
              onValueChange={(value) => {
                if (!value || value === project.status) return;
                setPendingStatus(
                  value as "active" | "inactive" | "maintenance",
                );
                setStatusDialogOpen(true);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="capitalize"
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
          </div>
        </SettingsRow>
      </AccordionSection>
      <ProjectDangerZone project={project} />

      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) setPendingStatus(null);
        }}
        title="Change project status"
        description={`Mark "${project.name}" as ${statusLabel}? This updates how the project appears in the organization.`}
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
