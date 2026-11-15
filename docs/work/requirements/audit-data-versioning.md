# Requirements: Audit snapshots for changed and deleted data

**Status:** Draft — **direction recorded** (2026-11-14 batch); not approved until sign-off  
**Approved by:** _(pending)_  
**Layers:** packages / modules  
**Related:** [application-activity.md](./application-activity.md) (critical before/after) · [profile-avatar-blob.md](./profile-avatar-blob.md) · [account-data-retention-deletion.md](./account-data-retention-deletion.md)

## Goal

Record product direction: **store changed and deleted field data in the audit layer** so operators (and approved product flows) can support **versioning**, **undo**, and **reverse** operations where policy allows — aligned with the broader **audit strategy**, not ad-hoc per feature.

This pass is **requirements only**. No schema, retention jobs, or undo UI until explicit approval and **go implement**.

## User direction (2026-11-14 batch)

When application data is **updated** or **deleted** (including soft delete and profile/Blob-adjacent changes):

1. **Retain** prior values (or a redacted snapshot) in the **audit trail**, not only the new state.
2. Use this store for **version history**, **undo** (where product approves), and **reverse** / rollback workflows — not as a substitute for user-facing activity feed semantics ([application-activity.md](./application-activity.md)).
3. **Align** with existing **critical before/after** recording on `activity_event` where classified critical; extend with a durable snapshot model where before/after on the event row is insufficient (e.g. large text, Blob URL churn, soft-deleted rows).

## Relationship to other surfaces

| Surface                        | Role                                                                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Activity feed**              | Owner-scoped, user-visible history of **approved** operations — not a full data archive.                                    |
| **Diagnostic logs**            | Correlation and ops visibility; not authoritative for field-level undo.                                                     |
| **Audit snapshots (this doc)** | **Authoritative** retained prior state for approved domains — implementation shape TBD (table, event payloads, or sidecar). |

**Profile avatars ([profile-avatar-blob.md](./profile-avatar-blob.md)):** Option A retains Blob objects; audit snapshots should still record **previous `image` URL** (and path if Option C is adopted later) on change/clear so undo/reverse does not depend on guessing from Blob alone.

**Account soft delete ([account-data-retention-deletion.md](./account-data-retention-deletion.md)):** Tombstoned users remain in Postgres; audit must capture **deletion consent event** and **last-known profile snapshot** for support and email “last copy” flows — distinct from telling the user data was “erased” in UX.

## Out of scope (until approved)

- Public version history UI, arbitrary user undo of any field, or time-travel editors.
- Storing full biography or secrets in activity metadata without redaction policy.
- Replacing platform log retention (Phase 12).

## Gaps / open questions

- [ ] **Storage shape:** Dedicated `audit_revision` (or similar) table vs extended activity metadata vs hybrid.
- [ ] **Retention:** Same as soft-deleted user retention (indefinite until manual purge) or shorter TTL for non-account data.
- [ ] **Undo scope:** Which domains get user-initiated undo in v1 (profile only vs prefs vs location).
- [ ] **Sign-off:** User **approved** + **go implement** before migrations.

## Validation checklist (before sign-off)

- [x] Direction recorded (2026-11-14 batch).
- [ ] Storage model and retention aligned with Phase 6 and activity policy.
- [ ] Cross-links updated in [profile-avatar-blob.md](./profile-avatar-blob.md) and implementation slices defined.
