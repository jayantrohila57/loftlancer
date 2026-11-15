# Requirements: Complete account profile

**Status:** Draft — implementation pending (optional fields blocked on [profile-optional-fields.md](./profile-optional-fields.md))

**Layers:** modules / features / packages / apps

## Goal

Complete the authenticated account profile using the existing account accordion layout. Keep account information the user cannot edit read-only.

## Scope

- Edit the display name and profile avatar. For the avatar, offer both a Coss UI-style file uploader and an image URL; validate the URL and show a preview before saving. Provide validation, pending, success, and failure feedback.
- Display account email, verification status, and account creation date as read-only information. Do not offer an email change.
- Add optional editable phone number, biography, **profile location** (contact-style, not session geolocation), and website **after** [profile-optional-fields.md](./profile-optional-fields.md) is approved. The current `user` record does not contain these fields; persistence requires an agreed schema and migration.
- Use `FormKit` and `FieldKit`; add any missing reusable avatar/file field to the form feature, following existing field patterns. Keep storage and account-specific behavior outside the generic field.
- Verify profile changes, avatar validation, persistence, and relevant error states in the browser with isolated test data.

## Decisions needed

- **Optional fields (phone, biography, profile location, website):** see [profile-optional-fields.md](./profile-optional-fields.md) — draft options and sign-off questions; no migration or UI until approved.
- Use the existing shared Vercel Blob store for uploads. The user supplied Blob configuration in the local Auth environment; confirm store connectivity and project environment configuration when implementing.
- Validate HTTPS image URLs with a successful browser image preview; the server must not fetch arbitrary URLs.

## Data and ownership

Use the authenticated account as the authority for updates. Preserve existing users. Persist avatar and any newly approved details across sessions; do not store files in application process memory or a temporary development filesystem. Protect uploads with authentication and size/type checks. Document any provider setup and migrations.
