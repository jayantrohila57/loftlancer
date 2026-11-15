import type { ActionRegistry } from "@features/action"
import { toActionCommandItems } from "@features/action"
import type { NavigationRegistry } from "@features/navigation"
import { toNavigationCommandItems } from "@features/navigation"
import type {
  CommandPaletteAutocompleteGroup,
  CommandPaletteGroup,
  CommandPaletteItem,
  CommandPaletteListItem,
  CommandPaletteSourceFilter,
  MergeCommandPaletteFromRegistriesInput,
} from "../types/command.types"
import { assertValidCommandPaletteRegistries } from "./command.merge.validation"

const DEFAULT_GROUP_ID = "default"

const MATCH_RANK = {
  PREFIX_LABEL: 1,
  CONTAINS_LABEL: 2,
  KEYWORD: 3,
  DESCRIPTION: 4,
  META: 5,
  FUZZY: 6,
} as const

function groupKey(item: CommandPaletteItem): string {
  return item.groupId ?? item.groupLabel ?? DEFAULT_GROUP_ID
}

function groupLabelFor(
  groupId: string,
  items: readonly CommandPaletteItem[]
): string {
  const match = items.find(
    (item) => (item.groupId ?? item.groupLabel ?? DEFAULT_GROUP_ID) === groupId
  )

  return match?.groupLabel ?? match?.groupId ?? groupId
}

function compareCommandPaletteItems(
  left: CommandPaletteItem,
  right: CommandPaletteItem
): number {
  if (left.source !== right.source) {
    return left.source === "navigation" ? -1 : 1
  }

  return left.label.localeCompare(right.label)
}

export function isCommandPaletteItemSelectable(
  item: CommandPaletteItem
): boolean {
  return item.selectable !== false
}

/** Parent row immediately followed by its children (one nesting level). */
export function orderCommandPaletteItemsWithNesting(
  items: readonly CommandPaletteItem[]
): readonly CommandPaletteItem[] {
  const ids = new Set(items.map((item) => item.id))
  const childrenByParent = new Map<string, CommandPaletteItem[]>()
  const roots: CommandPaletteItem[] = []

  for (const item of items) {
    if (item.parentId !== undefined && ids.has(item.parentId)) {
      const siblings = childrenByParent.get(item.parentId) ?? []
      siblings.push(item)
      childrenByParent.set(item.parentId, siblings)
    } else {
      roots.push(item)
    }
  }

  const ordered: CommandPaletteItem[] = []
  const placed = new Set<string>()

  for (const root of [...roots].sort(compareCommandPaletteItems)) {
    ordered.push(root)
    placed.add(root.id)
    const children = childrenByParent.get(root.id) ?? []
    for (const child of [...children].sort(compareCommandPaletteItems)) {
      ordered.push(child)
      placed.add(child.id)
    }
  }

  const remaining = items.filter((item) => !placed.has(item.id))
  if (remaining.length > 0) {
    ordered.push(...[...remaining].sort(compareCommandPaletteItems))
  }

  return ordered
}

function paletteItemSelectable(
  command: { readonly selectable?: boolean },
  registryItem?: { readonly selectable?: boolean }
): boolean {
  if (command.selectable === false || registryItem?.selectable === false) {
    return false
  }

  return true
}

function keywordsWithParentLabel(
  keywords: readonly string[],
  parent?: { readonly label: string }
): readonly string[] {
  if (parent === undefined) {
    return keywords
  }

  if (keywords.includes(parent.label)) {
    return keywords
  }

  return [...keywords, parent.label]
}

function navigationRegistryToPaletteItems(
  registry: NavigationRegistry
): CommandPaletteItem[] {
  return toNavigationCommandItems(registry).map((command) => {
    const item = registry.getById(command.id)
    const parent =
      command.parentId === undefined
        ? undefined
        : registry.getById(command.parentId)

    return {
      description: command.description,
      groupId: item?.groupId ?? command.groupLabel,
      groupLabel: command.groupLabel,
      handler: { href: command.href, kind: "href" },
      icon: item?.icon,
      id: command.id,
      keywords: keywordsWithParentLabel(command.keywords, parent),
      label: command.label,
      parentId: command.parentId,
      selectable: true,
      source: "navigation",
    }
  })
}

function actionRegistryToPaletteItems(
  registry: ActionRegistry,
  navigationRegistry: NavigationRegistry
): CommandPaletteItem[] {
  return toActionCommandItems(registry).map((command) => {
    const item = registry.getById(command.id)
    const parentAction =
      command.parentId === undefined
        ? undefined
        : registry.getById(command.parentId)
    const parentNavigation =
      parentAction === undefined && command.parentId !== undefined
        ? navigationRegistry.getById(command.parentId)
        : undefined
    const parent = parentAction ?? parentNavigation

    return {
      description: command.description,
      groupId: item?.groupId ?? command.groupLabel,
      groupLabel: command.groupLabel,
      handler: command.handler,
      icon: item?.icon,
      id: command.id,
      keywords: keywordsWithParentLabel(command.keywords, parent),
      label: command.label,
      parentId: command.parentId,
      selectable: paletteItemSelectable(command, item),
      source: "action",
    }
  })
}

/** Merge navigation + action command placements into flat palette items. */
export function mergeCommandPaletteItems(
  navigationRegistry: NavigationRegistry,
  actionRegistry: ActionRegistry
): readonly CommandPaletteItem[] {
  assertValidCommandPaletteRegistries(navigationRegistry, actionRegistry)

  const items = [
    ...navigationRegistryToPaletteItems(navigationRegistry),
    ...actionRegistryToPaletteItems(actionRegistry, navigationRegistry),
  ]

  return items.sort(compareCommandPaletteItems)
}

/** Group flat palette items for the command UI. */
export function groupCommandPaletteItems(
  items: readonly CommandPaletteItem[]
): readonly CommandPaletteGroup[] {
  const buckets = new Map<string, CommandPaletteItem[]>()

  for (const item of items) {
    const key = groupKey(item)
    const bucket = buckets.get(key) ?? []
    bucket.push(item)
    buckets.set(key, bucket)
  }

  return [...buckets.entries()]
    .map(([groupId, groupItems]) => ({
      id: groupId,
      items: orderCommandPaletteItemsWithNesting(groupItems),
      label: groupLabelFor(groupId, items),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Build grouped palette rows from navigation and action registries. */
export function mergeCommandPaletteFromRegistries(
  input: MergeCommandPaletteFromRegistriesInput
): readonly CommandPaletteGroup[] {
  return groupCommandPaletteItems(
    mergeCommandPaletteItems(input.navigationRegistry, input.actionRegistry)
  )
}

export function normalizeCommandSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

function stripDiacritics(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "")
}

function normalizeSearchToken(text: string): string {
  return stripDiacritics(text.trim().toLowerCase())
}

function searchQueryTerms(query: string): readonly string[] {
  return normalizeCommandSearchQuery(query)
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeSearchToken)
}

function commandItemHref(item: CommandPaletteItem): string | undefined {
  if (item.handler.kind === "href") {
    return item.handler.href
  }

  return undefined
}

export function commandItemSearchText(item: CommandPaletteItem): string {
  const href = commandItemHref(item)

  return [
    item.label,
    item.description,
    ...item.keywords,
    href,
    item.groupLabel,
    item.groupId,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ")
}

function normalizeSearchField(value: string | undefined): string {
  if (value === undefined || value.length === 0) {
    return ""
  }

  return normalizeSearchToken(value)
}

function isContiguousSubsequence(needle: string, haystack: string): boolean {
  if (needle.length === 0) {
    return true
  }

  let index = 0
  for (const char of haystack) {
    if (char === needle[index]) {
      index += 1
      if (index === needle.length) {
        return true
      }
    }
  }

  return false
}

function rankTermAgainstField(
  term: string,
  field: string | undefined,
  allowFuzzy: boolean
): number | null {
  const fieldValue = normalizeSearchField(field)
  if (fieldValue.length === 0) {
    return null
  }

  const normalizedTerm = normalizeSearchToken(term)
  if (normalizedTerm.length === 0) {
    return null
  }

  if (fieldValue.startsWith(normalizedTerm)) {
    return MATCH_RANK.PREFIX_LABEL
  }

  if (fieldValue.includes(normalizedTerm)) {
    return MATCH_RANK.CONTAINS_LABEL
  }

  if (allowFuzzy && isContiguousSubsequence(normalizedTerm, fieldValue)) {
    return MATCH_RANK.FUZZY
  }

  return null
}

function rankTermInItem(item: CommandPaletteItem, term: string): number | null {
  const labelRank = rankTermAgainstField(term, item.label, true)
  if (
    labelRank === MATCH_RANK.PREFIX_LABEL ||
    labelRank === MATCH_RANK.CONTAINS_LABEL
  ) {
    return labelRank
  }

  for (const keyword of item.keywords) {
    const keywordRank = rankTermAgainstField(term, keyword, true)
    if (
      keywordRank === MATCH_RANK.PREFIX_LABEL ||
      keywordRank === MATCH_RANK.CONTAINS_LABEL
    ) {
      return MATCH_RANK.KEYWORD
    }
  }

  if (item.description !== undefined) {
    const descriptionRank = rankTermAgainstField(term, item.description, false)
    if (descriptionRank === MATCH_RANK.CONTAINS_LABEL) {
      return MATCH_RANK.DESCRIPTION
    }
  }

  const metaFields = [
    commandItemHref(item),
    item.groupLabel,
    item.groupId,
  ].filter((value): value is string => Boolean(value))

  for (const metaField of metaFields) {
    const metaRank = rankTermAgainstField(term, metaField, false)
    if (metaRank === MATCH_RANK.CONTAINS_LABEL) {
      return MATCH_RANK.META
    }
  }

  if (labelRank === MATCH_RANK.FUZZY) {
    return MATCH_RANK.FUZZY
  }

  for (const keyword of item.keywords) {
    const keywordRank = rankTermAgainstField(term, keyword, true)
    if (keywordRank === MATCH_RANK.FUZZY) {
      return MATCH_RANK.FUZZY
    }
  }

  return null
}

/** Best (lowest) rank when all query terms match; `null` when any term misses. */
export function commandItemMatchRank(
  item: CommandPaletteItem,
  query: string
): number | null {
  const terms = searchQueryTerms(query)
  if (terms.length === 0) {
    return 0
  }

  let worstRank = 0

  for (const term of terms) {
    const termRank = rankTermInItem(item, term)
    if (termRank === null) {
      return null
    }

    worstRank = Math.max(worstRank, termRank)
  }

  return worstRank
}

export function commandItemMatchesQuery(
  item: CommandPaletteItem,
  query: string
): boolean {
  return commandItemMatchRank(item, query) !== null
}

function includeParentRowsForMatches(
  matched: readonly CommandPaletteItem[],
  catalog: readonly CommandPaletteItem[]
): CommandPaletteItem[] {
  const catalogById = new Map(catalog.map((item) => [item.id, item]))
  const ids = new Set(matched.map((item) => item.id))

  for (const item of matched) {
    if (item.parentId === undefined) {
      continue
    }

    if (ids.has(item.parentId)) {
      continue
    }

    const parent = catalogById.get(item.parentId)
    if (parent !== undefined) {
      ids.add(parent.id)
    }
  }

  return catalog.filter((item) => ids.has(item.id))
}

/** Filter flat palette items by search query (used in tests and palette UI). */
export function filterCommandPaletteItems(
  items: readonly CommandPaletteItem[],
  query: string,
  catalog: readonly CommandPaletteItem[] = items
): readonly CommandPaletteItem[] {
  if (!normalizeCommandSearchQuery(query)) {
    return orderCommandPaletteItemsWithNesting(items)
  }

  const matched = items
    .filter((item) => isCommandPaletteItemSelectable(item))
    .map((item) => ({
      item,
      rank: commandItemMatchRank(item, query),
    }))
    .filter(
      (entry): entry is { item: CommandPaletteItem; rank: number } =>
        entry.rank !== null
    )
    .sort((left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank
      }

      return compareCommandPaletteItems(left.item, right.item)
    })
    .map((entry) => entry.item)

  return orderCommandPaletteItemsWithNesting(
    includeParentRowsForMatches(matched, catalog)
  )
}

/** Filter grouped palette rows; drops empty groups. */
export function filterCommandPaletteGroups(
  groups: readonly CommandPaletteGroup[],
  query: string
): readonly CommandPaletteGroup[] {
  if (!normalizeCommandSearchQuery(query)) {
    return groups
  }

  return groups
    .map((group) => ({
      ...group,
      items: filterCommandPaletteItems(group.items, query, group.items),
    }))
    .filter((group) => group.items.length > 0)
}

function matchesSourceFilter(
  item: CommandPaletteItem,
  sourceFilter: CommandPaletteSourceFilter
): boolean {
  if (sourceFilter === "all") {
    return true
  }

  return item.source === sourceFilter
}

/** Restrict grouped palette rows by item source (navigation vs action). */
export function filterCommandPaletteGroupsBySource(
  groups: readonly CommandPaletteGroup[],
  sourceFilter: CommandPaletteSourceFilter
): readonly CommandPaletteGroup[] {
  if (sourceFilter === "all") {
    return groups
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        matchesSourceFilter(item, sourceFilter)
      ),
    }))
    .filter((group) => group.items.length > 0)
}

/** Search query + optional source filter for the command palette list. */
export function filterCommandPaletteGroupsWithOptions(
  groups: readonly CommandPaletteGroup[],
  query: string,
  sourceFilter: CommandPaletteSourceFilter = "all"
): readonly CommandPaletteGroup[] {
  return filterCommandPaletteGroupsBySource(
    filterCommandPaletteGroups(groups, query),
    sourceFilter
  )
}

export function countCommandPaletteGroupItems(
  groups: readonly CommandPaletteGroup[]
): number {
  return groups.reduce((total, group) => total + group.items.length, 0)
}

export function toCommandPaletteAutocompleteGroups(
  groups: readonly CommandPaletteGroup[]
): readonly CommandPaletteAutocompleteGroup[] {
  return groups.map((group) => ({
    items: group.items.map(
      (item): CommandPaletteListItem => ({
        item,
        label: item.label,
        value: item.id,
      })
    ),
    label: group.label,
    value: group.id,
  }))
}
