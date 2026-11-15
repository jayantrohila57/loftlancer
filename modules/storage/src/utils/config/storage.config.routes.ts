export const storageRoutes = {
  overview: {
    method: "POST" as const,
    path: "/openapi/security/storage/overview" as const,
    summary: "Organization storage usage overview",
    description:
      "Returns org-scoped used bytes vs cached quota for the active organization.",
    tags: ["Storage"],
  },
  list: {
    method: "POST" as const,
    path: "/openapi/security/storage/list" as const,
    summary: "List folders and files in a folder",
    description:
      "Lists child folders and active items for a folder the caller may access.",
    tags: ["Storage"],
  },
  initUpload: {
    method: "POST" as const,
    path: "/openapi/security/storage/init-upload" as const,
    summary: "Reserve an org storage upload",
    description:
      "Validates quota, MIME allowlist, and folder edit access; creates a pending upload row.",
    tags: ["Storage"],
  },
  downloadUrl: {
    method: "POST" as const,
    path: "/openapi/security/storage/download-url" as const,
    summary: "Signed download URL for an org file",
    description:
      "Returns a short-lived signed URL for an authorized org member.",
    tags: ["Storage"],
  },
  listGrants: {
    method: "POST" as const,
    path: "/openapi/security/storage/grants/list" as const,
    summary: "List storage grants",
    description: "Owner lists folder and item grants for the organization.",
    tags: ["Storage"],
  },
  createGrant: {
    method: "POST" as const,
    path: "/openapi/security/storage/grants/create" as const,
    summary: "Create a storage grant",
    description: "Owner grants folder or item access to a member.",
    tags: ["Storage"],
  },
  revokeGrant: {
    method: "POST" as const,
    path: "/openapi/security/storage/grants/revoke" as const,
    summary: "Revoke a storage grant",
    description: "Owner revokes a grant by id.",
    tags: ["Storage"],
  },
  listTrash: {
    method: "POST" as const,
    path: "/openapi/security/storage/trash/list" as const,
    summary: "List trashed org files",
    description: "Lists trashed items the caller may access.",
    tags: ["Storage"],
  },
  trashItem: {
    method: "POST" as const,
    path: "/openapi/security/storage/trash/delete" as const,
    summary: "Move a file to trash",
    description: "Soft-deletes an active org file.",
    tags: ["Storage"],
  },
  restoreItem: {
    method: "POST" as const,
    path: "/openapi/security/storage/trash/restore" as const,
    summary: "Restore a trashed file",
    description:
      "Restores a file within the retention window when blob and folder targets allow.",
    tags: ["Storage"],
  },
  purgeItem: {
    method: "POST" as const,
    path: "/openapi/security/storage/trash/purge" as const,
    summary: "Permanently delete a trashed file",
    description:
      "Org owner permanently deletes a trashed file and removes its blob.",
    tags: ["Storage"],
  },
  listActivity: {
    method: "POST" as const,
    path: "/openapi/security/storage/activity/list" as const,
    summary: "List storage activity",
    description: "Org-scoped storage events for the active organization.",
    tags: ["Storage"],
  },
} as const
