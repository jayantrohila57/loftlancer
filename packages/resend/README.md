# `@loftlancer/resend`

Thin **[Resend](https://resend.com)** + React Email integration for transactional mail.

## Layout

```text
src/
  core/                 # Resend client, send adapter, mailbox recorder hook
    templates/          # Allowed React Email assets (presentation only)
  config/               # RESEND_API_KEY / EMAIL_FROM helpers
  constants/
  types/
  utils/                # Mailbox address / delivery helpers
  index.ts
tests/
```

## Env

| Variable         | Role                                                             |
| ---------------- | ---------------------------------------------------------------- |
| `RESEND_API_KEY` | When unset, `sendEmail` skips the provider (`status: "skipped"`) |
| `EMAIL_FROM`     | Optional From override; default `noreply@mail.loftlancer.com`    |

## Public API

- `sendEmail` / `isEmailConfigured` / `setEmailRecorder`
- `installMailboxRecorder` / `recordEmail` — DB persistence for the Mail app (#344)
- React Email templates: `MagicLinkEmail`, `OrgInviteEmail`, `NotificationEmail`

Templates are presentation-only. Auth invite / magic-link / notification **workflows** stay in features or modules.

## Legacy

`@loftlancer/email` and `@loftlancer/mail` were folded here. Import `@loftlancer/resend` only.

## TODO

- Move `recordEmail` mailbox persistence into `module/` (or a mail feature) when the Mail app owns that domain; keep only the `EmailRecorder` seam in this package.
