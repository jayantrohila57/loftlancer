# Requirements: Profile avatar Blob storage

**Status:** **Approved — Option A** (no automatic blob delete); upload + failure surfaces verified historically  
**Approved by:** user (2026-11-14, Option A orphan policy)  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 4 — _Verify Blob-backed upload, storage failure, and orphan-file cleanup policy_ (live browser verification deferred — user runs `scripts/work/profile-browser-qa.mjs` locally)

## Goal

Document how authenticated avatar file uploads use Vercel Blob, how storage failures surface to the user, and what happens to Blob objects that are no longer referenced by `user.image`. Upload exists; orphan handling is **Option A** (retain objects; no automatic `del`).

## Environment

| Variable                | Required                     | Purpose                                                      |
| ----------------------- | ---------------------------- | ------------------------------------------------------------ |
| `BLOB_READ_WRITE_TOKEN` | Yes (file uploads)           | `@vercel/blob` `put` in `modules/profile` → `@packages/blob` |
| `BLOB_STORE_ID`         | Yes (Vercel project linkage) | Vercel Blob store binding                                    |

When either variable is missing, `put` fails at runtime and the profile service returns `UPLOAD_FAILED` (see below). No separate `t3-env` schema entry; the Blob SDK reads these from `process.env`.

**Local verification (2026-11-14):** `apps/auth/.env` defines both variables. A minimal PNG `put` to prefix `loftlancer/verify-phase4/` succeeded against the configured store (`*.public.blob.vercel-storage.com`). CI and agents without Blob credentials should rely on unit tests (mocked `storeAvatar`) and treat live `put` as optional.

## Architecture (current)

1. **HTTP:** `POST /auth/api/profile/avatar` → `uploadProfileAvatar` (`modules/profile/src/server/profile.compatibility.ts`).
   - Same-origin + session required (401/403).
   - Content-length and streamed body bounded before multipart parse (413).
2. **Service:** `uploadAvatar` validates size, magic-byte signature, and matching `File.type` (png/jpeg/gif/webp), then `profileRepository.storeAvatar`.
3. **Storage:** `storeAvatar` calls `put` with path `loftlancer/avatars/{uuid}.{ext}`, `access: "public"`, `addRandomSuffix: true` (`modules/profile/src/server/repositories/profile.repository.avatar.ts`).
4. **Persistence:** Upload returns `{ url }` only. The client field `afterUpload` calls `authClient.updateUser({ image: url })` separately (`ProfileAccountAvatar`). **Blob write and user record update are not one transaction.**

`@packages/blob` exports `put` and `del`. **`buildProfileAuthDatabaseHooks` does not register a `user.update` hook** (`modules/profile/src/server/shared/profile.auth-database-hooks.ts` returns `{}`). Prior Blob URLs remain reachable after replace, clear, or failed persist (**Option A** — intentional; no automatic delete).

**Disposable QA script:** `scripts/work/profile-browser-qa.mjs` creates a DB session user and exercises profile UI + optional live Blob upload. While auto-`del` is disabled, the script expects **prior blobs to stay reachable** (orphans retained), not Option B delete behavior.

## Storage failure behavior (verified)

| Layer         | Condition                                             | Client outcome                                                                                                                    |
| ------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Compatibility | No session / wrong origin                             | 401 / 403 JSON `{ error }`                                                                                                        |
| Compatibility | Oversize body                                         | 413                                                                                                                               |
| Service       | Empty, oversized, spoofed MIME, bad signature         | `status: "failed"` → HTTP 400                                                                                                     |
| Service       | `put` throws (missing token, network, provider error) | Logged `service.failed` (`UPLOAD_FAILED`); `status: "error"` → HTTP **503** `{ error: "Image upload failed. Please try again." }` |
| Client hook   | Non-OK or invalid body                                | `Error` with server message or generic upload failure                                                                             |

**Automated:** `pnpm vitest run tests/profile-avatar-*.test.tsx` — route bounds (413), MIME/signature/spoof rejection (400), mocked `storeAvatar` rejection → `UPLOAD_FAILED` (503); see `tests/profile-avatar-image-inputs.test.tsx` for HTTP + service matrix.

## Orphan Blob scenarios (observed, not policy)

An object in Blob storage can outlive its usefulness because nothing deletes it when:

| Scenario                                    | Blob written?  | `user.image` updated?      | Orphan?                                                                                                                          |
| ------------------------------------------- | -------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Upload OK, `updateUser` fails               | Yes            | No (old value kept)        | **Yes** — URL only on upload response                                                                                            |
| User uploads new file                       | Yes (new URL)  | Yes (new URL)              | **Yes** — prior Blob URL if it was a prior upload                                                                                |
| User clears avatar or switches to HTTPS URL | N/A / external | Yes (null or external URL) | **Yes** — prior uploaded Blob                                                                                                    |
| Account deletion                            | —              | User row removed           | **Yes** — Blob objects remain ([account-data-retention-deletion.md](./account-data-retention-deletion.md) inherits **Option A**) |

External HTTPS avatars are never stored in Blob; only file-upload paths use `put`.

## Orphan-file cleanup — **Option A (approved)**

**Approved policy:** **Option A** — no automatic blob deletion in application code.

**Current behavior:** Automatic deletion is disabled (no-op `buildProfileAuthDatabaseHooks`). Unused objects remain in the shared Blob store after replace, clear, failed persist, or account deletion until manual ops or a future approved option (B–D) ships.

**Explored and reverted:** A prototype Option B hook (`del` on previous `user.image` when URL matches `isStoredProfileAvatarBlobUrl`) was removed after security review (URL prefix does not prove ownership; concurrent `updateUser` tabs can race `del`). Replaced by the no-op hook and safety-focused unit tests in `tests/profile-avatar-blob-cleanup.test.tsx`.

### Option A — No automatic cleanup (document-only) — **selected**

- Leave orphans in the shared store; accept storage growth.
- Rely on Vercel dashboard / manual ops for rare cleanups.
- **Pros:** Zero code; no risk of deleting a URL still cached or referenced elsewhere. **Cons:** Unbounded orphans; compliance cost if users expect deletion on account erase.

### Option B — Best-effort delete on profile image change

- When `updateUser` sets `image` to a new URL or `null`, if the **previous** `user.image` host matches the known Blob store and path prefix `loftlancer/avatars/`, call `del` (add to `@packages/blob`).
- **Pros:** Stops accumulation for normal avatar churn. **Cons:** Does not fix upload-without-persist orphans; race if two tabs upload; must not delete non-owned URLs.

### Option C — Track blob pathname on user (or side table)

- Persist `avatarBlobPath` (or similar) alongside `image` after successful upload; delete by path on replace, remove, and approved account deletion (coordinate with [account-data-retention-deletion.md](./account-data-retention-deletion.md) if policy changes from Option A).
- **Pros:** Reliable attribution; supports account deletion sweep. **Cons:** Schema/migration; upload flow must set both fields atomically as far as possible.

### Option D — Deferred job / sweeper

- Periodic job: list prefix `loftlancer/avatars/`, delete objects with `createdAt` older than _N_ days and URL not present in any `user.image`.
- **Pros:** Cleans upload-without-persist orphans. **Cons:** Lag; DB scan cost; _N_ and job infra must be approved.

## Audit and versioning (product direction)

**2026-11-14 batch:** Prior `user.image` values (and future pathname fields if Option C is adopted) should be captured in the **audit / versioning** layer on change, clear, and soft-delete — for undo, reverse, and support — not only in transient upload responses. See [audit-data-versioning.md](./audit-data-versioning.md). Blob **Option A** (retain objects) complements this: audit holds **which URL was current**, storage may still hold orphaned blobs.

**Upload UX (code):** Multipart upload, storage failure (503), client preview/upload failure, retry, and removal paths are implemented and covered by unit/component tests (roadmap journal). **Live browser** verification remains on the user waiver (`scripts/work/profile-browser-qa.mjs`); user may run Blob flows in the browser independently — waiver unchanged.

## Gaps / open questions

- [x] **Orphan option:** **A** approved 2026-11-14 (no auto-`del`). Options B–D remain documented for future scope change only.
- [x] **Audit snapshots on image change/clear:** Direction recorded — [audit-data-versioning.md](./audit-data-versioning.md) (2026-11-14 batch); implementation deferred.
- [ ] Should verification-phase test objects under `loftlancer/verify-phase4/` be deleted manually or by a one-off script after policy approval?
- [ ] Is live end-to-end upload via browser (session cookie → multipart → `updateUser`) required for this checkbox, or is unit + SDK `put` sufficient until Phase 12 deployment verification?
- [ ] Cross-origin upload from non-Auth apps: `useUploadAvatar` uses default `fetch` credentials (`same-origin`). Confirm whether Studio/Console will ever call this endpoint from another origin and need `credentials: "include"` + CORS.

## Validation checklist

- [x] Env vars documented
- [x] Upload path and two-step persist described
- [x] Storage failure mapping documented and unit-tested
- [x] No-op profile DB hooks documented (code review 2026-11-14 resume; matches `buildProfileAuthDatabaseHooks`)
- [x] Safe orphan cleanup policy **approved** — **Option A**; implementation = no-op DB hooks (code review 2026-11-14)
- [ ] Browser verification of upload → `updateUser` → replace/clear with **retained** orphans (deferred — **user waiver:** run `scripts/work/profile-browser-qa.mjs` locally when Auth dev server + disposable QA user available; not run in agent passes)
