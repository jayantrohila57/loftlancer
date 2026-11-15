# what's-new

Parses [CHANGELOG.md](../../CHANGELOG.md) into user-facing release notes
and renders them at `/[lang]/whats-new` on the web app. The route is
reachable by URL only — it is not linked from navigation and does not
prompt visitors.

## Public API (`@modules/whats-new`)

- Version helpers: `getCurrentVersion`, `getLastSeenVersion`,
  `markVersionSeen`, `hasUnseenRelease` (SSR-safe; last-seen value lives
  in `localStorage` under `loftlancer:last-seen-version`).
- Changelog: `parseChangelog`, `getReleaseNotes`.
- UI: `WhatsNewPage` (used by the web route) and `WhatsNewDialog`
  (not rendered; `WHATS_NEW_POPUP_ENABLED` is `false`).

Enable the pop-up in a future release by flipping that flag and mounting
`WhatsNewDialog` from an app layout — not before.
