export const ORG_STORAGE_BROWSABLE_ITEM_STATUS = "active" as const

export type OrgStorageItemStatus =
  | typeof ORG_STORAGE_BROWSABLE_ITEM_STATUS
  | "trash"
  | "pending_upload"

export function isBrowsableStorageItemStatus(
  status: string
): status is typeof ORG_STORAGE_BROWSABLE_ITEM_STATUS {
  return status === ORG_STORAGE_BROWSABLE_ITEM_STATUS
}
