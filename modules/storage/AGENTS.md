# Module `storage`

Org-scoped account storage — usage, list ACL, Account UI. **Docs:** [../../docs/work/requirements/storage-system.md](../../docs/work/requirements/storage-system.md)

| Path                                         | Role                                                   |
| -------------------------------------------- | ------------------------------------------------------ |
| `server/shared/storage.procedure.resolve.ts` | `resolveStorageOrgContext` — session org + membership  |
| `server/shared/storage.procedure.ts`         | `storageOrgProcedure` — oRPC middleware using resolver |
| `server/repositories/*`                      | Drizzle reads, grant-aware folder access               |
| `server/storage.controller.ts`               | oRPC `overview`, `list`                                |
| `client/components/*`                        | Account Storage overview / files screens               |
