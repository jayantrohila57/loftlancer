import {
  ORG_STORAGE_BLOB_ORG_PREFIX,
  PERSONAL_AVATAR_BLOB_PREFIX,
} from "./constants/storage.constants.limits"

export function orgStorageBlobPrefix(organizationId: string) {
  return `${ORG_STORAGE_BLOB_ORG_PREFIX}${organizationId}/`
}

export function buildOrgStorageFilePathname(input: {
  organizationId: string
  itemId: string
  extension: string
}) {
  return `${orgStorageBlobPrefix(input.organizationId)}files/${input.itemId}.${input.extension}`
}

export function assertOrgScopedBlobPathname(input: {
  organizationId: string
  pathname: string
}) {
  const prefix = orgStorageBlobPrefix(input.organizationId)
  if (!input.pathname.startsWith(prefix)) {
    throw new OrgStorageCrossOrgPathError()
  }
}

export function assertPurgeAllowedBlobPathname(pathname: string) {
  if (pathname.startsWith(PERSONAL_AVATAR_BLOB_PREFIX)) {
    throw new OrgStorageProtectedPrefixError()
  }
  if (!pathname.startsWith(ORG_STORAGE_BLOB_ORG_PREFIX)) {
    throw new OrgStorageCrossOrgPathError()
  }
}

export class OrgStorageCrossOrgPathError extends Error {
  readonly code = "rbac.cross_org" as const
}

export class OrgStorageProtectedPrefixError extends Error {
  readonly code = "storage.protected_prefix" as const
}
