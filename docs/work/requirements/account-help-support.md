# Requirements: Account help and support

**Status:** Approved — E1–E4 + HC1–HC6 (2026-11-15)  
**Approved by:** Product batch defaults  
**Layers:** modules / apps  
**Roadmap:** Phase 9 — [auth-account-roadmap.md](../auth-account-roadmap.md)  
**Decisions queue:** [phase-9-product-decisions-request.md](../phase-9-product-decisions-request.md) (Help & Support)

## Goal

Provide **self-serve help** inside Account and **mailto support** for signed-in users, localized where content exists.

## In scope (v1 — approved)

- [x] **Help center** at `/account/help-support/help-center` — browse/search articles.
- [x] **Support contact** at `/account/help-support/support-tickets` — **mailto** via `SUPPORT_EMAIL` (E2/E3); no ticket DB.
- [x] Overview hub at `/account/help-support`.
- [x] i18n for chrome; article body per locale with **en-us** fallback (HC3).

## Out of scope (v1)

- Live chat / Intercom.
- Public anonymous help (may link to marketing site).
- Ticket DB, FormKit tickets, article oRPC (HC6).
- Status page (E4).

## Architecture

| Layer                        | Responsibility                                 |
| ---------------------------- | ---------------------------------------------- |
| `content/help/{locale}/*.md` | Git-managed articles (HC1)                     |
| `modules/help`               | Article loader + list/detail + mailto UI (HC5) |
| `modules/shell`              | Hub overview links only                        |
| `apps/auth`                  | Thin routes                                    |

## Authorization

- Articles: **authenticated users** only (routes under account shell).
- Support mailto: session user id + locale pre-filled (E3); no PII beyond user email in client.

## Environment

| Variable        | Required | Purpose            |
| --------------- | -------- | ------------------ |
| `SUPPORT_EMAIL` | Optional | mailto target (E2) |

## Implementation notes

- Seed articles: billing, storage, organization, security (`content/help/en-us/`).
- Client search filters title + excerpt (HC2).
- `en-in` uses fallback; `es-es` includes partial translations.
