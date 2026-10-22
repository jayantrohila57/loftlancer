/** Apply deny blocks after grants so no access source can override a block. */
export function filterBlockedMemberActions(
  actions: readonly string[],
  ...blockedSets: readonly ReadonlySet<string>[]
) {
  return actions.filter(
    (action) =>
      !blockedSets.some((blocked) => blocked.has(action) || blocked.has("*")),
  );
}
