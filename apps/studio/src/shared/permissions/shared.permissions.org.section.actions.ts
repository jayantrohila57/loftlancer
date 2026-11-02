import type { ActionName } from "@loftlancer/actions";

/** Canonical gates for Organizations hub sections (UI owned by other agents). */
export const orgHubSectionActions = {
  // Same gate as projects.list (the org projects page).
  projects: "organization.list" satisfies ActionName,
  members: "member.list" satisfies ActionName,
  teams: "team.create" satisfies ActionName,
  invitations: "member.invite" satisfies ActionName,
  roles: "member.role.update" satisfies ActionName,
  settings: "organization.settings.view" satisfies ActionName,
  timeline: "audit.timeline.view.org" satisfies ActionName,
} as const;

export function orgSectionAction(
  sectionId: keyof typeof orgHubSectionActions,
): ActionName {
  return orgHubSectionActions[sectionId];
}

export type OrgHubSection = keyof typeof orgHubSectionActions;

export const accountSettingsActions = {
  profile: "profile.view" satisfies ActionName,
  sessions: "session.list" satisfies ActionName,
  accounts: "account.list" satisfies ActionName,
  export: "account.export" satisfies ActionName,
  delete: "account.delete" satisfies ActionName,
  timeline: "audit.timeline.view.self" satisfies ActionName,
} as const;

export type AccountSettingsSection = keyof typeof accountSettingsActions;
