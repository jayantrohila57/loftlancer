"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { SettingsRow } from "@/components/patterns/settings-layout";
import { Can } from "@/domain/permissions/components/can";
import { useProjectActions } from "../hooks/use-project-actions";

interface ProjectDangerZoneProps {
  project: ProjectOutput;
}

export function ProjectDangerZone({ project }: ProjectDangerZoneProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);

  const {
    archiveProject,
    unarchiveProject,
    deleteProject,
    isArchiving,
    isUnarchiving,
    isDeleting,
  } = useProjectActions({ projectId: project.id });

  return (
    <>
      <AccordionSection
        title="Danger zone"
        description="Archive the project, or permanently delete it and its environments."
        className="border-destructive/32 bg-destructive/4"
      >
        {project.isArchived ? (
          <Can
            action="project.unarchive"
            projectId={project.id}
            fallback={null}
          >
            <SettingsRow
              label="Archived"
              description="This project is hidden from the main project list."
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-2"
                disabled={isUnarchiving}
                onClick={() => setUnarchiveDialogOpen(true)}
              >
                <AppIcon name="archiveRestore" className="text-current" />
                Unarchive project
              </Button>
            </SettingsRow>
          </Can>
        ) : (
          <Can action="project.archive" projectId={project.id} fallback={null}>
            <SettingsRow
              label="Archive"
              description="Hide the project without deleting environments or variables."
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-2"
                disabled={isArchiving}
                onClick={() => setArchiveDialogOpen(true)}
              >
                <AppIcon name="statusArchived" className="text-current" />
                Archive project
              </Button>
            </SettingsRow>
          </Can>
        )}
        <SettingsRow
          label="Delete project"
          description="Removes the project and its environments and variables. If recovery is enabled, it appears in Recently deleted."
        >
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-fit gap-2"
            disabled={isDeleting}
            onClick={() => setDeleteDialogOpen(true)}
          >
            <AppIcon name="delete" className="text-current" />
            Delete project
          </Button>
        </SettingsRow>
      </AccordionSection>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete project"
        description={`Are you sure you want to delete "${project.name}"? Its environments and variables will be deleted with it. If recovery is enabled, restore it from Recently deleted.`}
        confirmLabel="Delete project"
        variant="destructive"
        onConfirm={deleteProject}
        confirmText={project.name}
        isPending={isDeleting}
      />

      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive project"
        description={`Are you sure you want to archive "${project.name}"? Archived projects are hidden from the main view but can be restored later.`}
        confirmLabel="Archive project"
        onConfirm={archiveProject}
        isPending={isArchiving}
      />

      <ConfirmDialog
        open={unarchiveDialogOpen}
        onOpenChange={setUnarchiveDialogOpen}
        title="Unarchive project"
        description={`Are you sure you want to unarchive "${project.name}"? This will make it visible in the main project view.`}
        confirmLabel="Unarchive project"
        onConfirm={unarchiveProject}
        isPending={isUnarchiving}
      />
    </>
  );
}
