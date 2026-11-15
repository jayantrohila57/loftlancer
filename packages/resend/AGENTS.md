# Package `resend`

[Resend](https://resend.com) email transport. Folder **`resend`** → **`@packages/resend`**.

| Export             | Use                                |
| ------------------ | ---------------------------------- |
| `@packages/resend` | `getResend()`, `sendResendEmail()` |

**MUST NOT** import `resend` directly in apps, modules, or `@packages/better-auth` — use this package.

**MUST NOT** read raw `process.env` here — use `@packages/t3-env/server`.
