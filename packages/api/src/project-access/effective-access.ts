import {
  type ActionName,
  actionRegistry,
  evaluatePermission,
  normalizeOrgRole,
} from "@loftlancer/actions";

export function getEffectiveProjectAccess(input: {
  role: string | null;
  isProjectCreator: boolean;
  isProjectManager: boolean;
  linkedTeams: string[];
  memberGrants: string[];
}) {
  const role = normalizeOrgRole(input.role);
  const hasTeamLink = input.linkedTeams.length > 0;
  const project = {
    isProjectCreator: input.isProjectCreator,
    isProjectManager: input.isProjectManager,
    hasTeamLink,
    memberGrants: input.memberGrants,
  };
  const effectiveActions = (Object.keys(actionRegistry) as ActionName[]).filter(
    (action) =>
      actionRegistry[action]?.scope === "project" &&
      evaluatePermission({ action, orgRole: role, project }).allowed,
  );
  const sources = [
    ...(role === "owner" ? ["Organization owner"] : []),
    ...(input.isProjectCreator ? ["Project creator"] : []),
    ...(input.isProjectManager ? ["Project manager"] : []),
    ...input.linkedTeams.map((name) => `Team: ${name}`),
    ...(input.memberGrants.length
      ? [
          hasTeamLink
            ? "Direct project grants"
            : "Direct grants (inactive until team access is linked)",
        ]
      : []),
  ];
  return { role, sources, effectiveActions };
}
