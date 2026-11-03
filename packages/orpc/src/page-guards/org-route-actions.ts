import type { ActionName } from "@features/authorization/utils";

/** Canonical page actions for organization `[slug]` child routes. */
export const organizationChildRouteActions: Record<string, ActionName> = {
  members: "member.list",
  invitations: "member.invite",
  teams: "organization.hub.view",
  roles: "organization.settings.view",
  settings: "organization.settings.view",
  timeline: "audit.timeline.view.org",
};

export function organizationChildAction(
  segment: string,
): ActionName | undefined {
  return organizationChildRouteActions[segment];
}
