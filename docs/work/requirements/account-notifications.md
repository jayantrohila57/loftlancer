# Requirements: Account notifications

**Status:** Approved — Phase 9 batch C1–C5 (email-only, no history)  
**Approved by:** Product owner — **2026-11-15**  
**Layers:** packages / modules / apps  
**Roadmap:** Phase 9 — [auth-account-roadmap.md](../auth-account-roadmap.md)  
**Decisions queue:** [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md) (Notifications)

## Goal

Let signed-in users control **how** they are notified about approved product events and review a **delivery history**, without exposing another user’s data.

## In scope (proposed — not approved)

- [ ] Preference UI under `/account/notifications` (categories + channels).
- [ ] Owner-scoped **in-app** notification history with pagination.
- [ ] oRPC: list/patch preferences; list history.
- [ ] Server delivery hook for approved event types only (see catalog).
- [ ] Localization for Account strings (`en-us`, `en-in`, `es-es`).

## Out of scope (v1 proposal)

- Mobile push (APNs/FCM).
- Marketing / newsletter opt-in.
- Admin broadcast to all users.
- Third-party notification vendors beyond email (Phase 12).

## Architecture

| Layer                   | Responsibility                                                                 |
| ----------------------- | ------------------------------------------------------------------------------ |
| `packages/drizzle`      | `notification_preference`, `notification_delivery` schema (after approval)     |
| `modules/notifications` | Domain UI, oRPC controller, delivery adapters                                  |
| `apps/auth`             | Thin routes only                                                               |
| Existing producers      | Security, billing, org modules emit through a shared `enqueueNotification` API |

## Event catalog (proposed v1)

| Category     | Example `actionId` / trigger                      | Default channel |
| ------------ | ------------------------------------------------- | --------------- |
| Security     | Session revoked (not current), new device sign-in | In-app + email  |
| Billing      | Payment failed, subscription canceled             | In-app + email  |
| Organization | Invite received, role changed                     | In-app + email  |

Exact IDs must align with [application-activity.md](./application-activity.md) where events already exist.

## Authorization

- Session required; **ownerUserId** from server session only.
- No org-admin visibility into another member’s notification prefs in v1.

## Gaps / open questions

See [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md) **batch C (C1–C5)**.

### Requirements review (item 113 — 2026-11-14)

**Tracker:** Checklist row **36** · action **AUTH-NOTIFY-01** · [auth-page-action-report.md](../auth-page-action-report.md).

| Topic              | Draft spec (this file, in scope)                    | Decision queue **recommended default**                                           | Action                                                |
| ------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Channels v1        | In-app + email in event catalog                     | **Email only** (C2)                                                              | Amend spec to match C2 unless product approves in-app |
| History            | Owner-scoped in-app feed + pagination               | **None** in v1 (C4)                                                              | Drop history from v1 slice or get explicit exception  |
| Scope              | Per-user (implied)                                  | **Per-user** (C1)                                                                | Aligned                                               |
| Categories         | Security, billing, org                              | Security (required on), billing (owner emails), org invites, product opt-in (C3) | Confirm billing emails are **owner-only** in UI copy  |
| Storage            | `notification_preference` + `notification_delivery` | `user_notification_preference` or JSON on prefs (C5)                             | Pick one at approval                                  |
| Producers / Resend | Phase 12 email                                      | Resend when available (A2)                                                       | No delivery code before sign-off                      |

**Repo state (no backend):** `apps/auth` routes are thin exports; `NotificationsPage` is `featureNotAvailable` (`@modules/shell`). Regression: `tests/phase9-account-sections.test.tsx`, route shells in `tests/auth-account-shell-route-states.test.tsx`.

**Worker rule:** Do not add Drizzle tables, oRPC, or preference UI until **Approved by** is set and batch **C1–C5** (or amended scope) is recorded in the decisions doc sign-off log.

## Implementation slices (after approval)

1. Schema migration + oRPC list/patch preferences.
2. History list UI + empty/loading/error states.
3. Wire first producers (security session revoke).
4. Email channel when Resend/deploy approved (Phase 12).

## Validation before approval

- [ ] User confirms event catalog and channels.
- [ ] Retention (90d history) and isolation tests planned.
- [ ] No implementation before **Approved by** filled.
