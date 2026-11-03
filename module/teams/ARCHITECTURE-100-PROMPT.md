# Teams module → 100% architecture rules (agent prompt)

Use this as the **handoff prompt** for Cursor, Codex, or other agents. Base branch: **`dev`**. Mechanical gate: **`pnpm audit:module-architecture --strict`** (19 known failures on `dev` after #918; **3/20** controllers already compliant: `create`, `get`, `list`).

Copy everything below the line into a new agent session, or link sub-issues to sections **A–D**.

---

## Goal

Bring **`module/teams`** on branch **`dev`** to **100% compliance** with loftlancer agent + architecture rules. Product behavior from #918 stays the same; only fix contracts, transport schemas, and audit gaps.

**Do not** copy legacy `apps/studio/src/module/*` or `packages/api/src/modules/*` as templates. Follow **`module/teams/README.md`**, **`module/teams/server/controller/server.team-create.controller.ts`** (gold pattern), **`docs/gaps/contracts.md`**, **`.cursor/rules/agent-workflow.mdc`**.

**Parent:** [#920](https://github.com/jayantrohila57/loftlancer/issues/920). Sub-issues: **[#921](https://github.com/jayantrohila57/loftlancer/issues/921)** (A), **[#922](https://github.com/jayantrohila57/loftlancer/issues/922)** (B), **[#923](https://github.com/jayantrohila57/loftlancer/issues/923)** (C), **[#924](https://github.com/jayantrohila57/loftlancer/issues/924)** (D). One commit per sub-issue (`Fixes #sub` · `Refs #920`); PR targets **`dev`** only. Branch: `feat/920-teams-architecture-100`.

---

## Read first (before any edit)

1. `module/teams/README.md`
2. `docs/tooling.md` (audit rules)
3. `module/teams/server/controller/server.team-create.controller.ts`
4. `module/teams/utils/validation/utils.team-extended.validation.ts` (and related validation files)

---

## Definition of done (all required)

```bash
pnpm audit:module-architecture --strict    # exit 0, zero violations
node scripts/audit-module-architecture.mjs --write-baseline   # baseline ids: []
pnpm verify:dev-merge
pnpm test:teams
```

Update **`module/teams/README.md`**: clear **TODO (blocked)** architecture row; note completion under verification.

**CHANGELOG.md** `[Unreleased]` one line when merging to `dev`.

---

## Sub-issue plan (implement in order)

### Sub-issue A — Controller outbound ServiceResponse (17 controllers) · [#921](https://github.com/jayantrohila57/loftlancer/issues/921)

These **fail** strict audit today (must match **create** controller):

- `server.team-available-members.controller.ts`
- `server.team-delete.controller.ts`
- `server.team-invitation-context.controller.ts`
- `server.team-invitation-create.controller.ts`
- `server.team-invitation-list.controller.ts`
- `server.team-invitation-resend.controller.ts`
- `server.team-invitation-revoke.controller.ts`
- `server.team-linkable-projects.controller.ts`
- `server.team-member-add.controller.ts`
- `server.team-member-remove.controller.ts`
- `server.team-member-role-change.controller.ts`
- `server.team-members.controller.ts`
- `server.team-project-assign.controller.ts`
- `server.team-project-remove.controller.ts`
- `server.team-projects.controller.ts`
- `server.team-restore.controller.ts`
- `server.team-update.controller.ts`

**Pattern (required on every controller):**

- Parse input with the correct **`utils/validation`** schema in the controller.
- **`runAction`** with appropriate `action`, `audit`, and `validate: (r) => serviceResponseSchema(<outputSchema>).parse(r)` when applicable.
- **Return** `serviceResponseSchema(<outputSchema>).parse(response)` — never return raw `runAction` result.

Use the correct **output Zod** per operation (DTO, list, void, etc.) from `utils.team.dto`, `utils.team-extended.validation`, or per-operation validation files.

**Commit:** `Fixes #921` · `Refs #920` · run `pnpm audit:module-architecture` (strict count should drop by 17).

---

### Sub-issue B — oRPC: remove `z.unknown()` / `teamControllerInputSchema` · [#922](https://github.com/jayantrohila57/loftlancer/issues/922)

**File:** `packages/api/src/orpc/procedures/teams.ts`

- **Remove** use of `teamControllerInputSchema` (`z.unknown()` in `utils.team-id.validation.ts`) from procedures.
- Each procedure **`.input()`** must use the **same Zod schema** the controller uses (import from `@module/teams/utils/validation/...`).
- Controllers remain the place for runtime validation + audit on bad input; procedure input types must be **real schemas**, not unknown.

**Optional cleanup:** delete or narrow `teamControllerInputSchema` if nothing legitimate needs `z.unknown()`.

**Commit:** `Fixes #922` · `Refs #920` · strict audit must clear `orpc-input-schema:...teams.ts`.

---

### Sub-issue C — Legacy unwrap in `packages/api/src/modules/teams` · [#923](https://github.com/jayantrohila57/loftlancer/issues/923)

**File:** `packages/api/src/modules/teams/api/api.get-teams.ts`

- **Remove** `unwrapTeam*` usage here (audit only allows unwrap in tRPC router, MCP, `module/teams/server/handlers/server.legacy-response.handler.ts`).
- Route this caller through **module controller + ServiceResponse**, or through an **allowlisted** adapter (e.g. thin tRPC/MCP wrapper), without spreading unwrap into `packages/api/src/modules/teams`.

**Commit:** `Fixes #923` · `Refs #920` · strict audit must clear `legacy-unwrap:...api.get-teams.ts`.

---

### Sub-issue D — Baseline + docs (final) · [#924](https://github.com/jayantrohila57/loftlancer/issues/924)

- Run **`node scripts/audit-module-architecture.mjs --write-baseline`** → **`scripts/audit-module-architecture-baseline.json`** with **`"ids": []`**.
- **`pnpm verify:dev-merge`**
- Update **`module/teams/README.md`** (architecture TODO cleared).
- **CHANGELOG** `[Unreleased]`.

**Commit:** `Fixes #924` · close parent with PR (`Closes #920`) · PR to **`dev`** listing #921–#924.

---

## Extra rules (not always in audit — fix if touched)

- **Read actions:** replace misuse of **`team.member.list`** on pure reads (`team-get`, `team-members`, `team-projects`) with correct registry actions if rows exist; add registry rows in `packages/actions` only if product docs require new IDs.
- **Avoid double fetch:** `loadTeamOverview` is used in both `client.section.layout.tsx` and `client.overview.page.tsx` — dedupe (single load per request; React `cache` or pass props from layout).
- **App states:** add teams **`forbidden.tsx`** (or module equivalent) if loaders redirect failed auth to forbidden — per `docs/app-states.md`.

Do **not** expand scope beyond teams + minimal transport/legacy touch for C.

---

## Forbidden

- New tRPC product procedures
- Skipping audit by editing baseline without fixing code
- Large docs under `docs/` for teams runbook (use **`module/teams/README.md`** only)
- Commits on **`main`**
- One giant PR without sub-issue commits

---

## Branch

From **`dev`**: `feat/920-teams-architecture-100`

When finished, report: strict audit output, baseline file snippet (`ids` length), and `pnpm verify:dev-merge` result.

---

## Current strict audit snapshot

Regenerate before starting:

```bash
pnpm audit:module-architecture --strict
```

Typical failure categories (19 total until fixed):

| Rule | Count | Area |
|------|-------|------|
| `controller-response-schema` | 17 | `module/teams/server/controller/*.ts` (except create, get, list) |
| `orpc-input-schema` | 1 | `packages/api/src/orpc/procedures/teams.ts` |
| `legacy-unwrap` | 1 | `packages/api/src/modules/teams/api/api.get-teams.ts` |
