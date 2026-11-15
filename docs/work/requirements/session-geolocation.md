# Requirements: Session activity and device location

> **Canonical spec:** [session-activity-location.md](./session-activity-location.md)

**Status:** Approved — 2026-11-07; CARTO tiles approved  
**Layers:** packages / features / modules / apps

## Goal

Show session activity and the device and location details available to the application, including a map using mapcn when valid location coordinates are available.

## Scope

- Show available browser, browser version, operating system, device category, raw user-agent string, IP address, timestamps, and any additional details that can be derived reliably from the supplied user agent. Clearly label unknown values; do not fabricate device details while adding available icons to represent more.
- Present a dialog explaining that location supports sign-in security and unusual-activity review, with Enable and Skip actions. Request browser permission only after Enable. Sign-in and sign-out continue if skipped, denied, or unavailable. Do not describe location as mandatory.
- Add an account Permissions section with a location control, and a Sessions banner linking to that control when location is not enabled. Explain how browser permission and application settings interact. Record coordinates only when both access and the app setting permit it.
- Record sign-in and sign-out activity and allow the signed-in user to review their own events. Capture sign-out before the session ends, and distinguish explicit sign-out, administrative revocation, and expiry when reliably known. Never claim to know a location or logout event when a browser is closed, a device is offline, or a session expires without an observable event.
- Store and retrieve activity and location only for the authenticated account; validate coordinates and accuracy radius and scope every access to the server session. Do not expose session tokens, secrets, or another user's records. Keep the current session sign-out protections and existing account layout.
- Render a mapcn map only when valid coordinates are available, using the reported accuracy radius to draw a circle around the likely area. Reflect whether the available measurement is coarse or more precise without claiming exactness; show only location details actually available. If coordinates are missing, show “No location currently available” and an option to enable location, with appropriate browser-permission guidance. Provide a text fallback. Identify map-tile providers and their data disclosure before enabling external tile requests. Do not use an external IP-geolocation lookup or reverse-geocoding provider unless separately selected and authorized.
- Add any required event schema and migration, loading/empty/error states, privacy explanation, and documentation. Test permission granted, denied, unsupported, and unavailable; authentication and session activity; ownership isolation; retention; and map rendering using synthetic data.

## Decisions needed

- Keep activity and location records until the user deletes them. Provide controls to delete the stored records and to turn off future location collection.
- Display only the location information available; do not add reverse geocoding or infer city or region without an approved source.
- Map tiles: the user approved CARTO tiles, which receive the viewer IP and requested map area. Mapcn also defaults to a worker from unpkg; prefer a self-hosted worker when supported. Allow users to turn future collection off.

## Technical notes

Browser geolocation requires a secure context and user permission. Location collection cannot be guaranteed for an OAuth redirect, magic-link completion on another device, expired sessions, or a closed browser. Better Auth session lifecycle hooks may help record server-observed events, but browser coordinates must be attached through an authenticated, validated request while a session is active. The current schema contains only session IP and user-agent fields; historical events and location need new storage.

## Separate activity areas

The activity views are separate from **Sessions**. Sessions shows devices currently signed in and controls to revoke them; it is not a historical log. Add two distinct account areas with paginated, newest-first event tables:

### User Activity

Track account updates, profile changes, and supported actions across the platform. Each row should show the time, action, relevant area or resource, and outcome, with a detail view for non-sensitive context when available. Provide useful empty, loading, error, and pagination states; allow filtering by date and activity type. The initial implementation must instrument actual supported actions such as profile name/avatar updates and connected-account changes. Other platform modules should emit events through a reusable server-side interface as their actions are integrated; do not imply that uninstrumented actions are tracked.

### Login & Security Activity

Show authentication and security history separately from the active-session list: successful sign-ins, observable failed sign-in attempts, explicit sign-outs, session revocations, connected-provider linking/unlinking, and other implemented security changes. Each row should show the event time, event and outcome, and available browser, device, IP, and location details. Unknown or unavailable information stays labelled as such. Add date and event-type filters, a detail view where useful, and the same loading, empty, error, and pagination behavior.

Failed attempts that occur before an authenticated user is known require special handling: never create an account or associate an event with an account merely from a claimed email or unverified provider identity. Define a safe, server-side association strategy that does not reveal whether an account exists; retain unattributed events only if a separate security policy authorizes them. Do not claim complete failed-attempt coverage until the relevant authentication paths and identity association have been verified.

## Proposed data tables and event flow

- `user_activity`: event ID, account/user ID, timestamp, event type, outcome, source application or module, optional resource type and safe identifier, and limited structured metadata. The server derives the actor from the authenticated session; callers cannot choose another user's identity.
- `security_activity`: event ID, account/user ID when confidently known, timestamp, security event type and outcome, optional session reference, sanitized device/user-agent and IP information when available, and a reference to permitted location data. Preserve history when a session is deleted by using a nullable reference or safe snapshot rather than cascading event deletion.
- `activity_location`: location record ID, owning user ID, timestamp, latitude, longitude, reported accuracy radius, source and permission/availability status. Associate it with an event or session only after a validated authenticated request; avoid duplicating coordinates unnecessarily. Do not write coordinates when permission is absent or revoked.
- `user_permissions`: user ID, location-collection preference, decision timestamp and applicable consent/version information. This records the app preference separately from browser permission, which is device-specific and can change outside the app. Skip/denial and browser-unavailable states must not be mistaken for app consent.

Exact names and columns are proposed and should be finalized against repository schema conventions. Add indexes for user/time and user/event type, server-side authorization on every query and deletion, bounded pagination, and a migration for the test database. Store no passwords, magic-link tokens, session tokens, provider tokens, authorization codes, or raw request bodies. Limit metadata to an allowlisted schema and do not render untrusted content as HTML.

Record events at authoritative server-side boundaries so client requests cannot invent security events or another user's activity. Link browser-provided location only after login and explicit permission; tolerate location and event-write failures without blocking authentication or changing the outcome of the user action. Handle redirects, retries, duplicate writes, failed mutations, multiple devices, permission changes, logout, and token expiry explicitly. Events are recorded only when observed; do not infer successful or failed actions from UI clicks alone.

## Retention and user controls

Keep activity and location until the user deletes them, as requested. Permissions must allow disabling future location collection and deleting collected location. Provide deletion controls for user activity and security activity, with clear confirmation and scope, and preserve active sessions and account access when historical records are deleted. Specify whether delete actions themselves appear in history and handle related location records consistently. Any mandatory audit retention requirements must be resolved before implementation; this plan does not assume such a requirement exists.

## Implementation and verification slices

1. Confirm event names, account navigation, data ownership, the map provider, and deletion behavior; approve this plan before schema or multi-layer work.
2. Create permission, activity and location schema plus safe migrations, with owner-scoped persistence and deletion; verify migration and isolation using test data.
3. Instrument existing profile and provider actions, and server-observed authentication/session events. Test success, failure, idempotency, and attempts with unknown identities.
4. Add the permission dialog, account Permissions controls, and Sessions banner; test enable, skip, denied, revoked, unsupported and cross-device behavior without blocking authentication.
5. Build User Activity and Login & Security Activity tables and detail views, including pagination, filters, ownership isolation and deletion.
6. Integrate the approved map source with an accuracy circle and unavailable state. Test with synthetic exact and coarse coordinates and without location.
7. Run `pnpm check` after each slice and perform browser-to-database verification using disposable accounts and synthetic locations. Document event coverage and any flows that cannot be observed or tested.

## Implementation notes (2026-11-07)

Location collection is optional and requires both the account setting and browser permission. The account permission can be turned off without deleting prior locations; deleting location history does not turn off future collection. CARTO receives the viewer IP and map area. The MapLibre worker is served from the auth application's public assets; update those two files when upgrading MapLibre.

The implemented activity history currently records server-observed session creation, session deletion and revocation, profile updates, and connected-provider disconnection. Coverage depends on Better Auth invoking its database hooks; events are not inferred when no action is observed. Provider connection and failed authentication are not yet recorded. In particular, a failed pre-authentication attempt is not associated with an account based on an unverified email. Activity and location history are scoped to the signed-in account and are retained until deleted. Deleting security activity retains location records, unlinked from deleted events.

Permission, session-location and event recording are best effort: an unavailable location or activity write does not stop authentication. Location attached to sign-in or sign-out is only a nearby browser measurement and its accuracy radius is shown; it does not establish an exact physical position. The current implementation does not infer city, region, or country.
