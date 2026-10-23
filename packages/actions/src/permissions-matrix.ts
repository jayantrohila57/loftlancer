import type { ActionName } from "./types";

export type MatrixCell = "Y" | "G" | "—";

export type PermissionMatrixRow = {
  action: ActionName;
  label: string;
  owner: MatrixCell;
  manager: MatrixCell;
  member: MatrixCell;
  admin: MatrixCell;
};

/** Curated org/project matrix for the Roles & access UI (spec §6 summary). */
export const PERMISSION_MATRIX_ROWS: PermissionMatrixRow[] = [
  {
    action: "member.list",
    label: "View organization members",
    owner: "Y",
    manager: "Y",
    member: "—",
    admin: "—",
  },
  {
    action: "organization.settings.update",
    label: "Organization settings",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "organization.transfer_ownership",
    label: "Transfer organization ownership",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "organization.archive",
    label: "Archive the organization",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "organization.unarchive",
    label: "Restore an archived organization",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "organization.restore",
    label: "Restore a deleted organization",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "organization.delete",
    label: "Delete the organization",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "member.invite",
    label: "Invite members",
    owner: "Y",
    manager: "Y",
    member: "—",
    admin: "—",
  },
  {
    action: "member.role.update",
    label: "Change member roles",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "member.remove",
    label: "Remove organization members",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "team.create",
    label: "Manage teams",
    owner: "Y",
    manager: "Y",
    member: "—",
    admin: "—",
  },
  {
    action: "project.create",
    label: "Create projects",
    owner: "Y",
    manager: "—",
    member: "—",
    admin: "—",
  },
  {
    action: "project.read",
    label: "View projects",
    owner: "Y",
    manager: "G",
    member: "G",
    admin: "—",
  },
  {
    action: "project.permission.grant",
    label: "Manage individual project access",
    owner: "Y",
    manager: "G",
    member: "—",
    admin: "—",
  },
  {
    action: "variable.reveal",
    label: "Reveal secret values",
    owner: "Y",
    manager: "G",
    member: "G",
    admin: "—",
  },
  {
    action: "audit.timeline.view.org",
    label: "Activity",
    owner: "Y",
    manager: "G",
    member: "—",
    admin: "—",
  },
];
