export const storageOverviewKey = (organizationId: string | null | undefined) =>
  ["storage", "overview", organizationId] as const

export const storageListKey = (
  organizationId: string | null | undefined,
  folderId?: string
) => ["storage", "list", organizationId, folderId ?? "root"] as const

export const storageTrashKey = (organizationId: string | null | undefined) =>
  ["storage", "trash", organizationId] as const

export const storageActivityKey = (
  organizationId: string | null | undefined,
  cursor?: string
) => ["storage", "activity", organizationId, cursor ?? "first"] as const

export const storageGrantsKey = (organizationId: string | null | undefined) =>
  ["storage", "grants", organizationId] as const
