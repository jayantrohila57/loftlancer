# Requirements: Organization onboarding wizard (8 steps)

**Status:** Approved  
**Approved by:** User chat sign-off — 2026-11-14 (Cursor)  
**Date:** 2026-11-14  
**Layers:** features / modules / packages / apps

**Related:**

| Doc                                                               | Relationship                                                                                               |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [organizations.md](./organizations.md)                            | **Approved** — Better Auth org create, provisioning, routes; this doc **extends** create UX and data model |
| [org-roles-rbac.md](./org-roles-rbac.md)                          | Team step roles; default member role in workspace prefs                                                    |
| [storage-system.md](./storage-system.md)                          | Logo / branding uploads → org blob prefix                                                                  |
| [platform-entitlements-plan.md](../platform-entitlements-plan.md) | Org product UI track after BA org plugin                                                                   |
| [form.md](../../features/form.md)                                 | FormKit / FieldKit policy                                                                                  |
| [form-input-fields.md](./form-input-fields.md)                    | Baseline input types                                                                                       |
| [session-geolocation.md](./session-geolocation.md)                | mapcn usage patterns (read-only map; tile disclosure)                                                      |

## Decisions (user input)

| #   | Topic                 | Decision (2026-11-14)                                                                                                                                                                               |
| --- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Phase 1 persistence   | **Not metadata-only** — ship Drizzle section tables, schema v2, provisioning, oRPC read/write, and 8-step wizard (DB-backed from the start; metadata may still carry `setup` for BA compatibility). |
| D2  | Freelancer legal step | Step 5 **shown** with **Skip / not applicable** banner (not hidden).                                                                                                                                |
| D3  | Primary contact email | **Organization contact email** (not account identity); **prefill** signed-in user email; user may change; support adding more emails on contact step (`extraEmails`).                               |
| D4  | Uploads               | **In scope** for initial implementation — logo + tax doc per storage org prefixes; FormKit upload patterns (`avatar-upload` extended / URL fallback until org blob API wired).                      |

## Goal

Replace the current **4-phase** create-organization wizard with an **8-step** flow that collects business identity, contact, location (with **mapcn** map pin), optional legal/tax (skippable for **freelancers**), branding, workspace defaults, and optional team invites — then shows a **review checklist** before submit. The same sectioned form building blocks must work for **onboarding** (`/organizations/create`) and **editing** an existing org (settings slices, post-approval).

Not every field is mandatory. Users who choose **Freelancer** must be able to complete create without a registered company or legal step.

---

## Organization creation wizard (user spec)

Steps:

1. **Basics**
2. **Business**
3. **Contact**
4. **Location**
5. **Legal & Tax**
6. **Branding**
7. **Workspace**
8. **Team**

`*` = required for submit (subject to org-type rules below). Other fields may be skipped.

### Step 1 — Basic information

| Field               | Type                 | Required |
| ------------------- | -------------------- | -------- |
| Organization name * | Text                 | Yes      |
| Organization slug * | Text, auto-generated | Yes      |
| Organization type * | Select               | Yes      |
| Organization logo   | Image upload         | No       |
| Tagline             | Text                 | No       |
| Description         | Textarea             | No       |

**Organization types:** Freelancer, Studio, Agency, Company (matches existing `organization_type` enum).

### Step 2 — Business profile

| Field             | Type                  | Required |
| ----------------- | --------------------- | -------- |
| Industry          | Select                | No       |
| Business category | Select                | No       |
| Services offered  | Multi-select          | No       |
| Specializations   | Tags                  | No       |
| Business size     | Select                | No       |
| Year established  | Year                  | No       |
| Website           | URL                   | No       |
| Portfolio URL     | URL                   | No       |
| Social profiles   | Repeatable URL fields | No       |

Example service categories: Web Development, UI/UX Design, Mobile Development, Consulting, Marketing.

### Step 3 — Contact information

| Field                            | Type                    | Required |
| -------------------------------- | ----------------------- | -------- |
| Primary email *                  | Email                   | Yes      |
| Business phone                   | Phone with country code | No       |
| Alternative email                | Email                   | No       |
| Support email                    | Email                   | No       |
| Contact person                   | Text / existing user    | No       |
| Preferred communication language | Select                  | No       |
| Business hours                   | Weekly schedule         | No       |

### Step 4 — Location and address

| Field              | Type                                | Required                                    |
| ------------------ | ----------------------------------- | ------------------------------------------- |
| Country *          | Country selector                    | Yes                                         |
| State / Province   | Select                              | No                                          |
| City               | Text / autocomplete                 | No                                          |
| Address line 1     | Text                                | No                                          |
| Address line 2     | Text                                | No                                          |
| Postal code        | Text                                | No                                          |
| Timezone *         | Timezone selector                   | Yes                                         |
| Primary currency * | Currency selector                   | Yes                                         |
| Default language   | Language selector                   | No                                          |
| Billing address    | Same as primary / separate          | No                                          |
| **Map pin**        | mapcn map (read/adjust coordinates) | No (recommended when address lines present) |

Defaults for country, timezone, currency, and language should pre-fill from the **signed-in user’s account preferences** when available.

### Step 5 — Legal and tax information

**Optional for freelancers** without a registered business (entire step skippable; no blocking validation).

| Field                        | Type                    | Required |
| ---------------------------- | ----------------------- | -------- |
| Legal business name          | Text                    | No       |
| Legal entity type            | Select                  | No       |
| Business registration number | Text                    | No       |
| Tax registration status      | Select                  | No       |
| Tax identification type      | Country-specific select | No       |
| Tax identification number    | Text                    | No       |
| Registered business address  | Address                 | No       |
| Invoice legal name           | Text                    | No       |
| Tax document                 | Private file upload     | No       |

For India, legal entity options may include Individual, Sole Proprietorship, Partnership, LLP, Private Limited Company. GSTIN conditional on GST registration (country-specific rules TBD in implementation).

### Step 6 — Branding and public identity

| Field                   | Type           | Required     |
| ----------------------- | -------------- | ------------ |
| Display name            | Text           | No           |
| Primary logo            | Image          | No           |
| Secondary / dark logo   | Image          | No           |
| Cover image             | Image          | No           |
| Brand color             | Color picker   | No           |
| Public organization URL | Auto-generated | No (display) |
| Custom domain           | Domain         | No           |
| Email signature         | Rich text      | No           |
| Document footer         | Text           | No           |

Branding applies to client portals, invoices, proposals, contracts, and shared documents (product surfaces **deferred** beyond storing values).

### Step 7 — Workspace preferences

| Field                      | Type                 | Required              |
| -------------------------- | -------------------- | --------------------- |
| Workspace visibility       | Private / restricted | No (default)          |
| Default project visibility | Private / shared     | No (default)          |
| Default member role        | Role selector        | No (default `member`) |
| Project numbering prefix   | Text                 | No                    |
| Invoice numbering prefix   | Text                 | No                    |
| Default payment terms      | Select               | No                    |
| Default hourly rate        | Currency input       | No                    |
| Workweek                   | Day selector         | No                    |
| Date and time format       | Select               | No                    |
| Number format              | Select               | No                    |
| Fiscal year start          | Month selector       | No                    |

Sensible defaults; editable later in org settings.

### Step 8 — Team and collaboration

| Field             | Type            | Required |
| ----------------- | --------------- | -------- |
| Invite members    | Multiple emails | No       |
| Member roles      | Role selector   | No       |
| Create first team | Text            | No       |
| Team description  | Textarea        | No       |
| Invite message    | Textarea        | No       |

Creator is **owner**. Step supports **Skip for now** (no invites on create).

### Final review

Before **Create organization**, show:

- Summary of provided values (grouped by step).
- **Organization setup checklist** with required vs optional sections:

| Section               | Status                                 |
| --------------------- | -------------------------------------- |
| Basic information     | Required                               |
| Business profile      | Optional                               |
| Contact information   | Optional (primary email required)      |
| Location and address  | Required (country, timezone, currency) |
| Legal and tax         | Optional                               |
| Branding              | Optional                               |
| Workspace preferences | Optional                               |
| Team invitations      | Optional                               |

Include an illustrative preview (logo, name, type) when data exists.

---

## Database section mapping (target model)

| Database table               | Wizard section                                 | v1 storage (Phase 1)           |
| ---------------------------- | ---------------------------------------------- | ------------------------------ |
| `organization` (Better Auth) | Basic identity (name, slug, logo URL)          | BA table today                 |
| `organization_profile`       | Business profile + tagline/description overlap | Exists; extend columns Phase 2 |
| `organization_contact`       | Contact information                            | **New table** Phase 2          |
| `organization_address`       | Addresses + lat/lng from map                   | **New table** Phase 2          |
| `organization_legal`         | Legal entity details                           | **New table** Phase 2          |
| `organization_tax`           | Tax registrations + document ref               | **New table** Phase 2          |
| `organization_branding`      | Brand and public identity                      | **New table** Phase 2          |
| `organization_settings`      | Localization + workspace defaults              | Exists; extend columns Phase 2 |
| `member`, `invitation`       | Team step                                      | BA org plugin                  |

**Phase 1 (approved):** migration `0015_org_onboarding_sections` adds normalized section tables; `organizationSetupSchemaV2` validates `metadata.setup`; provisioning writes all section rows; BA `metadata.setup` retained for compatibility during rollout.

---

## Required vs optional rules (normative)

| Rule                           | Behavior                                                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **R1 — Global required**       | Step 1: name, slug, type. Step 4: country, timezone, currency. Step 3: primary email.                                      |
| **R2 — Freelancer legal skip** | If `type === "freelancer"`, Step 5 is **shown** with **Skip / not applicable**; no legal/tax fields required when skipped. |
| **R3 — Non-freelancer legal**  | Studio / agency / company: Step 5 **shown** but fields remain **optional** in v1 unless user signs off stricter rules.     |
| **R4 — Team skip**             | Step 8 skippable; no invites required.                                                                                     |
| **R5 — Partial persistence**   | Optional steps may be empty; review screen shows “Not provided”.                                                           |
| **R6 — Edit parity**           | Same Zod sections and FormKit modules for create and settings edit (load defaults from DB / metadata).                     |

---

## Current state (repo, 2026-11-14)

### Wizard UI (`@modules/org`)

| Item       | Today                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Steps      | **4** phases: Identity (name, slug), About (type, description), Regional (country, timezone, currency), Branding (logo URL only) |
| Navigation | `ORG_CREATE_WIZARD_STEP_COUNT = 4`, vertical stepper + per-phase task list                                                       |
| Files      | `org.create-form.wizard.client.tsx`, `org.create-form.wizard-nav.client.ts`, `org.create-form.client.tsx`, sheet/screen          |
| Review     | **None** — submit from last step                                                                                                 |

### Validation & metadata

| Item         | Today                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Server       | `createOrganizationSchema` + `organizationSetupSchema` in `modules/org/src/utils/validation/org.create.schema.ts` |
| Client       | `createOrganizationFormSchema(t)` mirrors server fields with i18n messages                                        |
| BA hook      | `metadata.setup` parsed with `organizationSetupSchema` in `org.organization-plugin.ts` before/after create        |
| Setup fields | `type`, `description?`, `countryCode`, `timezone`, `currencyCode` — plus `name`, `slug`, `logo?` on create        |

### Provisioning

`ensureOrgProfileAndSettings` writes:

- `organization_profile`: `type`, `description`, `countryCode`
- `organization_settings`: `timezone`, `currencyCode`

Plus entitlement cache and default storage root (unchanged by this spec).

### Drizzle tables (existing)

- `organization_profile` — minimal columns (`packages/drizzle/src/schema/organization-profile.schema.ts`)
- `organization_settings` — `timezone`, `currencyCode` only
- **No** `organization_contact`, `_address`, `_legal`, `_tax`, `_branding` tables yet

---

## Investigation summary

### mapcn / maps

| Finding        | Detail                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Package name   | **mapcn** is not a separate npm dependency in this repo                                                                                        |
| Implementation | Vendored **MapLibre** UI adapted from [mapcn (MIT)](https://github.com/AnmolSaini16/mapcn) at `packages/ui/src/integration/components/map.tsx` |
| Dependency     | `maplibre-gl` already in `packages/ui/package.json`                                                                                            |
| Styles         | Carto CDN basemap URLs; design tokens in `globals.css` for attribution/popups                                                                  |
| Prior art      | [session-geolocation.md](./session-geolocation.md) — map only when coordinates valid; tile provider disclosure                                 |

**Install path for new work:** **No `pnpm add mapcn`** required. Implement org address map by:

1. Re-exporting or importing `Map` / `MapCanvas` from `@packages/ui` (confirm export path in Phase 1 slice).
2. Adding a **FormKit field** (e.g. `type="geo-point"` or `address-map`) in `@features/form` that wraps the map for pin selection — **not** raw map in module code per [form.md](../../features/form.md).
3. Document tile CDN usage in org settings copy (same as session activity).

Optional upstream sync: compare with mapcn repo for marker/popup patterns; keep MIT attribution in source.

### Address patterns in repo

- No existing org address form.
- Country/timezone/currency use `FormKit` combobox + `select-timezone` in create wizard.
- No geocoding service wired.

### FormKit field inventory vs wizard needs

| Wizard need                  | FormKit today                           | Gap                                                         |
| ---------------------------- | --------------------------------------- | ----------------------------------------------------------- |
| Text, textarea, URL          | Yes                                     | —                                                           |
| Email                        | Yes                                     | —                                                           |
| Phone + country code         | `type="tel"`                            | —                                                           |
| Select / combobox / timezone | Yes                                     | Industry/category option lists = module data                |
| Multi-select services        | `select-multiple` / `combobox-multiple` | —                                                           |
| Org type                     | `radio-group` (card)                    | —                                                           |
| Logo / images                | `avatar-upload` (profile-oriented)      | **Org-branded file upload** (multiple assets, storage path) |
| Tax document (private)       | —                                       | **`file-upload`** field + virus scan / size policy TBD      |
| Tags (specializations)       | —                                       | **`tags`** or combobox-multiple with free text              |
| Repeatable social URLs       | —                                       | **`field-array`** / repeatable URL group in form feature    |
| Business hours (weekly)      | —                                       | **`schedule-week`** or structured JSON field                |
| Color picker                 | —                                       | **`color`** field                                           |
| Rich text (signature)        | —                                       | **`rich-text`** (deferred or textarea v1)                   |
| Map address / pin            | —                                       | **`address-map`** wrapping `@packages/ui` map               |
| Year established             | `number` or `date`                      | Optional dedicated year select                              |
| Billing address toggle       | —                                       | Conditional **address group** component                     |
| Currency hourly rate         | `currency`                              | —                                                           |
| Workweek / fiscal month      | `checkbox-group` / `select`             | May need **`month-select`**                                 |
| Invite emails                | —                                       | **`email-list`** or textarea + parse (Team step)            |

---

## Proposed `organizationSetupSchema` v2 (planned — not active)

Nested by section for metadata JSON and shared create/edit. **Do not wire to BA hooks until approved and Phase 1 implemented.**

```typescript
// PLANNED — not imported by server hooks until approval (organization-onboarding-wizard.md)
import { z } from "zod"

const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const organizationSetupSchemaV2 = z.object({
  version: z.literal(2),
  basics: z.object({
    type: z.enum(["freelancer", "studio", "agency", "company"]),
    tagline: z.string().trim().max(120).optional(),
    description: z.string().trim().max(500).optional(),
    logoAssetId: z.string().uuid().optional(), // storage ref Phase 2
    logoUrl: z.union([z.url(), z.literal("")]).optional(), // interim URL
  }),
  business: z.object({
    industry: z.string().optional(),
    category: z.string().optional(),
    services: z.array(z.string()).optional(),
    specializations: z.array(z.string()).optional(),
    businessSize: z.string().optional(),
    yearEstablished: z.number().int().min(1900).max(2100).optional(),
    website: z.union([z.url(), z.literal("")]).optional(),
    portfolioUrl: z.union([z.url(), z.literal("")]).optional(),
    socialProfiles: z
      .array(z.object({ label: z.string().optional(), url: z.url() }))
      .optional(),
  }),
  contact: z.object({
    primaryEmail: z.string().email(),
    businessPhone: z.string().optional(),
    alternativeEmail: z.string().email().optional(),
    supportEmail: z.string().email().optional(),
    contactPerson: z.string().optional(),
    preferredLanguage: z.string().optional(),
    businessHours: z.record(z.string(), z.unknown()).optional(), // refine in implementation
  }),
  location: z.object({
    countryCode: z.string().regex(/^[A-Z]{2}$/),
    stateProvince: z.string().optional(),
    city: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    postalCode: z.string().optional(),
    timezone: z.string().min(1).max(64),
    currencyCode: z.string().regex(/^[A-Z]{3}$/),
    defaultLanguage: z.string().optional(),
    billingSameAsPrimary: z.boolean().optional(),
    billingAddress: z
      .object({
        countryCode: z
          .string()
          .regex(/^[A-Z]{2}$/)
          .optional(),
        stateProvince: z.string().optional(),
        city: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        postalCode: z.string().optional(),
      })
      .optional(),
    geo: geoPointSchema.optional(),
  }),
  legal: z
    .object({
      legalBusinessName: z.string().optional(),
      legalEntityType: z.string().optional(),
      registrationNumber: z.string().optional(),
      taxRegistrationStatus: z.string().optional(),
      taxIdType: z.string().optional(),
      taxIdNumber: z.string().optional(),
      registeredAddress: z.record(z.string(), z.unknown()).optional(),
      invoiceLegalName: z.string().optional(),
      taxDocumentAssetId: z.string().uuid().optional(),
    })
    .optional(),
  branding: z
    .object({
      displayName: z.string().optional(),
      primaryLogoAssetId: z.string().uuid().optional(),
      secondaryLogoAssetId: z.string().uuid().optional(),
      coverImageAssetId: z.string().uuid().optional(),
      brandColor: z.string().optional(),
      customDomain: z.string().optional(),
      emailSignatureHtml: z.string().optional(),
      documentFooter: z.string().optional(),
    })
    .optional(),
  workspace: z
    .object({
      workspaceVisibility: z.enum(["private", "restricted"]).optional(),
      defaultProjectVisibility: z.enum(["private", "shared"]).optional(),
      defaultMemberRole: z.enum(["member", "manager"]).optional(),
      projectNumberPrefix: z.string().optional(),
      invoiceNumberPrefix: z.string().optional(),
      defaultPaymentTerms: z.string().optional(),
      defaultHourlyRate: z.number().nullable().optional(),
      workweek: z.array(z.string()).optional(),
      dateTimeFormat: z.string().optional(),
      numberFormat: z.string().optional(),
      fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
    })
    .optional(),
  team: z
    .object({
      invites: z
        .array(
          z.object({
            email: z.string().email(),
            role: z.enum(["member", "manager"]).optional(),
          })
        )
        .optional(),
      firstTeamName: z.string().optional(),
      firstTeamDescription: z.string().optional(),
      inviteMessage: z.string().optional(),
    })
    .optional(),
})

/** Create payload: v2 setup + BA org fields */
export const createOrganizationSchemaV2 = organizationSetupSchemaV2.extend({
  name: z.string().trim().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
})
```

Server hook migration: accept `metadata.setup` v2 when `version === 2`, else legacy flat `organizationSetupSchema` for backward compatibility during rollout.

---

## Architecture (layer map)

| Decision            | Choice                             | Notes                                                        |
| ------------------- | ---------------------------------- | ------------------------------------------------------------ |
| Wizard UI           | `@modules/org`                     | Section components per step; shared with settings routes     |
| Form fields         | `@features/form`                   | New field types as needed (map, tags, file, schedule)        |
| Map                 | `@packages/ui` map (mapcn-derived) | Wrapped by form feature                                      |
| Validation          | `@modules/org` Zod                 | v2 nested schema; i18n client mirror                         |
| Persistence Phase 1 | BA `metadata.setup` JSON           | Full wizard payload                                          |
| Persistence Phase 2 | `@packages/drizzle`                | Normalized tables per mapping                                |
| Team invites        | Better Auth org plugin             | After create or inline step — see Phase 4                    |
| File assets         | `@modules/storage` + blob          | Logos, tax docs per [storage-system.md](./storage-system.md) |

## End-to-end flow (target)

1. User opens `/organizations/create`.
2. Wizard steps 1–8; freelancer skips legal; team skippable.
3. **Review** step shows checklist + summary.
4. Submit → `authClient.organization.create` with `metadata: { setup: organizationSetupSchemaV2 }`.
5. `beforeCreateOrganization` validates; `afterCreateOrganization` provisions profile/settings (+ Phase 2 tables).
6. Optional: send invites from team payload (Phase 4).
7. Set active org; redirect per [organizations.md](./organizations.md) route amendment.

---

## Phased rollout (suggested)

| Phase | Scope                                                                                                                                                               | Migrations                         | User-visible                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------- |
| **1** | Migrations for section tables + schema v2 + provisioning + oRPC `org.setup.get` / `org.setup.patch` + 8-step wizard + review (incremental UI; DB-backed from start) | **`0015_org_onboarding_sections`** | Full wizard; normalized rows on create |
| **2** | Edit org settings screens reusing step modules; deeper field types (tags, schedule, file-upload to storage)                                                         | Uses Phase 1 tables                | Settings parity with create            |
| **3** | Edit org settings screens reusing step modules; **mapcn** address on Location                                                                                       | Uses Phase 2 address columns       | Settings parity with create            |
| **4** | Team step → Better Auth **invitations** (email); align [organizations.md](./organizations.md) invite slice                                                          | BA invitation tables exist         | Invites on create or post-create       |

**Out of v1 wizard scope:** custom domain DNS, rich-text signatures in production PDFs, project/invoice numbering enforcement, teams entity beyond “first team name” stub.

---

## Gaps / decisions

| #   | Topic                        | Options                                | Recommendation (pending sign-off)                                                |
| --- | ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| G1  | Primary email                | BA org has no built-in org email       | Store on `organization_contact`; validate uniqueness optional                    |
| G2  | Logo upload vs URL           | Today: URL only                        | Phase 1 URL + `avatar-upload` pattern; Phase 2 storage asset IDs                 |
| G3  | Tax document                 | Sensitive blob                         | Org-private prefix; owner-only ACL                                               |
| G4  | Geocoding                    | Forward geocode on address blur        | **Defer** — manual pin on map only in Phase 3                                    |
| G5  | Legal required for company   | Stricter than freelancer               | v1: all optional except R1; revisit for invoicing locales                        |
| G6  | metadata size limits         | Large social arrays / hours            | Cap array lengths in Zod; document BA metadata limit                             |
| G7  | Industry/services taxonomy   | Static vs admin-configurable           | v1 static enums in module; i18n labels                                           |
| G8  | Review step UX               | Separate step vs modal                 | **Step 9** or footer on step 8 — prefer **dedicated review** before submit       |
| G9  | Wizard vs approved org slice | organizations.md v1 was minimal create | This doc **supersedes create UX only**; does not change entitlement/autumn hooks |

---

## Gaps / open questions (sign-off)

- [x] Phase 1 = DB + API + wizard (see **Decisions**).
- [x] Freelancer Step 5 = Skip / not applicable banner.
- [x] Primary email = org contact; prefill account email.
- [ ] Approve **static** industry/service lists for v1 vs external taxonomy.
- [x] Map pin optional when address text empty.
- [x] Upload scope in Phase 1 (storage API blocker documented for blobs).
- [ ] Team invites: **inline on create** (Phase 4) vs redirect to members page only.
- [ ] Whether **company/agency** types should soft-require any legal field before paid billing (future).

---

## Implementation slices (after approval)

1. **Requirements sign-off** — this document.
2. **Form feature gaps** — priority: `address-map`, `tags`, repeatable URLs, `file-upload` (org), optional `schedule-week`.
3. **Schema v2** + client i18n schema; dual-read legacy setup in BA hook.
4. **Wizard refactor** — 8 steps + review; section components under `modules/org/.../create/` and `.../settings/` shared.
5. **Account defaults** — prefill location/contact from user profile (if fields exist).
6. **Phase 2 migrations** — separate approved doc section or amendment here.
7. **Edit org routes** — reuse sections per step.
8. **Invites wiring** — team step → BA invitation API.

---

## Validation checklist (before sign-off)

- [x] All 8 steps and field tables captured
- [x] Freelancer / legal rules documented (R1–R6)
- [x] Review checklist documented
- [x] DB mapping + Phase 1 storage agreed
- [x] mapcn path documented (vendored MapLibre, no new package)
- [x] FormKit gaps listed (`address-map` added; file-upload to storage pending)
- [x] Phased rollout agreed
- [x] Cross-links from organizations + platform plan
- [x] User confirmed sign-off (2026-11-14)

**Workflow:** [../../workflow/04-requirements-first.md](../../workflow/04-requirements-first.md)
