"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Button } from "@loftlancer/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@loftlancer/ui/menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import { useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { Can } from "@/domain/permissions/components/can";
import { useProjectActions } from "../hooks/use-project-actions";
import { EditProjectSheet } from "./edit-project-sheet";
import { ProjectActionDialog } from "./project-action-dialog";

interface ProjectActionsProps {
  project: ProjectOutput;
  onUpdate?: () => void;
  onEdit?: () => void;
}

const menuIconClass = "me-2 text-foreground";

export function ProjectActions({
  project,
  onUpdate,
  onEdit,
}: ProjectActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<
    "active" | "inactive" | "maintenance" | null
  >(null);
  const [visibilityDialogOpen, setVisibilityDialogOpen] = useState(false);

  const {
    archiveProject,
    unarchiveProject,
    changeProjectStatus,
    toggleProjectPublic,
    deleteProject,
    isArchiving,
    isUnarchiving,
    isChangingStatus,
    isTogglingPublic,
    isDeleting,
  } = useProjectActions({ projectId: project.id, onUpdate });

  const statusLabel =
    pendingStatus === "active"
      ? "active"
      : pendingStatus === "inactive"
        ? "inactive"
        : pendingStatus === "maintenance"
          ? "maintenance"
          : "";

  return (
    <>
      <Menu open={menuOpen} onOpenChange={setMenuOpen}>
        <Tooltip>
          <TooltipTrigger
            render={
              <MenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Project actions"
                  />
                }
              />
            }
          >
            <AppIcon name="rowActionsAlt" />
          </TooltipTrigger>
          <TooltipContent>Project actions</TooltipContent>
        </Tooltip>
        <MenuPopup align="end" className="w-80">
          <MenuGroup>
            <MenuGroupLabel>Project actions</MenuGroupLabel>
            <MenuItem
              onClick={() => {
                setMenuOpen(false);
                if (onEdit) onEdit();
                else setEditOpen(true);
              }}
            >
              <AppIcon name="edit" className={menuIconClass} />
              Edit project
            </MenuItem>
          </MenuGroup>

          <MenuSeparator />

          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setPendingStatus("active");
              setStatusDialogOpen(true);
            }}
            disabled={isChangingStatus || project.status === "active"}
          >
            <AppIcon name="power" className={menuIconClass} />
            Set active
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setPendingStatus("inactive");
              setStatusDialogOpen(true);
            }}
            disabled={isChangingStatus || project.status === "inactive"}
          >
            <AppIcon name="statusInactive" className={menuIconClass} />
            Set inactive
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setPendingStatus("maintenance");
              setStatusDialogOpen(true);
            }}
            disabled={isChangingStatus || project.status === "maintenance"}
          >
            <AppIcon name="statusMaintenance" className={menuIconClass} />
            Set maintenance
          </MenuItem>

          <MenuSeparator />

          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setVisibilityDialogOpen(true);
            }}
            disabled={isTogglingPublic}
          >
            {project.isPublic ? (
              <>
                <AppIcon name="hide" className={menuIconClass} />
                Make private
              </>
            ) : (
              <>
                <AppIcon name="reveal" className={menuIconClass} />
                Make public
              </>
            )}
          </MenuItem>

          <MenuSeparator />

          {project.isArchived ? (
            <Can
              action="project.unarchive"
              projectId={project.id}
              fallback={null}
            >
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  setUnarchiveDialogOpen(true);
                }}
                disabled={isUnarchiving}
              >
                <AppIcon name="archiveRestore" className={menuIconClass} />
                Unarchive project
              </MenuItem>
            </Can>
          ) : (
            <Can
              action="project.archive"
              projectId={project.id}
              fallback={null}
            >
              <MenuItem
                onClick={() => {
                  setMenuOpen(false);
                  setArchiveDialogOpen(true);
                }}
                disabled={isArchiving}
              >
                <AppIcon name="statusArchived" className={menuIconClass} />
                Archive project
              </MenuItem>
            </Can>
          )}

          <MenuSeparator />

          <MenuItem
            onClick={() => {
              setMenuOpen(false);
              setDeleteDialogOpen(true);
            }}
            variant="destructive"
            disabled={isDeleting}
          >
            <AppIcon name="delete" className={menuIconClass} />
            Delete project
          </MenuItem>
        </MenuPopup>
      </Menu>

      {onEdit ? null : (
        <EditProjectSheet
          project={project}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={onUpdate}
        />
      )}

      <ProjectActionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will permanently delete all environments and variables associated with this project.`}
        actionText="Delete Project"
        variant="destructive"
        onConfirm={deleteProject}
        confirmText={project.name}
        isPending={isDeleting}
      />

      <ProjectActionDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Archive Project"
        description={`Are you sure you want to archive "${project.name}"? Archived projects are hidden from the main view but can be restored later.`}
        actionText="Archive Project"
        onConfirm={archiveProject}
        isPending={isArchiving}
      />

      <ProjectActionDialog
        open={unarchiveDialogOpen}
        onOpenChange={setUnarchiveDialogOpen}
        title="Unarchive Project"
        description={`Are you sure you want to unarchive "${project.name}"? This will make it visible in the main project view.`}
        actionText="Unarchive Project"
        onConfirm={unarchiveProject}
        isPending={isUnarchiving}
      />

      <ProjectActionDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) setPendingStatus(null);
        }}
        title="Change project status"
        description={`Mark "${project.name}" as ${statusLabel}? This updates how the project appears across the workspace.`}
        actionText={`Set ${statusLabel}`}
        onConfirm={async () => {
          if (!pendingStatus) return;
          await changeProjectStatus(pendingStatus);
        }}
        isPending={isChangingStatus}
      />

      <ProjectActionDialog
        open={visibilityDialogOpen}
        onOpenChange={setVisibilityDialogOpen}
        title={
          project.isPublic ? "Make project private" : "Make project public"
        }
        description={
          project.isPublic
            ? `Make "${project.name}" private? Metadata will no longer be exposed publicly.`
            : `Make "${project.name}" public? Project metadata may be visible to others.`
        }
        actionText={project.isPublic ? "Make private" : "Make public"}
        onConfirm={toggleProjectPublic}
        isPending={isTogglingPublic}
      />
    </>
  );
}
