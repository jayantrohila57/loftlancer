export { CommandPalette } from "./capability/command.palette"
export type {
  CommandPaletteAutocompleteGroup,
  CommandPaletteGroup,
  CommandPaletteItem,
  CommandPaletteItemSource,
  CommandPaletteListItem,
  CommandPaletteProps,
  CommandPaletteSourceFilter,
  MergeCommandPaletteFromRegistriesInput,
} from "./types/command.types"
export {
  type ExecuteCommandPaletteItemContext,
  executeCommandHandler,
  executeCommandPaletteItem,
} from "./utils/command.execute"
export {
  commandItemMatchesQuery,
  commandItemMatchRank,
  commandItemSearchText,
  countCommandPaletteGroupItems,
  filterCommandPaletteGroups,
  filterCommandPaletteGroupsBySource,
  filterCommandPaletteGroupsWithOptions,
  filterCommandPaletteItems,
  groupCommandPaletteItems,
  isCommandPaletteItemSelectable,
  mergeCommandPaletteFromRegistries,
  mergeCommandPaletteItems,
  normalizeCommandSearchQuery,
  orderCommandPaletteItemsWithNesting,
  toCommandPaletteAutocompleteGroups,
} from "./utils/command.merge"
export { assertValidCommandPaletteRegistries } from "./utils/command.merge.validation"
