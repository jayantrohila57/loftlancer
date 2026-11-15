# Requirements: Account storage system

**Status:** **Approved** (2026-11-14)  
**Approved by:** User (chat sign-off 2026-11-14)  
**Date:** 2026-11-14  
**Layers:** packages / features / modules / apps  
**Roadmap:** [auth-account-roadmap.md](../auth-account-roadmap.md) Phase 9 — _Define storage inventory, quota, activity, and recovery_ · Phase 4 avatar Blob verification (separate spec)  
**Related:**

| Doc                                                                                              | Relationship                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [profile-avatar-blob.md](./profile-avatar-blob.md)                                               | **Approved** — Vercel Blob for **personal** profile avatars only; **Option A** (no auto `del`); prefix `loftlancer/avatars/` — **not** counted in org storage |
| [better-auth.md](./better-auth.md)                                                               | **Blocker** — org plugin / org product context **not** in v1; storage v1 depends on it                                                                        |
| [account-data-retention-deletion.md](./account-data-retention-deletion.md)                       | **Draft / partial implement** — personal avatar Blob objects **not** deleted on account delete (inherits avatar Option A)                                     |
| [audit-data-versioning.md](./audit-data-versioning.md)                                           | **Draft** — prior `image` URL snapshots; may extend to file metadata                                                                                          |
| [auth-account.md](./auth-account.md)                                                             | **Implemented** — storage shell routes; incremental live UI per decisions below                                                                               |
| [auth-api-migration.md](./auth-api-migration.md)                                                 | Avatar upload stays multipart HTTP; Blob in `@packages/blob`                                                                                                  |
| [application-activity.md](./application-activity.md)                                             | Org-scoped activity; storage operations need new action IDs                                                                                                   |
| [autumn-usage-metering.md](./autumn-usage-metering.md)                                           | **Approved** — Autumn billing; org quotas **plan-derived** (2 GB / 5 GB + credits); [Quotas and limits](#quotas-and-limits-decided--tbd)                      |
| [form-input-fields.md](./form-input-fields.md) / [docs/features/form.md](../../features/form.md) | File fields via `FormKit` / `FieldKit`; no raw upload UI in apps                                                                                              |
| [entitlements-design-answers.md](./entitlements-design-answers.md#storage-system)                | Blob store access, quota reservation, trash/purge, interim 2 GB vs 5 GB                                                                                       |

## Decisions (user input 2026-11-14)

| #   | Topic          | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q1  | **Tenancy**    | **Organization-scoped storage.** Each org has a **plan-derived storage quota** (see [Quotas and limits](#quotas-and-limits-decided--tbd)) counted at org level and **one default org storage root**. **Folders + permissions:** owner-managed; grants control member visibility; granted access includes **view and edit**. **Org owner** sees all org storage and is the **sole grantor** in v1 ([R3](#decisions-user-input-2026-11-14-round-2)); **manager** and **member** only see granted scope. |
| Q2  | **Avatars**    | **Business storage model** — **personal** profile avatar is **not** in org storage (existing [profile-avatar-blob.md](./profile-avatar-blob.md) pipeline). **Organization avatar** **is** included in org storage. Anything under the org is stored and managed in the org storage filesystem.                                                                                                                                                                                                        |
| Q3  | **Nav / UI**   | Build **real UI incrementally** as features ship — not indefinite `UnavailablePage`-only placeholders.                                                                                                                                                                                                                                                                                                                                                                                                |
| Q4  | **Provider**   | **Same Vercel Blob store** for everything; separation by **permission / prefix / ACL**, not separate stores.                                                                                                                                                                                                                                                                                                                                                                                          |
| Q5  | **Access**     | **Org-private + signed URLs** — v1 org hub files are **not** internet-wide public. “Public” visibility means **within org** (granted members). **No** anonymous/public CDN blob URLs for org files in v1. **Mixed-by-purpose** is **org-scoped sharing only** (signed access for granted members); external share-link slice **deferred** ([round 3](#decisions-user-input-2026-11-14-round-3)).                                                                                                      |
| Q6  | **File types** | **Custom allowlist** — **resolved (round 2)**; see [MIME allowlist (v1)](#mime-allowlist-v1). Exotic MIME types require a doc amendment.                                                                                                                                                                                                                                                                                                                                                              |
| Q7  | **Quota**      | **Hard cap** — **plan-derived** per organization (**2 GB** Free, **5 GB** Paid, plus **credit** bumps); block new uploads when at cap. Limit from **cached `quota_bytes`** (Autumn → DB sync per [autumn-usage-metering.md](./autumn-usage-metering.md)).                                                                                                                                                                                                                                             |
| Q8  | **Trash**      | **Trash** with **automatic purge after 7 days** — implies `**del` on blob** for hub/org files after retention window. **Scoped away** from personal avatar [Option A](./profile-avatar-blob.md) (no auto `del` for `loftlancer/avatars/`).                                                                                                                                                                                                                                                            |

## Decisions (user input 2026-11-14 round 2)

| #   | Topic                    | Decision                                                                                                                                                                                                                                                 |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Sequencing**           | **Organization before storage.** Ship Better Auth org plugin + active-org product context **first**; storage v1 is **gated** on that. **No** parallel mock/stub org layer for production storage paths.                                                  |
| R2  | **MIME allowlist**       | v1 allowlist documented below ([MIME allowlist (v1)](#mime-allowlist-v1)); exotic MIME types need requirements amendment.                                                                                                                                |
| R3  | **Permissions / layout** | **One default org storage root** per organization. **Org owner** manages storage inside that root (folders, items, grants). **Owner is the sole grantor** in v1 — managers and members access **only** via grants the owner issues (view + edit per Q1). |
| R4  | **Max file size**        | **4 MB** per file, enforced on the **multipart HTTP API route** (same pattern as personal avatar upload).                                                                                                                                                |
| R5  | **Trash purge job**      | **Vercel Cron** → **secured** route/worker: select items past **7-day** trash retention, finalize metadata, `**del`** blob by pathname (org prefixes only).                                                                                              |

## Decisions (user input 2026-11-14 round 3)

| #   | Topic                        | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R6  | **Share links / visibility** | Org files stay **within org** — **not** exposed elsewhere. “Public” means visibility **inside org** (granted members), **not** internet-wide public URLs. **Defer** external share-link slice to a later phase. v1 **access_mode:** org-private / **signed** URLs for authorized members; **no** v1 public blob URLs for org hub files except where mixed-by-purpose is strictly **org-scoped** sharing (still **no** anonymous/public CDN links for org files in v1). |
| R7  | **Sign-off defaults**        | Accept proposed defaults: folder **max depth 5**; signed URL TTL **1 hour**; org avatar via org settings at `loftlancer/orgs/{orgId}/avatar/`.                                                                                                                                                                                                                                                                                                                         |
| R8  | **Commercial edge cases**    | **Deferred** — org dissolution, export, cross-app upload.                                                                                                                                                                                                                                                                                                                                                                                                              |
| R9  | **Approval**                 | **APPROVED** — requirements locked. Implementation **gated** on Better Auth org slice first ([R1](#decisions-user-input-2026-11-14-round-2)).                                                                                                                                                                                                                                                                                                                          |

### MIME allowlist (v1)

| Category              | MIME type                                                                   | Typical extension |
| --------------------- | --------------------------------------------------------------------------- | ----------------- |
| **Images**            | `image/jpeg`                                                                | `.jpg`, `.jpeg`   |
|                       | `image/png`                                                                 | `.png`            |
|                       | `image/webp`                                                                | `.webp`           |
|                       | `image/gif`                                                                 | `.gif`            |
| **Documents**         | `application/pdf`                                                           | `.pdf`            |
|                       | `text/plain`                                                                | `.txt`            |
|                       | `text/csv`                                                                  | `.csv`            |
| **Office (Open XML)** | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`         | `.xlsx`           |
|                       | `application/vnd.openxmlformats-officedocument.wordprocessingml.document`   | `.docx`           |
|                       | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `.pptx`           |

_Exotic MIME:_ v1 is intentionally **standard business uploads** only. Types outside this table (archives, video, legacy Office, etc.) are **out of scope** until this doc is amended and re-approved.

## Blockers (before implementation)

| Blocker                                           | Why it matters                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Organization product + Better Auth org plugin** | **Only hard blocker** before storage implementation. Storage v1 is **org-first** and **gated** on Better Auth org plugin + active-org session ([better-auth.md](./better-auth.md)). **No** prod storage slice until the org slice is shipped per [Rollout phases](#rollout-phases-post-approval) step 1. |

**Sign-off defaults (decided round 3):** folder max depth **5**, signed URL TTL **1 hour**, org avatar path `loftlancer/orgs/{orgId}/avatar/` via org settings — see [R7](#decisions-user-input-2026-11-14-round-3).

**Personal avatars:** [profile-avatar-blob.md](./profile-avatar-blob.md) **Option A** is **unchanged** — no automatic blob delete for personal profile avatars. **Org hub files** use **7-day trash** and **blob `del`** on permanent delete / purge (org prefixes only).

## Goal

Give signed-in users in an **organization** a **real Account → Storage** experience: browse **org-scoped** folders and files, see **org usage vs plan limit** (2 GB / 5 GB + credits), upload/download/manage content per **folder permissions**, review **storage-related activity**, and use **trash** with **7-day** recovery before automatic purge — using **one Vercel Blob store** with prefix/ACL separation.

Today the repo has **shell routes and i18n labels** plus a **separate personal profile-avatar Blob pipeline** (not part of org inventory). This doc defines the **org storage system** (inventory hub), how it relates to personal vs org avatars, and what remains to decide before schema, APIs, or UI slices.

## User stories (target — after approval)

| ID  | As a…                        | I want…                                                           | So that…                                                                                                |
| --- | ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| S1  | Org member                   | An overview of org used vs **plan limit** (included + credits)    | The org knows if it is near the hard cap                                                                |
| S2  | Org member (with permission) | A searchable list of org files/folders I can access               | I can find shared org content                                                                           |
| S3  | Org member (with permission) | To upload allowlisted types within org quota                      | I can add org content without leaving Account                                                           |
| S4  | Org member (with permission) | To download or open files I am allowed to see                     | I can retrieve org data                                                                                 |
| S5  | Org member (with permission) | To rename, move, edit, or delete (or restore) per policy          | I can manage org storage footprint                                                                      |
| S6  | Org owner                    | To see **all** org storage items regardless of folder permissions | I can administer the org library                                                                        |
| S7  | Org owner                    | To grant folder or item permissions so members can view/edit      | Access matches org workflow (v1: **owner-only** grantor)                                                |
| S8  | Org member                   | A storage activity feed for events I am allowed to see            | I see uploads, deletes, quota, and permission changes                                                   |
| S9  | Support / ops                | Clear org_id, uploader, and ACL on every object                   | Incidents do not cross orgs                                                                             |
| S10 | User with personal avatar    | Personal avatar behavior unchanged                                | [profile-avatar-blob.md](./profile-avatar-blob.md) Option A still applies; avatar not listed in org hub |

**Non-goals until explicitly in scope:** Studio project assets, Autumn billing UI implementation (see [autumn-usage-metering.md](./autumn-usage-metering.md)), CDN admin, separate Blob stores, or replacing personal avatar storage without migration.

## What exists today (inventory)

### Implemented

| Area                                | Location / behavior                                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Account shell — Storage section** | Routes: `/account/storage`, `/account/storage/files`, `/account/storage/storage-activity`, `/account/storage/trash` (`apps/auth/.../account/storage/`*) |
| **Placeholder / incremental UI**    | `StoragePage` may use `UnavailablePage` until each slice ships; **decision:** replace with real UI per feature ([Q3](#decisions-user-input-2026-11-14)) |
| **Nav / tabs / hub**                | `shell.account-nav.config.ts`, `shell.account-section-tabs.client.ts`                                                                                   |
| **i18n keys**                       | `storage`, `files`, `storageActivity`, `trash` (en-us / en-in / es-es)                                                                                  |
| **Blob SDK wrapper**                | `@packages/blob` re-exports `put` / `del` from `@vercel/blob`                                                                                           |
| **Personal profile avatar uploads** | `POST /auth/api/profile/avatar` → `loftlancer/avatars/{uuid}.{ext}`, `access: "public"` — **outside org storage**                                       |
| **Form decoupling**                 | `features/form` avatar field; `useUploadAvatar` caller-provided                                                                                         |
| **Tests**                           | `tests/profile-avatar-*.test.tsx`; shell route state tests                                                                                              |

### Gaps

- No **Better Auth org** context or org roles in product
- No Postgres **org file / folder / permission** metadata
- No oRPC for list, upload, delete, trash, quota (org-scoped)
- No **org avatar** upload path in storage module
- No org quota enforcement (plan-derived cached limit)
- No **7-day** trash job / blob purge for org prefixes
- No storage-specific **activity** producers
- No private + signed URL pattern for org files (avatars still public under personal prefix)
- `del` policy: allowed for **org hub** trash purge; **forbidden** for personal avatar Option A

### Historical note (nav)

Phase 8 shell work introduced storage routes. **Product decision (2026-11-14):** ship **incremental real UI** as capabilities land — not permanent unavailable-only state.

## In scope (after approval — phased)

- [ ] **Requirements and data model** for **org-scoped** file/folder metadata synchronized with Vercel Blob objects (single store; org prefixes)
- [ ] **Permission model** — owner sees all and **sole grantor**; manager/member see owner-granted folders/items; view + edit when granted
- [ ] **Storage overview** — org used bytes, file count, **plan limit** (cached `quota_bytes`)
- [ ] **Files list** — folders, pagination, sort; empty/loading/error per shell conventions
- [ ] **Upload** — authenticated, **v1 MIME allowlist**, **4 MB** per file (multipart API), quota check
- [ ] **Download / access** — org-private + signed URLs for granted members; **no** v1 anonymous/public CDN links for org hub files ([R6](#decisions-user-input-2026-11-14-round-3))
- [ ] **Org avatar** — stored under org storage layout (not personal `loftlancer/avatars/`)
- [ ] **Delete / trash / restore** — soft trash; **automatic purge after 7 days** with `**del`** on blob pathname for org objects
- [ ] **Storage activity** — org-scoped events on approved operations
- [ ] **i18n** — three locales
- [ ] **Incremental UI** — each slice removes placeholder copy on the surfaces it implements

## Out of scope (default — unless added in this doc)

- **Personal profile avatars** in org inventory or quota (separate approved spec)
- Per-user personal file drives (non-org) unless added later
- Studio/Console/Web app-specific asset pipelines (Auth account hub first)
- **Separate** Vercel Blob stores for org vs avatars
- Automatic orphan sweeper for **personal** avatars (Option D) — [profile-avatar-blob.md](./profile-avatar-blob.md)
- Autumn subscription / credit purchase flows (billing module; [autumn-usage-metering.md](./autumn-usage-metering.md))
- Phase 9 full data export archive (may reference file list later)
- Direct browser → Blob upload bypassing API (future per [auth-api-migration.md](./auth-api-migration.md))
- **External share links** — internet-wide public org file URLs; deferred beyond v1 ([R6](#decisions-user-input-2026-11-14-round-3))
- **Commercial edge cases** — org dissolution, account/org export of files, cross-app (Studio/Console) upload — deferred ([R8](#decisions-user-input-2026-11-14-round-3))

## Architecture (layer map — proposed)

| Decision                 | Proposed owner                                      | Notes                                                                      |
| ------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------- |
| Vendor Blob I/O          | `@packages/blob`                                    | Same store; org path prefix convention TBD                                 |
| File metadata schema     | `@packages/drizzle` + migration                     | **Org-scoped** rows; folders; permissions                                  |
| Domain services / ACL    | `@modules/storage` (new)                            | Enforce org + role + owner-granted ACL                                     |
| oRPC + React Query       | `@modules/storage`                                  | Active org from session; never client-supplied org id without verification |
| Account UI               | `@modules/storage` screens; thin `apps/auth` routes | Incremental replacement of unavailable states                              |
| Shell config             | `@modules/shell`                                    | Live descriptions as tabs ship                                             |
| Personal avatar pipeline | `@modules/profile` unchanged                        | Option A; prefix `loftlancer/avatars/`                                     |
| Org avatar               | `@modules/storage` (or org module)                  | Under org prefix; counts toward quota                                      |

## Data model (proposed — not migrated)

**Entities (conceptual):**

- `**org_storage_folder**` — tree under `organization_id`; display name; optional parent folder
- `**org_storage_item**` (file) — blob metadata row
- `**org_storage_grant**` — links folder or item to member/role capability (view / edit)

`**org_storage_item` fields (sketch):**

| Field (conceptual)                                       | Purpose                                                                                                                                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                                     | Primary key; activity deep links                                                                                                                                                  |
| `organization_id`                                        | FK → org; all quota sums at this level                                                                                                                                            |
| `folder_id`                                              | Nullable FK → folder                                                                                                                                                              |
| `uploaded_by_user_id`                                    | Audit; not sole ACL authority                                                                                                                                                     |
| `display_name`                                           | User-facing name                                                                                                                                                                  |
| `content_type`                                           | MIME (must match allowlist when configured)                                                                                                                                       |
| `byte_size`                                              | Org quota sum                                                                                                                                                                     |
| `storage_provider`                                       | `vercel_blob`                                                                                                                                                                     |
| `blob_pathname`                                          | Provider path for `del` and signing                                                                                                                                               |
| `access_mode`                                            | **Org-private** default; access via **signed URLs** for authorized org members; **no** v1 `public` blob URLs for org hub content ([R6](#decisions-user-input-2026-11-14-round-3)) |
| `purpose`                                                | e.g. `org_upload`, `org_avatar` — drives access rules; external `share_link` purpose **deferred**                                                                                 |
| `status`                                                 | `active`, `trash`, `pending_upload`                                                                                                                                               |
| `created_at` / `updated_at` / `trashed_at` / `purged_at` | Trash lifecycle; purge after **7 days**                                                                                                                                           |
| `checksum` (optional)                                    | Integrity                                                                                                                                                                         |

**Blob layout (single store):**

| Prefix (conceptual)                               | Contents                                | Delete policy                               |
| ------------------------------------------------- | --------------------------------------- | ------------------------------------------- |
| `loftlancer/avatars/`                             | Personal profile avatars                | **Option A** — no auto `del`                |
| `loftlancer/orgs/{orgId}/…` (+ `avatar/` subpath) | Org files, org avatar, trash candidates | `**del**` on permanent delete / 7-day purge |

**Avatar integration (decided):**

- **Personal profile avatar** — **excluded** from org hub and quota; [profile-avatar-blob.md](./profile-avatar-blob.md).
- **Organization avatar** — **included** in org storage; managed via org filesystem; counts toward org quota.

## APIs (proposed)

| Surface                                    | Responsibility                                                 |
| ------------------------------------------ | -------------------------------------------------------------- |
| oRPC `storage.list`                        | Org-scoped; filter by folder; respect grants; owner bypass     |
| oRPC `storage.getUsage`                    | Sum `byte_size` for org vs **cached `quota_bytes`**            |
| oRPC `storage.initUpload` + HTTP multipart | Quota + allowlist checks                                       |
| oRPC `storage.delete` / `restore`          | Soft trash; schedule purge                                     |
| oRPC `storage.emptyTrash` / purge worker   | After **7 days**, metadata finalize + `del` by pathname        |
| oRPC `storage.grants.*`                    | Folder/item permissions (shape TBD)                            |
| Compatibility HTTP                         | Per [auth-api-migration.md](./auth-api-migration.md) if needed |

**Personal avatar (unchanged):** `POST /auth/api/profile/avatar` remains profile-owned.

## Security and ACL

- **Authority:** Session + **active organization**; oRPC derives `organization_id` and role — never trust client-supplied org or owner ids for authorization.
- **Roles (org):**
  - **Owner** — read/write all org storage; **sole grantor** in v1 (folders, items, grants inside the org root).
  - **Manager** — read/write only where **owner-granted**.
  - **Member** — read/write only where **owner-granted** on folder or item.
- **Grants:** Required for manager/member visibility; grant implies **view and edit** (Q1). Only **owner** may create/update/revoke grants in v1.
- **Signed items:** Each stored object associated with permission metadata; access URLs **signed** — default TTL **1 hour** ([R7](#decisions-user-input-2026-11-14-round-3)).
- **Cross-org:** Deny list/read/write/delete across org boundaries (consistent 403/404 policy).
- **Org file access (v1):** Org hub blobs are **org-private**; members with grants reach content via **signed URLs** (not internet-wide public CDN links). “Public” in product language means **visible inside org** to granted members only ([R6](#decisions-user-input-2026-11-14-round-3)). **Personal** profile avatars remain public under `loftlancer/avatars/` per [profile-avatar-blob.md](./profile-avatar-blob.md).
- **Path traversal:** Server generates blob paths under org prefix; clients do not choose raw pathnames.
- **Content validation:** v1 [MIME allowlist](#mime-allowlist-v1) + magic-byte checks; reject others with stable error copy.
- **Rate limits:** Upload count and bytes per window — TBD.
- **Soft-deleted users/orgs:** Block new uploads; define read/trash behavior with [account-data-retention-deletion.md](./account-data-retention-deletion.md).

## Quotas and limits (decided + TBD)

**Amendment — quota (plan-based limits):** **Applied (2026-11-14)** — joint sign-off with [autumn-usage-metering.md](./autumn-usage-metering.md). Document remains **Approved** with amended quota model below.

| Limit                    | Personal avatar (today) | Org storage (v1)                                                                                                                                                            |
| ------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Org total cap            | N/A                     | **Plan-derived hard cap** — **2 GB** (Free), **5 GB** (Paid), plus **consumable credits** for monthly storage increases; block uploads at limit                             |
| Limit source             | N/A                     | **Drizzle** enforces `sum(byte_size)` vs **cached `quota_bytes`** synced from Autumn on subscription/credit events ([autumn-usage-metering.md](./autumn-usage-metering.md)) |
| Max single file          | 5 MB (UI)               | **4 MB** — enforced on multipart API route                                                                                                                                  |
| Allowed types            | png/jpeg/gif/webp       | v1 [MIME allowlist](#mime-allowlist-v1) (Office Open XML + PDF/text/images)                                                                                                 |
| Trash retention          | N/A                     | **7 days** then **Vercel Cron** secured purge + blob `del`                                                                                                                  |
| Personal avatar in quota | No                      | No                                                                                                                                                                          |

**Implementation (v1 target + interim):** Authoritative product limits are **plan-derived** per table above. Until **Autumn → DB plan-limit sync** ships, the org storage slice **may** use a **5 GB constant** for gates and UI copy; replace with cached `quota_bytes` when billing sync lands — do not ship production plan sync without aligned limits.

## End-to-end UX flows (target)

### Overview (`/account/storage`)

1. User with active org opens Storage overview.
2. Client loads org `getUsage` + recent summary.
3. Shows progress toward **plan limit** (`used` / `quota_bytes`), links to Files / Activity / Trash.

### Upload (Files tab)

1. User with edit grant selects file via FormKit.
2. Server validates allowlist + quota + permissions; writes blob under org prefix; inserts metadata.
3. Activity recorded; list invalidates.

### Permissions

1. **Owner** grants folder/item access to members (v1: no delegate grantors).
2. Granted members see and edit items in scope; others do not.

### Delete / trash

1. Delete → `status=trash`, `trashed_at` set.
2. User may **restore** within **7 days**.
3. **Vercel Cron** secured worker purges items past retention: metadata finalized + `**del(blob_pathname)`** — **never** personal avatar prefix.

### Storage activity

1. Org-scoped feed with storage `actionId`s.
2. Filtered by visibility rules where applicable.

## Environment and dependencies

| Variable                | Required (today) | Used by                                     |
| ----------------------- | ---------------- | ------------------------------------------- |
| `BLOB_READ_WRITE_TOKEN` | Yes              | Personal avatar; org storage                |
| `BLOB_STORE_ID`         | Yes              | Same single store                           |
| `DATABASE_URL`          | Yes              | Org metadata, permissions, trash scheduling |

**Provider (decided):** **One Vercel Blob store** — logical separation via prefixes and ACL/signing, not multiple stores.

## Plugins / integrations

| Capability             | v1                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel Blob            | **Yes** — single store                                                                                                                             |
| Better Auth org plugin | **Required blocker** — [better-auth.md](./better-auth.md)                                                                                          |
| Billing meter          | **Autumn** (approved) — subscriptions, credits, invoices; org quota limits synced to DB per [autumn-usage-metering.md](./autumn-usage-metering.md) |

## Roles and authorization

v1 storage is **organization-first**:

- **Owner** — full visibility; sole grantor and storage administrator in v1.
- **Manager / member** — owner-granted visibility and edit only.
- Personal account-only session **without org** — storage hub behavior TBD until org switcher exists (likely empty state or org picker).

## i18n

- Auth `ui` namespace; en-in / es-es parity.
- Quota strings reflect **plan limit** (e.g. 2 GB / 5 GB + credits) and hard-block behavior.
- Incrementally replace `featureNotAvailable` on shipped tabs.

## Testing and verification (after implementation)

| Area              | Approach                                                            |
| ----------------- | ------------------------------------------------------------------- |
| Unit              | Quota math, grant checks, owner bypass, allowlist                   |
| oRPC              | Cross-org and cross-user denial                                     |
| Trash job         | 7-day purge calls `del` only on org paths                           |
| Avatar regression | Personal upload still Option A (no `del` on replace/delete account) |

**Finish gate:** `pnpm check` per slice after approval ([workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)).

## Rollout phases (post-approval)

1. **Unblock org product (prerequisite)** — Better Auth org plugin + active-org context per [better-auth.md](./better-auth.md). **Storage work does not start in parallel**; no prod mock org for storage ([R1](#decisions-user-input-2026-11-14-round-2)).
2. ~~**Resolve remaining sign-off items**~~ — **Done** (round 3): max folder depth **5**, signed URL TTL **1 hour**, org avatar path ([R7](#decisions-user-input-2026-11-14-round-3)).
3. **Foundation** — Schema + org usage/list (owner + grants); overview UI (real empty state).
4. **Upload + folders** — Allowlist enforced; quota hard cap.
5. **Permissions UI** — Grants for folders/items.
6. **Trash + purge job** — 7-day retention; **Vercel Cron** secured route + blob `del`.
7. **Org avatar** — Upload path under org storage.
8. **Share links** — **Deferred** (not v1); no external public org blob URLs ([R6](#decisions-user-input-2026-11-14-round-3)).

## Conflicts and alignment with approved / draft specs

| Topic                     | Conflict?                                                           | Resolution                                                                          |
| ------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Avatar **Option A**       | **No** if purge scoped to org prefixes only                         | Org hub uses `del` on trash purge; personal `loftlancer/avatars/` unchanged         |
| Account delete + Blob     | **UX** for org vs personal                                          | Personal avatars retain; org files follow org trash/purge and org lifecycle TBD     |
| better-auth **no org v1** | **Yes** — storage blocked                                           | Implement org context first ([Blockers](#blockers-before-approval--implementation)) |
| Single Blob store         | **Aligned** with [profile-avatar-blob.md](./profile-avatar-blob.md) | Prefix + ACL separation                                                             |

## Gaps / open questions

_Answered items: [Decisions](#decisions-user-input-2026-11-14) (round 1), [round 2](#decisions-user-input-2026-11-14-round-2), and [round 3](#decisions-user-input-2026-11-14-round-3) (sign-off)._

### Blocking (org only — implementation gate)

- [ ] **Active org context** — Switcher, session field, behavior when user belongs to zero orgs — ships with [better-auth.md](./better-auth.md) org slice ([Blockers](#blockers-before-approval--implementation)).

### Resolved (round 2 — no longer open)

- [x] **MIME / extension allowlist (Q6)** — [MIME allowlist (v1)](#mime-allowlist-v1); exotic types via doc amendment.
- [x] **Permission grantor (v1)** — **Owner-only** grantor; manager/member grant-scoped ([R3](#decisions-user-input-2026-11-14-round-2)).
- [x] **Max single-file size** — **4 MB** on multipart API route ([R4](#decisions-user-input-2026-11-14-round-2)).
- [x] **7-day trash job mechanism** — **Vercel Cron** secured route ([R5](#decisions-user-input-2026-11-14-round-2)).

### Decided (round 3 — sign-off defaults)

- [x] **Folder model** — Max depth **5**; slug-safe folder names; single **org root** with owner-full tree; uploads default to root until user picks folder; members see only granted subtrees ([R7](#decisions-user-input-2026-11-14-round-3)).
- [x] **Signed URL TTL** — Private download/open for org members **1 hour** ([R7](#decisions-user-input-2026-11-14-round-3)); external share-link slice may define separate TTL when implemented.
- [x] **Org avatar upload path** — Org settings entry; blob under `loftlancer/orgs/{orgId}/avatar/`; counts toward quota; owner-only upload; replace updates metadata + new blob object (old blob trashed per policy) ([R7](#decisions-user-input-2026-11-14-round-3)).

### Product / technical (later slices)

- [ ] **Share link purpose** — **Deferred** beyond v1 ([R6](#decisions-user-input-2026-11-14-round-3)) — who can create, revocation, analytics, external public URL shape.

### Commercial and cross-cutting (deferred)

- [ ] Org dissolution — what happens to blob + metadata? ([R8](#decisions-user-input-2026-11-14-round-3))
- [ ] Include org files in account-delete / org-export flows? ([R8](#decisions-user-input-2026-11-14-round-3))
- [ ] Cross-app upload from Studio/Console? ([R8](#decisions-user-input-2026-11-14-round-3))

## Additional findings to resolve before implementation

- **Proposed approach:** Use atomic quota reservations, recoverable pending uploads, grant-aware queries, and serialized restore/purge operations, with tests for races and partial failures. See the [design answers](./entitlements-design-answers.md#storage-system). Count each pending upload once and do not add trashed bytes again on restore if they already count. The proposed single-store public/private implementation is invalid and remains blocked pending an architecture amendment.

- **Blob access conflict:** Public personal avatars and private organization files cannot be separated solely by prefixes in one store: Vercel Blob access is configured per store. Reconcile the single-store decision with private access before implementation. See [Vercel Blob access modes](https://vercel.com/docs/vercel-blob).
- **Atomic quota:** Reserve quota for concurrent and pending uploads and reconcile reservations when uploads fail or expire. Define whether pending files, trash, and replaced avatars count until permanent deletion.
- **Plan transitions:** Resolve the interim 5 GB limit against the approved Free limit of 2 GB, and define upload, restore, read, and delete behavior when a plan change leaves an org over quota.
- **Blob and metadata consistency:** Define recovery for failed metadata commits after upload, failed blob deletes, interrupted uploads, and orphaned blobs; make cleanup retryable and scoped to the correct organization.
- **Grant inheritance:** Specify inherited versus direct grants, visibility of ancestor folders, and permission changes when files or folders are moved, restored, or grants revoked. Apply checks to search, activity, metadata, and downloads.
- **Signed URL revocation:** A previously issued URL may remain usable until expiry after membership or grant revocation. Decide whether this exposure is acceptable or access requires reauthorization on each request.
- **Folder and trash behavior:** Define duplicate names, recursive deletion and restoration, missing original parents, retention timestamps, restore-versus-purge races, move cycles, and depth validation for all descendants.
- **Content validation and delivery:** Verify actual file contents rather than trusting client MIME types, including Open XML containers; define safe filenames, download headers, and handling of active content.
- **Organization avatars:** Define who can view an org avatar independently of file grants and how replacement, trash, quota, and access interact.
- **Purge operations:** Define locking, idempotent retries, authorization, monitoring, and recovery for overlapping cron runs and provider failures.
- **Verification:** Exercise concurrent quota gates, grant changes, signed URL expiry, upload and delete failures, and restore/purge races in integration tests.

## Implementation slices (after approval)

1. **Org dependency slice (prerequisite)** — Better Auth org plugin + active org ([better-auth.md](./better-auth.md)); **blocks** all storage slices ([R1](#decisions-user-input-2026-11-14-round-2)).
2. Schema: folders, items, grants + org usage read APIs; overview UI.
3. Upload + allowlist + hard cap vs cached `quota_bytes`.
4. Grants management UI + enforcement in list/read/write.
5. Trash, restore, 7-day purge worker + `del`.
6. Org avatar ([R7](#decisions-user-input-2026-11-14-round-3)); share-link slice **not** in v1 ([R6](#decisions-user-input-2026-11-14-round-3)).
7. i18n + incremental shell updates per shipped tab.

## Validation checklist (before sign-off)

- [x] MIME allowlist specified ([MIME allowlist (v1)](#mime-allowlist-v1))
- [x] v1 permission grantor: owner-only ([R3](#decisions-user-input-2026-11-14-round-2))
- [x] Max file **4 MB**; trash purge via **Vercel Cron** ([R4](#decisions-user-input-2026-11-14-round-2), [R5](#decisions-user-input-2026-11-14-round-2))
- [x] Sequencing: org before storage ([R1](#decisions-user-input-2026-11-14-round-2))
- [x] Org blocker acknowledged — storage implementation starts **after** Better Auth org slice ([R1](#decisions-user-input-2026-11-14-round-2), [R9](#decisions-user-input-2026-11-14-round-3))
- [x] Single Vercel Blob store + prefix convention named (`loftlancer/orgs/{orgId}/…`, personal `loftlancer/avatars/`)
- [x] Plan-derived org cap (2 GB / 5 GB + credits) and 7-day trash + blob `del` for org paths explicit (amendment **Applied 2026-11-14**)
- [x] Personal avatar Option A explicit (no contradiction)
- [x] Folder model — max depth **5** accepted ([R7](#decisions-user-input-2026-11-14-round-3))
- [x] Signed URL TTL — **1 hour** accepted ([R7](#decisions-user-input-2026-11-14-round-3))
- [x] Org avatar path — org settings + `loftlancer/orgs/{orgId}/avatar/` accepted ([R7](#decisions-user-input-2026-11-14-round-3))
- [x] Share-link slice — **out of v1**; org-private/signed access only ([R6](#decisions-user-input-2026-11-14-round-3))
- [x] User confirmed sign-off — **APPROVED** ([Approval](#approval))

## Approval

**Sign-off summary** (storage requirements locked; implementation **after** Better Auth org slice):

| Item                                                                             | Status                                                                                                              |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Round 2 decisions (sequencing, MIME, owner-only grants, 4 MB, Vercel Cron trash) | **Accepted**                                                                                                        |
| **Folder model**                                                                 | **Accepted** — max depth **5** ([R7](#decisions-user-input-2026-11-14-round-3))                                     |
| **Signed URL TTL**                                                               | **Accepted** — **1 hour** ([R7](#decisions-user-input-2026-11-14-round-3))                                          |
| **Org avatar path**                                                              | **Accepted** — org settings + `loftlancer/orgs/{orgId}/avatar/` ([R7](#decisions-user-input-2026-11-14-round-3))    |
| **Org prerequisite**                                                             | **Acknowledged** — storage starts **after** Better Auth org slice                                                   |
| **Share links**                                                                  | **Deferred** — org-only visibility; no v1 external public org URLs ([R6](#decisions-user-input-2026-11-14-round-3)) |
| **Commercial**                                                                   | **Deferred** — dissolution / export / cross-app ([R8](#decisions-user-input-2026-11-14-round-3))                    |

**Quota amendment (2026-11-14):**

| Item                                                  | Status                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Plan-derived limits (2 GB Free / 5 GB Paid + credits) | **Approved** — [autumn-usage-metering.md](./autumn-usage-metering.md) joint sign-off |
| Amendment record                                      | **Applied (2026-11-14)** — [Quotas and limits](#quotas-and-limits-decided--tbd)      |

**Sign-off record:**

- [ ] User: **APPROVED** (requirements locked; implement after org slice)
- [ ] User: **APPROVED** quota amendment (plan-derived limits; 2026-11-14 chat)

- **Approved by:** User (chat sign-off 2026-11-14)
- **Date:** 2026-11-14 (initial); quota amendment **2026-11-14**

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)
