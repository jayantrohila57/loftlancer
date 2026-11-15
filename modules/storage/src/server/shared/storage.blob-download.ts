import { getDownloadUrl, issueSignedToken, presignUrl } from "@packages/blob"

import { ORG_STORAGE_SIGNED_URL_TTL_MS } from "../../utils/constants/storage.constants.limits"
import { assertOrgScopedBlobPathname } from "../../utils/storage.blob-path"

export async function createOrgStorageDownloadUrl(input: {
  organizationId: string
  pathname: string
}) {
  assertOrgScopedBlobPathname({
    organizationId: input.organizationId,
    pathname: input.pathname,
  })
  const validUntil = Date.now() + ORG_STORAGE_SIGNED_URL_TTL_MS
  const delegation = await issueSignedToken({
    pathname: input.pathname,
    operations: ["get"],
    validUntil,
  })
  const { presignedUrl } = await presignUrl(delegation, {
    operation: "get",
    pathname: input.pathname,
    validUntil,
    access: "private",
  })
  return {
    url: getDownloadUrl(presignedUrl),
    expiresAt: new Date(validUntil).toISOString(),
  }
}
