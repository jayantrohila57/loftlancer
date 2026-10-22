# Loftlancer UX and Design-System Audit

**Product:** Loftlancer (v1.18.0)
**Evidence:** 60 screenshots plus `README.md`, captured 22 October 2026
**Account state:** one signed-in owner, one organization ("Lucsum"), one project ("E-commerce"), desktop width, dark theme
**Scope:** Coss UI atoms are out of scope for redesign. The audit covers molecules, organisms, page templates, navigation, actions, settings, states and workflows.

---

## 1. Executive summary

The atoms are working. Buttons, inputs, badges, selects and icons look consistent wherever they appear. The problems come from how those atoms are combined. The same job (create, invite, save, show activity, show an empty list) is done in a different way on different screens. Two issues block core use or create trust risk:

- **The core variables workflow is a dead end.** The Environments app is blank or says "isn't installed" with no install action (S51, S52).
- **Public legal and contact pages are not production-ready.** Five pages say "Placeholder … do not rely on this for compliance", and several pages expose engineering language (S07, S10–S14).

### Findings by severity

| Severity | Count | Meaning |
|---|---|---|
| Critical | 2 | Blocks a core job or creates legal or trust risk. Fix before the next release. |
| High | 11 | Causes wrong decisions, data-loss risk or a broken mental model in a core journey. |
| Medium | 22 | Inconsistency or friction that slows users and weakens the product. |
| Low | 8 | Polish. Fix when touching the area. |
| **Total** | **43** | |

### Top priorities

1. **Make Environments usable from a new project** (F-15). Add install states, actions and a working first-run path.
2. **Replace placeholder and internal copy on public pages** (F-01).
3. **Fill the Studio Overview** (F-16). It is blank for every new user.
4. **Give every page a loaded, empty, loading and error state** (F-17, F-18, F-19).
5. **Make project settings and delete actions match what they promise** (F-20, F-22, F-23).
6. **Standardize terminology and navigation** so the same object has one name and one place (F-02, F-03, F-08, F-09).

### Keep as-is (strong patterns to reuse)

- **Empty notifications state** (S30): icon, title, one-line explanation and a next action. Use this as the model for every empty state.
- **Danger zone** (S24, S46, S54): red-bordered section at the bottom, separate from normal settings. Export of account data excludes secret values (S24). Extend this pattern everywhere.
- **Projects list toolbar** (S37): search, status and visibility filters, sort, and grid/list toggle. Use this as the base for list pages.
- **Permission checklist** (S39): clear per-role list of granted and denied permissions.
- **Header primary action on collection pages** (S35, S43, S53, S57): "Invite" and "New" buttons sit top-right. Keep this placement.
- **Contextual sidebar lists** (S33, S41, S47): "All X" followed by the child items. Keep this pattern, but do not repeat it in tabs.
- **Split auth layout** (S05, S15, S16): consistent full-page template for sign-in, errors and onboarding.
- **Sidebar search with Ctrl K** on every signed-in screen.

---

## 2. How to read this audit

**Screen IDs.** Each screen has an ID (S01–S60). Appendix A maps IDs to source filenames and the state captured.

**Severity.**

- **Critical:** blocks a core job, or exposes the business to legal or trust damage. Release blocker.
- **High:** causes wrong decisions, data loss or a broken mental model. Fix in the next sprint.
- **Medium:** inconsistency or friction that slows the user. Fix within two sprints.
- **Low:** polish. Fix when the area is touched.

**Verify flag.** Some screenshots were captured while content was still loading. Items marked *verify* need re-checking on a fully loaded state before work starts.

**Acceptance criteria** are written as checkboxes so they can be copied into a tracker.

---

## 3. Findings summary

| ID | Area | Finding | Severity | Screens |
|---|---|---|---|---|
| F-01 | Copy | Placeholder and internal copy on public legal and contact pages | Critical | S07, S09–S14 |
| F-02 | Copy | Team, organization and workspace used for the same concepts | High | S16, S31, S33, S41–S46 |
| F-03 | Copy | "Activity", "Audit timeline", "My activity" and "Audit events" used interchangeably | High | S04, S23, S29, S34, S39, S49 |
| F-04 | Copy | "App" means product surfaces and installable project features | Medium | S04, S09, S47, S50, S51 |
| F-05 | Copy | Internal names and engineering terms appear in user-facing copy | Medium | S04, S07, S09, S11, S12, S14, S22, S60 |
| F-06 | Copy | "Grants", "linked teams" and "access source" are unexplained jargon | Medium | S39, S45, S46, S48 |
| F-07 | Copy | Minor terminology drift (Docs/Documentation, DPA, Changed/Improved, "Collidr") | Low | S01, S02, S10–S13 |
| F-08 | Navigation | Four application shells and two sidebar schemes for signed-in pages | High | S17–S26, S27–S60 |
| F-09 | Navigation | Organization, team and project navigation repeated in sidebar, tabs and tiles | Medium | S33, S37, S41, S47 |
| F-10 | Navigation | Two back controls and repeated headings on the same page | Medium | S37, S47, S50, S54 |
| F-11 | Navigation | Breadcrumbs show raw IDs, skeleton bars and labels that do not match the title | Medium | S40, S41, S42–S47 |
| F-12 | Navigation | Tab set for the same object type changes between pages | Medium | S47, S49, S51 |
| F-13 | Navigation | Identical subtitle repeated on every tab | Low | S33–S35, S39–S41, S42–S56 |
| F-14 | Navigation | Account tile grid duplicates the tab bar on the same screen | Medium | S17 |
| F-15 | States | Environments app is a dead end (blank page, no install action) | Critical | S50, S51, S52 |
| F-16 | States | Studio Overview is blank | High | S27, S28 |
| F-17 | States | Loading states are inconsistent and some may be stuck (*verify*) | High | S18–S21, S23, S25, S26, S29, S32, S34–S36, S40–S45, S48–S50, S55, S56 |
| F-18 | States | Empty states are inconsistent and most offer no action | Medium | S27, S51–S53, S57–S59 |
| F-19 | States | Access denied gives no next step; error and not-found states are not defined | Medium | S15 |
| F-20 | Settings | Delete account copy contradicts itself | High | S24, S25 |
| F-21 | Settings | Notification preferences are a dead end (link out and back) | High | S22, S30 |
| F-22 | Settings | Project fields collected at creation cannot be edited in settings | High | S38, S47, S54 |
| F-23 | Settings | Project danger zone promises "Archive" and "Recently deleted" that do not exist | Medium | S54 |
| F-24 | Actions | Submit and create labels are inconsistent across the app | Medium | S31, S35, S38, S39, S40, S41, S43, S46, S53, S54, S57, S60 |
| F-25 | Actions | Primary action placement and create container differ for the same job | Medium | S31, S37, S38, S39, S41, S46, S54, S57, S60 |
| F-26 | Forms | Three form layouts and mixed required and optional markers | Medium | S38, S46, S54, S60 |
| F-27 | Settings | Branding section has an orphan "OR", exposes implementation status and has no confirm | Medium | S40 |
| F-28 | Settings | Collapsible card affordance (chevrons) is used inconsistently | Low | S17, S33, S39, S46, S47, S54 |
| F-29 | Access | Invitation model is unclear: team invites, org membership and project access overlap | High | S35, S43, S44, S53 |
| F-30 | Access | Roles copy and permission list do not match; custom roles are limited | High | S39 |
| F-31 | Lists | Five different list patterns for the same kind of data | Medium | S32, S37, S41, S43, S53, S57 |
| F-32 | Lists | Pagination shown when there is only one page | Low | S41, S43, S45, S53 |
| F-33 | Support | Ticket form, help center and empty states need work | Medium | S57, S59, S60 |
| F-34 | Public | Status page: "Landing" has no data and a URL is truncated | Medium | S08 |
| F-35 | Public | Left artwork line crosses the quote text on split-layout pages | Medium | S01, S04, S05, S06, S08, S15 |
| F-36 | Public | Features cards use an uneven grid and do not label "not hosted yet" items | Low | S04 |
| F-37 | Onboarding | Onboarding does not match sign-in, has no back or exit, and slug handling is unclear (*verify*) | Medium | S05, S16 |
| F-38 | Public | Docs sidebar repeats group labels as child links | Low | S03 |
| F-39 | Layout | Content and header overflow at wide widths; header avatar shifts | Medium | S37, S41, S44, S48 |
| F-40 | Layout | Date and time formats differ across screens | Low | S02, S07, S08, S09, S33, S47 |
| F-41 | Polish | Small items: empty count pill, active "Mark all read", stray skeleton, unlabeled icon, empty column | Low | S27, S30, S33, S37, S54 |
| F-42 | Accessibility | Contrast, icon-only controls, color-only states, target size and focus need verification | High | All |
| F-43 | Coverage | Important states, roles and widths are not in the capture set | Medium | All |

---

## 4. Detailed findings

### A. Content and terminology

#### F-01 · Placeholder and internal copy on public legal and contact pages
**Severity:** Critical · **Screens:** S10, S11, S12, S13, S14, S07, S09

**Problem.** Five public pages say "Placeholder copy for owner legal review — do not rely on this for compliance" or "pending owner review". Privacy and Security use engineering language ("reflected in the codebase", "registry", "deployment runbook"). Contact sends legal and privacy requests to "the repository owner listed on GitHub" and tells users to sign in to Studio. Acceptable use says full language "will be added after legal review", while Terms already has a short acceptable-use section. The Terms page also says the "platform split (auth, studio, mcp, docs) rolls out on main".

**Fix.** Publish approved copy or hide the page until it is approved. Rewrite engineering terms in plain language. Add a monitored support email and a privacy contact address. Use one header format on every legal page: title, "Last updated [Month YYYY]", body. Make Acceptable use the full text, or link it to the Terms section.

**Acceptance criteria**
- [ ] No public page contains "Placeholder" or "do not rely on this".
- [ ] Public copy contains none of: "codebase", "registry", "runbook", "repository owner", "platform split", or "main" as a branch name.
- [ ] Contact shows a support address and a privacy address.
- [ ] Every legal page has the same header format.

#### F-02 · Team, organization and workspace used for the same concepts
**Severity:** High · **Screens:** S16, S31, S33, S41–S46

**Problem.** The org overview header says "Organization workspace and administration" but the body says "Team workspace overview and administration" (S33). The new-organization sheet says "Create a team workspace" (S31). Onboarding says the name "appears in the sidebar team switcher" (S16), but the sidebar shows an organization switcher. The default team is also named "Lucsum", the same as the organization, so both appear as "Lucsum" in the sidebar and breadcrumbs (S33, S46).

**Fix.** Define three terms and use them everywhere: **Organization** (top container), **Team** (group inside an organization), **Project** (holds environments and apps). Remove "workspace" from product copy except in marketing. Rename the default team so it is visibly different from the organization.

**Acceptance criteria**
- [ ] S16, S31, S33 and S41–S46 use only the glossary terms (see section 6).
- [ ] The sidebar switcher is called "organization" wherever it is named.
- [ ] The default team has a distinct name or a "Default" label.

#### F-03 · "Activity", "Audit timeline", "My activity" and "Audit events" used interchangeably
**Severity:** High · **Screens:** S04, S23, S29, S34, S39, S49

**Problem.** The same feature has different names. The account tab is labeled "Activity", the heading "Activity", and the breadcrumb "My activity" (S23). The top-level page is "My activity" (S29). The org page is "Organization activity" in the sidebar and "Organization activity" as title (S34). The Roles page says "Organization timeline — View organization audit timeline" (S39). Features says "Activity timeline" (S04). The project page says "Project activity … Audit events for this project" (S49). For an enterprise audience, the difference between activity and audit matters.

**Fix.** Use "Activity" as the one name for the feature. Put "audit" only in help text that explains the audit log, for example "Audit events for this project". Use one shared component for account, organization and project activity. Decide whether account activity and "My activity" are the same page. If they are, keep one.

**Acceptance criteria**
- [ ] Tab label, page title and breadcrumb match for every activity page.
- [ ] Account, org and project activity use the same component and column layout.
- [ ] No screen uses "Organization timeline" or "Activity timeline".

#### F-04 · "App" means product surfaces and installable project features
**Severity:** Medium · **Screens:** S04, S09, S47, S50, S51

**Problem.** "Apps" means three things: the Studio, Auth and Docs surfaces (Features: "the studio app"; Terms: "the platform split (auth, studio, mcp, docs)"), installable project features (Apps tab: "Install apps to add features to this project"), and specific features such as "Environments app" and "Tasks app" (Pricing).

**Fix.** Reserve "app" for installable project features only. Call product surfaces "dashboard", "sign-in" or "documentation". The sidebar and copy then match the product model.

**Acceptance criteria**
- [ ] User-facing copy uses "app" only for installable project features.
- [ ] Studio, Auth and Docs are described as dashboard, sign-in and documentation.

#### F-05 · Internal names and engineering terms appear in user-facing copy
**Severity:** Medium · **Screens:** S04, S07, S09, S11, S12, S14, S22, S60

**Problem.** Users see "Studio" as a product name ("Open Studio notifications", "Sign in to Studio"). Analytics vendor names appear in the cookie policy ("PostHog in Studio"). Features says the page is "grounded in how the studio app actually behaves" and mentions "MCP for agents". The ticket form says the team will reply "by email in production". These phrases belong to the team, not to customers.

**Fix.** Replace "Studio" with "dashboard" or the page name. Write analytics disclosures in plain language and keep vendor names only in the detailed cookie table. Remove build and environment language from marketing and form copy.

**Acceptance criteria**
- [ ] "Studio" does not appear in user-facing copy.
- [ ] "in production" and "grounded in how the … app actually behaves" are removed.
- [ ] Cookie and privacy copy names vendors only in a details table.

#### F-06 · "Grants", "linked teams" and "access source" are unexplained jargon
**Severity:** Medium · **Screens:** S39, S45, S46, S48

**Problem.** Project access copy reads: "Manage project managers, linked teams, and direct member grants" (S48). Team projects copy reads: "Linking this team gives its members the default project read grants. Unlinking removes this team as an access source. Direct grants stay saved, but a member needs another linked team for those grants to be effective" (S45). Team settings say "Project grants stay saved but need another linked team to remain effective" (S46). Roles says "Set member project grants" (S39).

**Fix.** Use "access" with plain nouns. Example: "Teams with access to this project", "People with direct access", and "Remove access". Explain the rule once in a sentence, for example "A person keeps access to a project through any team that has access to it."

**Acceptance criteria**
- [ ] "grant", "access source" and "linked team" do not appear in UI copy.
- [ ] The access rule is explained in one sentence on S45 and S48.

#### F-07 · Minor terminology drift
**Severity:** Low · **Screens:** S01, S02, S10–S13

**Problem.** The footer says "Docs" while the sidebar says "Documentation" (S01, S10). The DPA label is undefined; the page title is "Data processing (GDPR)" (S13). The changelog heading says "Changed" while the badge says "Improved" (S02). The changelog mentions "Collidr era" without explanation (S02).

**Fix.** Use one label per destination. Write "Data processing agreement (DPA)". Make changelog headings and badges use the same vocabulary, for example Added, Changed, Fixed and Security. Explain or remove "Collidr".

**Acceptance criteria**
- [ ] The footer and sidebar use the same label for documentation.
- [ ] DPA is defined on first use.
- [ ] Changelog headings and badges use the same words.

---

### B. Navigation and wayfinding

#### F-08 · Four application shells and two sidebar schemes for signed-in pages
**Severity:** High · **Screens:** S17–S26 (account), S27–S60 (studio), S10–S14 (legal), S03 (docs), S01/S04–S06/S08 (marketing)

**Problem.** Signed-in account pages use a sidebar group labeled "Platform" (S17–S26). Studio, organization, project and support pages use a group labeled "General" (S27–S60). Legal pages use a third shell with "Support", "Legal" and "Docs" groups (S10–S14). Docs have their own sidebar and header (S03). Marketing pages use a split layout with artwork (S01, S04–S06, S08). The same destination can look like a different app depending on the route.

**Fix.** Use one signed-in shell for account, organization, project and support pages. Use one group heading ("General") for the global sidebar. Keep the marketing and docs shells for public pages. Only sign-in, onboarding and error pages use the split layout.

**Acceptance criteria**
- [ ] Every signed-in route renders the same shell and sidebar group names.
- [ ] Account pages show the same sidebar as studio pages.
- [ ] Only sign-in, onboarding and access-denied use the split layout.

#### F-09 · Organization, team and project navigation repeated in sidebar, tabs and tiles
**Severity:** Medium · **Screens:** S33, S37, S41, S47

**Problem.** On org pages, the sidebar has an "Organization" group (Overview, Organization activity), and the page has an 8-tab bar (Overview, Members, Invitations, Teams, Roles & access, Projects, Activity, Organization settings). "Overview" and "Activity" appear in both. The sidebar also has "Teams" (All teams, Lucsum) and "Projects" (All projects, E-commerce), while the Teams and Projects tabs show the same lists again.

**Fix.** Keep the sidebar for places (Overview, Organizations, Activity, Notifications, Help, Settings). Keep the object's sections in one tab bar. Keep the "All X" lists in the sidebar only where they are navigation, and do not repeat them as tabs.

**Acceptance criteria**
- [ ] No label appears in both the sidebar and the tab bar for the same destination.
- [ ] The org tab bar has no more than 7 tabs, or it is grouped into labeled sections (for example, "People & access").

#### F-10 · Two back controls and repeated headings on the same page
**Severity:** Medium · **Screens:** S37, S47, S50, S54

**Problem.** The Projects page has a back arrow next to "Lucsum" and another next to "Projects" (S37). The project overview has a back arrow next to "E-commerce" and another next to "Overview" (S47). Apps and Project settings repeat the pattern (S50, S54). The account page shows a back arrow, a title and a breadcrumb that all say the same thing (S17).

**Fix.** Keep one back control, and only where the breadcrumb is not shown. Do not repeat the title as a section heading unless the section is a different object.

**Acceptance criteria**
- [ ] Each page shows at most one back control.
- [ ] Section headings do not repeat the page title.

#### F-11 · Breadcrumbs show raw IDs, skeleton bars and labels that do not match the title
**Severity:** Medium · **Screens:** S40, S41, S42–S47

**Problem.** The team overview and members pages show the raw 32-character team ID in the breadcrumb (S42, S44). Invitations, Projects and Settings for the same team show "Lucsum" (S43, S45, S46). Most project and organization pages show a grey skeleton bar where the organization name should be (S40, S41, S47, S53, S54). The breadcrumb on Environments says "Environments" while the tab says "Apps" (S51, S52).

**Fix.** Use the object's name in breadcrumbs, never its ID. Use one label per destination so the breadcrumb matches the page title and tab. Show the breadcrumb name from cached data so it does not flash a skeleton.

**Acceptance criteria**
- [ ] Breadcrumbs never show an ID; they show the object name.
- [ ] The last breadcrumb equals the page title.
- [ ] Breadcrumb names come from cached data, so no skeleton bar appears (*verify*).

#### F-12 · Tab set for the same object type changes between pages
**Severity:** Medium · **Screens:** S47, S49, S51

**Problem.** The project overview tab bar is Overview, Apps, Access, Invitations, Project settings (S47). The Project activity page shows the same five tabs with no "Project activity" tab (S49). The Environments page shows six tabs, including "Project activity" (S51). The tab set changes depending on where the user is.

**Fix.** Use the same tab list for an object type on every page. Show "Project activity" on every project page. If a tab is not available, disable it and show why in a tooltip.

**Acceptance criteria**
- [ ] S47, S49, S51, S52, S53, S54, S55 and S56 show the same project tab list.

#### F-13 · Identical subtitle repeated on every tab
**Severity:** Low · **Screens:** S33–S35, S39–S41, S42–S56

**Problem.** Every organization tab repeats "Organization workspace and administration." Every project tab repeats "Project workspace and applications." Every team tab repeats "Team members and project access." The subtitle does not help orientation on any tab.

**Fix.** Set a subtitle per page only when it adds information, or remove it from tabs.

**Acceptance criteria**
- [ ] No subtitle text repeats across tabs of the same object.

#### F-14 · Account tile grid duplicates the tab bar on the same screen
**Severity:** Medium · **Screens:** S17

**Problem.** The account landing page shows a tab bar (Profile, Security, Sessions, Connected accounts, Notifications, Activity, Danger zone) and a grid of tiles with the same seven destinations (S17). Two navigation patterns for the same destinations on one screen.

**Fix.** Remove the tile grid on desktop. Use the tab bar, and make Profile the default tab. If a tile grid is kept for mobile, it should appear only at narrow widths.

**Acceptance criteria**
- [ ] On desktop, account navigation uses one pattern.

---

### C. States

#### F-15 · Environments app is a dead end
**Severity:** Critical · **Screens:** S50, S51, S52

**Problem.** The Environments page is completely blank under the Apps tab (S51). The Environments app settings say "Environments isn't installed. Use Apps in the project navigation to install it before configuring it" but have no install button (S52). The Apps page shows two grey skeleton tiles with no labels (S50), and the README says Environments and Tasks are "apps available to install". The pricing page lists Environments as included (S06). The variables workflow, the product's core job, cannot be reached from the captured screens.

**Fix.** The Apps page shows each app as a card with its install state and an Install button. The Environments page for an uninstalled app shows an empty state with an Install button. Environments never renders a blank page: it shows a skeleton while loading, an empty state when not installed, and the variable table when installed. The first-run flow installs Environments and opens the first variable form.

**Acceptance criteria**
- [ ] S51 never renders a blank page.
- [ ] S52 has a primary Install action.
- [ ] On a new project, a user can install Environments and add a first variable in three clicks or fewer.
- [ ] App cards on S50 show a name, description and install state (*verify with loaded data*).

#### F-16 · Studio Overview is blank
**Severity:** High · **Screens:** S27, S28

**Problem.** The Studio Overview shows the heading "Overview" and the subtitle "Your workspace overview" and nothing else (S27, S28). The changelog says v1.17.0 added a dedicated Overview with organization favorites, but no favorites or content are rendered. This is the landing page after sign-in for every user.

**Fix.** Build the Overview as a dashboard: favorite organizations, recent projects, pending invitations and recent activity. For new users with no organizations, show an empty state with a "Create organization" action.

**Acceptance criteria**
- [ ] A user with no organizations sees an empty state with a "Create organization" button.
- [ ] A user with organizations sees favorites, recent projects and pending invitations.
- [ ] The page never renders only a heading.

#### F-17 · Loading states are inconsistent and some may be stuck (*verify*)
**Severity:** High · **Screens:** S18–S21, S23, S25, S26, S29, S32, S34–S36, S40–S45, S48–S50, S55, S56

**Problem.** Loading takes three forms: grey skeleton bars shaped differently on each screen (S18, S20, S21, S36, S44, S48), stacked spinners with no layout (S25), and blank space with only a heading (S19, S51). Some skeletons may be capture timing; others may be stuck. The account footer shows "Account" as a placeholder before the real name appears (S17 vs S18). Several pages show skeleton placeholders for content that should be static, such as the organization name in the breadcrumb.

**Fix.** Define one loading pattern per page template. Use skeletons that match the final layout. Never use spinners alone on a page. Show a loading state only after 300 ms, so fast pages do not flash. After 10 seconds, show an error with retry. Re-capture the affected screens after network idle to confirm which states are real.

**Acceptance criteria**
- [ ] After network idle, no route in the capture set shows a skeleton (*verify*).
- [ ] No page uses a spinner without a layout placeholder.
- [ ] Skeletons match the final content's height and columns.
- [ ] A request taking more than 10 seconds shows an error with a retry action.

#### F-18 · Empty states are inconsistent and most offer no action
**Severity:** Medium · **Screens:** S27, S51, S52, S53, S57, S58, S59

**Problem.** The notifications empty state is the best example in the product: icon, title, explanation and "Notification settings" action (S30). Other empty states differ. The Support tickets page says "No results." with no explanation or action (S57, S58), which implies a search was run. The project invitations page says "No pending invitations for this project." with no action (S53). The Environments settings page explains what to do but offers no button (S52). The project overview says "No project details added yet. Add details in Settings" as a text link (S47). The help center shows an empty search with no message (S59).

**Fix.** Use one EmptyState component: icon, title, one sentence explaining what will appear, and one primary action. Use "No results" only after a search or filter. Use "No tickets yet" with a New ticket button for the first-use case.

**Acceptance criteria**
- [ ] Every empty state has a title, explanation and a primary action (where an action exists).
- [ ] "No results" appears only after a search or filter returns nothing.
- [ ] The tickets page shows "No tickets yet" with a New ticket button.

#### F-19 · Access denied gives no next step; error and not-found states are not defined
**Severity:** Medium · **Screens:** S15

**Problem.** The access denied page says "You do not have permission to view this page" and offers only "Go home" (S15). It does not name the resource, explain how to get access or offer a contact. It uses the full-page split layout, so the user loses the app shell and navigation. No 404, server-error, offline or expired-session screens were captured.

**Fix.** Show the reason, the organization or project name where known, and actions: "Request access" (if the product supports it), "Switch organization" and "Go to Organizations". Keep the app shell when the user is signed in. Define 404, 500, offline and expired-session states using the same template.

**Acceptance criteria**
- [ ] Access denied shows the resource name, a reason and at least two actions.
- [ ] Signed-in error pages render inside the app shell.
- [ ] 404 and 500 pages exist and are tested.

---

### D. Settings and account

#### F-20 · Delete account copy contradicts itself
**Severity:** High · **Screens:** S24, S25

**Problem.** The "Delete account" row says "Soft-deletes your user and signs you out" (S24). The confirmation row says "Type your email to confirm. This cannot be undone" (S24). A soft delete usually means the data is kept and might be recoverable, so "cannot be undone" may be false. The typed-email field and the final confirmation are not visible in the capture (*verify*). The screen behind the delete row is a spinner (S25).

**Fix.** Say exactly what happens: what is deleted, what is kept, how long it is kept and whether the account can be restored. Use "cannot be undone" only if it is true. Use a confirmation dialog that lists the consequences and keeps the button disabled until the typed email matches. After deletion, sign the user out and show a message on the sign-in page.

**Acceptance criteria**
- [ ] The copy states retention and recoverability in plain language.
- [ ] "Cannot be undone" appears only if deletion is permanent.
- [ ] The delete button is disabled until the typed email matches (*verify*).
- [ ] The result after deletion is shown on the sign-in page.

#### F-21 · Notification preferences are a dead end (link out and back)
**Severity:** High · **Screens:** S22, S30

**Problem.** The account Notifications tab has a "Notification preferences" section that says "In-app notifications are managed in Studio. Open your inbox to mark items read" and offers "Open Studio notifications" (S22). It contains no preferences. The inbox empty state offers "Notification settings" (S30). Clicking that presumably returns the user to the same place, which is circular (*verify*). The privacy policy says in-app notifications are sent "when enabled" (S07), but no toggle exists.

**Fix.** Put actual preferences in the account Notifications tab: an in-app and email toggle for each event group (invitations, membership changes, project changes). The inbox empty state's "Notification settings" opens that tab. Keep only a secondary "View notifications" link on the preferences tab.

**Acceptance criteria**
- [ ] S22 has per-event, per-channel toggles.
- [ ] S30's "Notification settings" opens S22.
- [ ] S22 no longer contains "Open Studio notifications".

#### F-22 · Project fields collected at creation cannot be edited in settings
**Severity:** High · **Screens:** S38, S47, S54

**Problem.** The New project sheet asks for Description, Purpose, Documentation URL, Start date, Target date, Repository URL, Website URL and visibility (S38). The Project settings page offers only Name, Description, Public project, Repository URL and Website URL (S54). Purpose, Documentation URL and both dates have no edit field. The project overview says "No project details added yet. Add details in Settings" (S47), which sends the user to a page where those details cannot be entered.

**Fix.** Either add Purpose, Documentation URL and the dates to Project settings, or remove them from the creation sheet. Validate that the target date is not before the start date.

**Acceptance criteria**
- [ ] Every field in the creation sheet can be edited in Project settings.
- [ ] The overview's "Add details in Settings" link lands on a page with those fields.
- [ ] Target date cannot be earlier than start date.

#### F-23 · Project danger zone promises "Archive" and "Recently deleted" that do not exist
**Severity:** Medium · **Screens:** S54

**Problem.** The Danger zone heading says "Archive the project, or permanently delete it and its environments" (S54). Only a "Delete project" button is shown. Its copy says "If recovery is enabled, it appears in Recently deleted", but no "Recently deleted" location appears in the captured navigation. Project status also has a radio icon with no label next to a select (S54), so the status control is unclear.

**Fix.** Make the danger zone's description match its actions. Either add an Archive action or remove the word. Make "Recently deleted" reachable or remove the conditional copy. Label the status control and remove the stray radio icon.

**Acceptance criteria**
- [ ] The danger zone description lists only actions that exist.
- [ ] "Recently deleted" is reachable from navigation, or its copy is removed.
- [ ] The status control has a visible label.

#### F-24 · Submit and create labels are inconsistent across the app
**Severity:** Medium · **Screens:** S31, S35, S38, S39, S40, S41, S43, S46, S53, S54, S57, S60

**Problem.** Settings forms use four different submit labels: "Save profile" (S46), "Update project" (S54), "Save logo" (S40), and "Save changes" as a section heading (S54). Create actions use "Create role" (S39), "Create ticket" (S60), "Create Project" (S38) and "Create organization" (S31). Invite actions use "Invite member" (S35), "Invite to team" (S43) and "Invite to project" (S53). Opening a create flow uses "New project" (S37), "New team" (S41) and "New ticket" (S57). The project settings form says "Required fields marked in form" but no required markers are visible (S54).

**Fix.** Use verb-plus-object, sentence case, and the same verb for the same job:
- Open a creation flow: "New [object]".
- Submit a creation flow: "Create [object]".
- Submit a settings form: "Save changes" (disabled until something changes).
- Invite: "Invite [person type]" everywhere, with the object context in the dialog title.

**Acceptance criteria**
- [ ] Settings forms use "Save changes" and are disabled until the form is dirty.
- [ ] Creation sheets use "Create [object]" on submit.
- [ ] Invite buttons use "Invite [person]" across organization, team and project.

#### F-25 · Primary action placement and create container differ for the same job
**Severity:** Medium · **Screens:** S31, S37, S38, S39, S41, S46, S54, S57, S60

**Problem.** The primary action for a list page sits top-right ("New project" S37, "New team" S41, "New ticket" S57, "Invite to project" S53, "Invite member" S35). For forms, placement varies: "Create role" sits inline under a card (S39), "Create ticket" sits below a centered column (S60), "Create Project" sits in the sheet footer (S38), "Save profile" sits bottom-left of its card (S46), and "Update project" sits bottom-right of its card (S54). Creation also uses different containers: a side sheet for projects and organizations (S38, S31) and a full page for tickets (S60).

**Fix.** Use one rule for each job:
- Collection page: primary action top-right.
- Create a single object: side sheet with the footer action bottom-right.
- Multi-step setup: full page wizard (onboarding only).
- Settings form: "Save changes" bottom-right of the card or page footer.

**Acceptance criteria**
- [ ] All collection pages in the capture set place the primary action in the same header position.
- [ ] New ticket uses the same sheet pattern as New project, unless it is a multi-step flow.
- [ ] Save buttons sit in the same place in every settings card.

#### F-26 · Three form layouts and mixed required and optional markers
**Severity:** Medium · **Screens:** S38, S46, S54, S60

**Problem.** Forms use three layouts: centered stacked fields (ticket form, S60), label-left and field-right (project and team settings, S46, S54), and stacked fields in a sheet (new project, S38). Required markers differ too: an asterisk (S38, S31, S60 label marks), the helper text "Required." (team name, S46), and no marker at all (ticket subject and description, S60). Optional markers differ in casing: "(Optional)" (S38, Description), "(optional)" (S38, Purpose) and no marker (S38, Name is required with an asterisk).

**Fix.** Use one form layout per context (sheet forms stacked; settings label-left only if the page is wide enough). Mark required fields with an asterisk and a legend. Do not add "(optional)" to every optional field; mark only when the form is mostly required.

**Acceptance criteria**
- [ ] Every required field has an asterisk and a legend on every form.
- [ ] No form uses "Required." as helper text.
- [ ] Optional markers use one casing and one rule.

#### F-27 · Branding section has an orphan "OR", exposes implementation status and has no confirm
**Severity:** Medium · **Screens:** S40

**Problem.** The logo field has a circle labeled "OR" to the right of the URL input, with nothing on the other side (S40). The helper text says "Image uploads are not configured yet" (S40), which exposes build status to users. "Remove logo" sits beside "Save logo" without a visible confirmation (*verify*).

**Fix.** Remove the "OR" until uploads exist. Replace the helper text with a neutral instruction ("Use a public HTTPS image URL"). Make "Remove logo" confirm or offer undo.

**Acceptance criteria**
- [ ] No orphan "OR" in the Branding section.
- [ ] Helper text does not mention build or configuration status.
- [ ] Remove logo asks for confirmation or offers undo (*verify*).

#### F-28 · Collapsible card affordance (chevrons) is used inconsistently
**Severity:** Low · **Screens:** S17, S33, S39, S46, S47, S54

**Problem.** Some section cards have a chevron that collapses them (org overview S33, project overview S47, roles S39, team settings S46, project settings S54). Others have no chevron (account tile grid S17). The chevron on S33 looks like a control but the card content is short.

**Fix.** Show a chevron only on sections that can collapse. Make collapsible headers real buttons with `aria-expanded`.

**Acceptance criteria**
- [ ] Chevrons appear only on collapsible sections.
- [ ] Collapsible headers toggle with Enter and Space and expose expanded state.

---

### E. Access, roles and invitations

#### F-29 · Invitation model is unclear: team invites, org membership and project access overlap
**Severity:** High · **Screens:** S35, S43, S44, S53

**Problem.** The org invitations page says "Pending and recent email invitations for this workspace" and offers "Invite member" (S35). The team invitations page says "Invite someone to join this organization and team. They join as a team member and receive access through the team's current project links. Add existing organization members from the Members tab" (S43). The project invitations page says "Acceptance adds them to the organization if needed and gives default project read access" (S53). A user inviting to a team must understand that the invitee also joins the organization, inherits access through the team's projects, and may need a role. None of this is visible in the invite form, which was not captured (*verify*).

**Fix.** Use one invite dialog for all three places. Fields: email, organization role, optional teams, optional projects and access level. Show a summary before sending: "This person will be a member of [org], a member of [team], and can read [project]." Explain membership in one line at the top of every invitations page.

**Acceptance criteria**
- [ ] The three invitation entry points open the same dialog.
- [ ] The dialog shows a one-sentence access summary before sending.
- [ ] Invitation pages explain membership in one sentence.

#### F-30 · Roles copy and permission list do not match; custom roles are limited
**Severity:** High · **Screens:** S39

**Problem.** The Owner card says "Full control, including transferring or deleting the organization" (S39). The Owner permission list has 10 items, and none is "transfer" or "delete organization" (S39). The custom role form offers 3 permissions (Invite members, Manage teams, Organization timeline) against the Owner's 10 (S39). Manager permissions that are not granted appear greyed with a dash (S39), a state carried by colour and glyph only.

**Fix.** Make the Owner description match the list. Add "Transfer or delete organization" as a permission if it exists, or remove the claim. Show all permissions in the custom role form, grouped (Members, Teams, Projects, Access, Activity), or state explicitly that custom roles are a subset. Label denied permissions with text ("Not included").

**Acceptance criteria**
- [ ] The Owner description matches the Owner permission list.
- [ ] Custom role form shows every permission or states the limit in text.
- [ ] Not-granted items show the text "Not included", not only a dash.

---

### F. Lists and support

#### F-31 · Five different list patterns for the same kind of data
**Severity:** Medium · **Screens:** S32, S37, S41, S43, S53, S57

**Problem.** Projects use search, filters, sort and a grid/list toggle (S37). Teams use search and a table with pagination (S41). The Organizations directory uses cards with tabs and no search or sort (S32). Tickets use a sortable table with no search or filter (S57). Invitations use a status select and pagination with no search (S43, S53). Activity uses a timeline (S29, S34, S49). Members is not captured (*verify*).

**Fix.** Use one ListToolbar component (search when more than about 10 items, filter chips, sort) and one DataTable as the default. Use the card grid only where each item has a visual identity, such as projects. Use the timeline only for activity.

**Acceptance criteria**
- [ ] Every list page uses the same toolbar and table components.
- [ ] Search appears on any list with more than 10 items.
- [ ] Card grids are used only where each item has a visual identity.

#### F-32 · Pagination shown when there is only one page
**Severity:** Low · **Screens:** S41, S43, S45, S53

**Problem.** The teams list says "Page 1 of 1" with Previous and Next buttons (S41). The team projects list does the same (S45). The invitations pages show Previous and Next on empty lists (S43, S53).

**Fix.** Hide pagination when there is only one page.

**Acceptance criteria**
- [ ] Pagination is hidden when total pages is 1.
- [ ] Empty lists show an empty state, not pagination.

#### F-33 · Ticket form, help center and empty states need work
**Severity:** Medium · **Screens:** S57, S59, S60

**Problem.** The new-ticket subtitle says "we will follow up by email in production" (S60). The form has no required markers on Subject or Description (S60). The Tickets tab shows "No results." when the user has no tickets (S57). The help center has a search box and an "Open a ticket" text link but no articles, categories or message (S59). "Open a ticket" is a text link on the help tab, while "New ticket" is a button on the tickets tab (S57, S59). The page header, tab label and breadcrumb use three names for the same thing: "Support" (page), "Tickets" (tab), and "My tickets" (heading), with "Support / Tickets" as the breadcrumb (S57).

**Fix.** Remove build copy. Mark required fields. Show "No tickets yet" with a New ticket button. Show the most common help articles on the help center, or a link to documentation when there are none. Use one component for the create action on both tabs. Use one name for the tickets destination.

**Acceptance criteria**
- [ ] No "in production" or other build copy appears on the ticket form.
- [ ] Required fields are marked on the ticket form.
- [ ] The help center shows articles or a documentation link when empty.
- [ ] "Open a ticket" and "New ticket" use the same component.

---

### F. Public pages, marketing and onboarding

#### F-34 · Status page: "Landing" has no data and a URL is truncated
**Severity:** Medium · **Screens:** S08

**Problem.** The Landing row shows dashes for 30 and 90 days, no "Checked" time, and "No data" status while every other service shows 100% and "Up" (S08). The health-check URL for the API is truncated to "loftlancer.com/api/health l…" with no way to read the full text (S08).

**Fix.** Configure the Landing monitor, or remove the row. Show truncated text with a tooltip and an accessible full name. Link the incident history from the page.

**Acceptance criteria**
- [ ] Landing shows data or is removed.
- [ ] Truncated text has a tooltip and an accessible full name.

#### F-35 · Left artwork line crosses the quote text on split-layout pages
**Severity:** Medium · **Screens:** S01, S04, S05, S06, S08, S15

**Problem.** On all split-layout pages, the white artwork line passes through the quote text at the bottom left, covering the "v" in "variables" ("environment ariables") (S05, S01, S04, S06, S08, S15). The overlap affects legibility on every split-layout page.

**Fix.** Keep the quote in a clear area. Use a gradient scrim behind the quote, or move the quote above the artwork. Check contrast of the quote against its background.

**Acceptance criteria**
- [ ] No artwork line overlaps quote text at 1280, 1440 or 1920 px widths.
- [ ] Quote text meets 4.5:1 contrast on its background (*measure*).

#### F-36 · Features cards use an uneven grid and do not label "not hosted yet" items
**Severity:** Low · **Screens:** S04

**Problem.** The features cards are arranged as 3, then 1, then 2, centered (S04). The "MCP for agents (not hosted yet)" item is a text section with no status label.

**Fix.** Use a consistent 3-column grid on desktop, with 6 cards in two rows. Label unreleased items with a "Coming soon" badge.

**Acceptance criteria**
- [ ] Feature cards align to one grid.
- [ ] Unreleased features use a visible status label.

#### F-37 · Onboarding does not match sign-in, has no back or exit, and slug handling is unclear
**Severity:** Medium · **Screens:** S05, S16

**Problem.** The sign-in page shows a feature list on the left (S05). The onboarding page shows artwork and the quote only (S16). Step 2 (Project) has no back control and no exit (S16). The URL slug field is empty with a placeholder "acme-inc" (S16); the capture does not show whether it is generated from the name (*verify*).

**Fix.** Use the sign-in left panel on onboarding. Add Back on step 2 and an Exit link that says what will be lost. Generate the slug from the name, let the user edit it, and check availability (*verify current behaviour*). Remove the reference to a sidebar switcher unless one is shown.

**Acceptance criteria**
- [ ] Onboarding uses the same left panel as sign-in.
- [ ] Step 2 has a Back control and an Exit link.
- [ ] Slug is generated from name and editable, with an availability check (*verify*).

#### F-38 · Docs sidebar repeats group labels as child links
**Severity:** Low · **Screens:** S03

**Problem.** Each docs group heading repeats its first child: "Concepts > Concepts", "Guides > Guides", "MCP > MCP", "API > API", "Deploy > Deploy" (S03).

**Fix.** Make the group heading a non-interactive label and list the children beneath it, or make the heading a link to a real index page.

**Acceptance criteria**
- [ ] No group heading duplicates its first child label.

---

### G. Layout and polish

#### F-39 · Content and header overflow at wide widths; header avatar shifts
**Severity:** Medium · **Screens:** S37, S41, S44, S48

**Problem.** On the org projects, teams, team members and project access pages, content extends past the right edge of the main panel at around 1929 px (S37, S41, S44, S48). The header avatar sits further right on these pages (around x = 1970), while it sits at around x = 1889 elsewhere. "Next" on team members is cut off (S44).

**Fix.** Set one maximum content width for all pages with a consistent gutter. Fix the header controls to the same place on every page. Test at 1280, 1440, 1920 and 2560 px.

**Acceptance criteria**
- [ ] No horizontal scroll at 1280–2560 px.
- [ ] The header avatar sits in the same place on all signed-in pages.
- [ ] "Next" is fully visible on team members.

#### F-40 · Date and time formats differ across screens
**Severity:** Low · **Screens:** S02, S07, S08, S09, S33, S47

**Problem.** Lists use absolute dates ("Updated Oct 22, 2026", S33, S47). Status uses relative times ("3m ago", S08). Legal pages use month and year ("Last updated October 2026", S07, S09). Every changelog entry shows the same date, Oct 22, 2026 (S02), which may be correct or may be a generation artifact (*verify*).

**Fix.** Use absolute dates in tables ("Oct 22, 2026"), with the time on hover. Use relative times only in activity feeds. Use month and year only on legal pages. Use real release dates in the changelog.

**Acceptance criteria**
- [ ] Tables use one absolute date format.
- [ ] Relative times appear only in activity and status feeds.
- [ ] Changelog entries show their own release dates (*verify*).

#### F-41 · Small items: empty count pill, active "Mark all read", stray skeleton, unlabeled icon, empty column
**Severity:** Low · **Screens:** S27, S30, S33, S37, S54

**Problem.** The "Organizations" nav item has an empty pill with no count (S27). "Mark all read" is active when there are no notifications (S30). A stray skeleton bar sits under the loaded project card (S37). The project status control has a radio icon with no label (S54). The projects table on the org overview has a "Links" column header with no content (S33). The sidebar footer shows "v1.18.0" on every signed-in page, which is developer information.

**Fix.** Show a count only when there is one. Disable "Mark all read" when the count is zero. Remove the stray skeleton once the list is loaded. Remove the unlabeled icon. Remove the empty column or add its content. Move the version number to the Help page.

**Acceptance criteria**
- [ ] The count pill is hidden when there is no count.
- [ ] "Mark all read" is disabled when there are no unread items.
- [ ] No empty table columns appear.

---

### H. Accessibility and coverage

#### F-42 · Contrast, icon-only controls, color-only states, target size and focus need verification
**Severity:** High · **Screens:** All

**Problem.** The screenshots suggest several accessibility risks that need measurement, not assumption:

- **Contrast.** Helper text and placeholders are small grey text on near-black, for example "Brief description…" (S38, S54), "Star up to 3 organizations for quick access" (S17, S27), and the legal footers (S05). Measure every text token against WCAG AA (4.5:1 normal text, 3:1 large text and UI components) in both themes.
- **Icon-only controls.** The theme toggle, notification bell, avatar, sidebar toggle, row menu ("…", S37), star (S33) and accordion "+" (S06) appear to have no visible text label. Each needs an accessible name.
- **Color or glyph only.** Roles uses a check and a dash to show granted and denied permissions (S39). Changelog badges and dots use colour (S02). Danger actions are red (S24, S46, S54). Each state needs text as well as colour.
- **Target size.** Row menus, the star, the accordion "+" and the chevrons look small. Confirm they meet 24 × 24 CSS px.
- **Truncation.** The truncated status URL (S08) has no accessible full text.
- **Focus and keyboard.** Focus visibility, the keyboard path through the sidebar and the sheet, and focus trapping in dialogs cannot be judged from screenshots.
- **Reflow.** Content overflows at wide widths (F-39). Test reflow at 400% zoom and 320 px width.
- **Dark-only capture.** Every screenshot is dark. Light theme contrast is untested.

**Fix.** Run an automated audit (for example axe) and a manual keyboard and screen-reader pass on the 60 screens. Fix contrast tokens centrally in the Coss theme. Add accessible names to icon-only buttons, text labels to color-only states and minimum target sizes to the shared components.

**Acceptance criteria**
- [ ] All text meets WCAG AA contrast in both themes (*measure*).
- [ ] Every icon-only control has an accessible name.
- [ ] No state is conveyed by colour alone.
- [ ] Interactive targets are at least 24 × 24 CSS px.
- [ ] Sheets and dialogs trap focus and close on Escape.
- [ ] No content is lost or overlapped at 400% zoom.

#### F-43 · Important states, roles and widths are not in the capture set
**Severity:** Medium · **Screens:** All

**Problem.** The capture set covers one owner account at desktop width in dark theme. It does not include: light theme; mobile or narrow widths (the changelog mentions mobile work); a member or manager view; populated variable tables, task lists and invitations; invitation acceptance; error and 404 pages; the MCP, OAuth consent and device sign-in flows; and the secret reveal flow. Many findings above are therefore provisional.

**Fix.** Add these states to the capture plan before the next audit. Each state gets an inventory row, the same as S01–S60.

**Acceptance criteria**
- [ ] Captures exist for light theme, 375 px and 768 px widths, member and manager roles, populated project data, invitation acceptance, 404, 500 and the MCP, OAuth and device flows.

---

## 5. Cross-screen standards

These rules turn the findings into reusable patterns. Apply them to every screen in the product.

### CS-01 Page anatomy
Every signed-in page follows this order:
1. Breadcrumb (object names, never IDs; at most four levels).
2. Page title (object or section name).
3. One-line purpose (only if it adds information).
4. Primary action (top-right, collection pages only).
5. Tab bar (only for object-level sections).
6. Content.

Each page has at most one back control. On mobile, the breadcrumb becomes a back link.

### CS-02 Navigation hierarchy
- **Global sidebar** lists places: Overview, Organizations, Activity, Notifications, Help, Settings.
- **Object context in the sidebar** lists only the object's children (for example, projects in an organization). It does not repeat tab labels.
- **Tab bar** lists sections of the current object. The same object type always shows the same tabs, in the same order. Unavailable tabs are disabled with a tooltip.

### CS-03 Tab rules
Use one-word nouns. Keep "Activity" as the activity tab name everywhere. Do not add a tab that appears only on some pages.

### CS-04 Action rules
- **Open a creation flow:** "New [object]".
- **Submit a creation flow:** "Create [object]".
- **Submit a settings form:** "Save changes", disabled until the form is dirty and valid.
- **Invite a person:** "Invite [person]".
- **Destructive action:** only inside a Danger zone card at the bottom of settings, with a confirmation dialog.

Use sentence case throughout.

### CS-05 Creation containers
- **Single object with up to about 8 fields:** side sheet, footer action bottom-right.
- **Multi-step setup:** full-page wizard (onboarding only).
- **Destructive confirmation:** dialog (not a sheet).

### CS-06 Empty state anatomy
Icon, title, one sentence explaining what will appear, and one primary action where one exists. The notifications empty state (S30) is the reference.

### CS-07 Loading state
Skeletons that match the final layout. No spinner-only pages. Show loading after 300 ms. Show an error with retry after 10 seconds. The breadcrumb uses cached names so it does not flash.

### CS-08 Error state
Inline messages for field errors. Page-level errors show the reason and at least one next action, inside the app shell when the user is signed in. Never show a blank page.

### CS-09 Status and badge taxonomy
| Meaning | Style | Examples |
|---|---|---|
| Neutral | Grey | Draft, Archived |
| Success | Green | Active, Up, Accepted |
| Warning | Amber | Pending |
| Danger | Red | Failed, Deleted |
| Metadata | Icon plus text, no badge | Private (lock), Public (globe) |

Changelog labels map to the same vocabulary: Added, Changed, Fixed, Security.

### CS-10 Forms
- Label above the field.
- Required fields: asterisk plus a legend ("* Required").
- Optional fields: no suffix, unless most fields are required.
- Helper text under the field, never "Required." as helper text.
- Errors under the field, with the field marked as invalid.

### CS-11 Dates and times
- Tables: absolute dates ("Oct 22, 2026"), time on hover.
- Activity and status feeds: relative times with absolute on hover.
- Legal pages: "Last updated October 2026".

### CS-12 Lists
Use ListToolbar (search above about 10 items, filter chips, sort) and DataTable. Hide pagination when there is one page. Use card grids only where each item has a visual identity.

### CS-13 Settings pages
Sections are static cards by default. Collapse only long sections, with a visible chevron. Save changes sits at the bottom-right of its card. Danger zone is the last card.

### CS-14 Copy rules
- No internal product names ("Studio" as a product name).
- No engineering or build terms ("codebase", "registry", "runbook", "production", "main").
- No placeholder text on any public or signed-in page.
- Plain language first; define a term on first use if it must stay.

### CS-15 Accessibility baseline
- Text contrast at WCAG AA in both themes.
- Icon-only controls have accessible names.
- No colour-only state.
- Targets at least 24 × 24 CSS px.
- Focus visible, focus trapped in dialogs, Escape closes overlays.

---

## 6. Terminology glossary

| Use this | Not these (found in the product) | Where found |
|---|---|---|
| Organization | Team workspace, workspace | S16, S31, S33 |
| Team | Default team named the same as the organization | S41, S46 |
| Project | Workspace (in project subtitle) | S47–S56 |
| Activity | Audit timeline, Audit events, My activity (as page title), Organization timeline, Activity timeline | S04, S23, S29, S34, S39, S49 |
| App (installable project feature) | "The studio app", "platform split (auth, studio, mcp, docs)" | S04, S09, S50 |
| Environment (dev, staging, production) | "Environments" used for the app | S51, S52 |
| Access | Grants, direct member grants, linked teams, access source | S39, S45, S46, S48 |
| Permission | Permission policies | S39 |
| Invite [person] | Invite member, Invite to team, Invite to project, Invite someone | S35, S43, S53 |
| Delete | Remove, Soft-delete, Recently deleted (unless shown) | S24, S54 |
| Documentation | Docs (footer) | S01, S10 |
| Data processing agreement (DPA) | DPA alone | S13 |
| Added, Changed, Fixed, Security | Improved, New (as section headings) | S02 |
| Dashboard | Studio | S11, S22, S04 |

---

## 7. Component recommendations

Build these from existing Coss UI atoms (buttons, inputs, selects, badges, icons, tabs, dialogs, sheets, tables). Do not redesign the atoms.

| Component | Built from | Variants | Used on | Resolves |
|---|---|---|---|---|
| PageHeader | Text, breadcrumb, button | Collection, object, settings | All signed-in pages | F-10, F-11, F-13, F-25 |
| Breadcrumb | Text, link | Standard, mobile back | All signed-in pages | F-10, F-11 |
| TabNav | Tabs | Object tabs (fixed list) | Org, team, project | F-09, F-12 |
| SectionCard | Card | Static, collapsible | Settings, overview | F-28, CS-13 |
| DangerZone | Card, button, dialog | Single action, multiple actions | Account, project, team | F-20, F-23 |
| EmptyState | Icon, text, button | With action, without action | All lists and detail pages | F-16, F-18, F-33 |
| LoadingSkeleton | Skeleton | Per template (list, detail, form, card) | All pages | F-17 |
| ErrorState | Icon, text, button | Inline, page, access denied | All pages | F-19 |
| StatusBadge | Badge | Neutral, success, warning, danger | Projects, invitations, status | CS-09, F-41 |
| MetadataTag | Icon, text | Private, Public | Projects, lists | CS-09 |
| FormField | Label, input, helper, error | Required, optional | All forms | F-26, CS-10 |
| FormSheet | Sheet, form, footer | Single object | New project, New organization, New ticket | F-22, F-25 |
| ConfirmDialog | Dialog, input | Standard, typed confirmation | Delete account, delete project, delete team | F-20, F-23 |
| InviteDialog | Dialog, select, chips | Org, team, project (same dialog) | All invitation entry points | F-29 |
| PermissionChecklist | Checkbox, text | Read-only, editable | Roles | F-30 |
| ListToolbar | Input, filter chips, select | Search, filter, sort | Projects, teams, tickets, invitations | F-31 |
| DataTable | Table, pagination | Sortable, paginated | Teams, invitations, tickets | F-31, F-32 |
| ActivityFeed | List, timeline | Account, org, project | Activity pages | F-03 |
| NotificationPreferences | Toggle, group heading | Per channel | Account notifications | F-21 |
| LogoField | Input, button | URL only (until uploads exist) | Branding | F-27 |
| SplitAuthLayout | Layout, artwork, quote | Sign-in, onboarding, error | Sign-in, onboarding, access denied | F-08, F-35, F-37 |
| LegalDocLayout | Layout, heading, text | Legal page | Terms, Privacy, Acceptable use, Cookies, DPA, Security | F-01, CS-11 |

---

## 8. Prioritized roadmap

### P0: release blockers (before the next release)
- F-01 Placeholder and internal copy on public legal pages
- F-15 Environments app dead end
- F-17 Loading states (confirm real states, then fix)
- F-20 Delete account copy
- F-22 Project fields round-trip

### P1: next two sprints
- F-02 Team, organization and workspace terminology
- F-03 Activity terminology and duplication
- F-08 Application shells and sidebar scheme
- F-09 Triple navigation
- F-10 Double back controls
- F-11 Breadcrumbs
- F-12 Tab set consistency
- F-14 Account tile grid
- F-16 Studio Overview
- F-18 Empty states
- F-19 Access denied and error states
- F-21 Notification preferences
- F-23 Project danger zone
- F-24 Action labels
- F-25 Action placement and containers
- F-29 Invitation model
- F-30 Roles copy and permissions
- F-42 Accessibility verification and fixes

### P2: patterns and components
- F-04 "App" terminology
- F-05 Internal names in copy
- F-06 Access jargon
- F-26 Form layout and markers
- F-27 Branding section
- F-28 Chevrons
- F-31 List patterns
- F-32 Pagination
- F-33 Support pages
- F-34 Status page
- F-35 Artwork overlap
- F-37 Onboarding
- F-39 Layout overflow
- F-40 Date formats
- F-43 Capture coverage

### P3: polish
- F-07 Minor terminology
- F-13 Repeated subtitles
- F-36 Features grid
- F-38 Docs sidebar labels
- F-41 Small items

---

## 9. Coverage gaps and verification plan

1. **Re-capture the loading screens** after network idle and confirm which skeletons are real (F-17).
2. **Capture the missing states** listed in F-43, including light theme, narrow widths, a member role and populated data.
3. **Run an automated accessibility scan** on all 60 routes, then a manual keyboard and screen-reader pass on the sign-in, onboarding, project, invitation and settings flows (F-42).
4. **Measure contrast** on the text tokens, the quote over the artwork and the status badges (F-35, F-42).
5. **Confirm the invite dialog, the delete confirmation and the install flow** by performing them with a test account (F-15, F-20, F-29).

---

## 10. Limitations

- The audit is based on static screenshots. Interactions, hover states, keyboard behaviour and data-dependent states were not tested.
- All captures are desktop, dark theme, one owner account, one organization and one project.
- Contrast and target sizes are estimated visually. They must be measured before they are treated as defects.
- Items marked *verify* depend on loading timing or on states not visible in the captures.
- Personal details visible in some screenshots (the account name and email in the sidebar footer and the avatar) were not reproduced in this document. The team ID is referred to by description only.

---

## Appendix A: Screen inventory

Screenshot links below use the exact files in this evidence directory.

| ID | Screen | Source file | State captured |
|---|---|---|---|
| S01 | About | [about.jpg](screenshots/about.jpg) | Loaded |
| S02 | Changelog | [changelog.jpg](screenshots/changelog.jpg) | Loaded |
| S03 | Docs welcome | [docs.jpg](screenshots/docs.jpg) | Loaded |
| S04 | Features | [features.jpg](screenshots/features.jpg) | Loaded |
| S05 | Sign-in | [home.jpg](screenshots/home.jpg) | Loaded |
| S06 | Pricing | [pricing.jpg](screenshots/pricing.jpg) | Loaded |
| S07 | Privacy | [privacy.jpg](screenshots/privacy.jpg) | Loaded |
| S08 | Status | [status.jpg](screenshots/status.jpg) | Loaded; Landing shows no data |
| S09 | Terms | [terms.jpg](screenshots/terms.jpg) | Loaded |
| S10 | Acceptable use | [legal-acceptable-use.jpg](screenshots/legal-acceptable-use.jpg) | Placeholder copy |
| S11 | Contact | [legal-contact.jpg](screenshots/legal-contact.jpg) | Placeholder copy |
| S12 | Cookies | [legal-cookies.jpg](screenshots/legal-cookies.jpg) | Placeholder copy |
| S13 | DPA | [legal-dpa.jpg](screenshots/legal-dpa.jpg) | Placeholder copy |
| S14 | Security (legal) | [legal-security.jpg](screenshots/legal-security.jpg) | Placeholder copy |
| S15 | Access denied | [studio-forbidden.jpg](screenshots/studio-forbidden.jpg) | Error |
| S16 | Onboarding | [studio-onboarding.jpg](screenshots/studio-onboarding.jpg) | Loaded (wizard) |
| S17 | Account settings (tile grid) | [auth-settings.jpg](screenshots/auth-settings.jpg) | Loaded |
| S18 | Account profile | [auth-settings-profile.jpg](screenshots/auth-settings-profile.jpg) | Skeleton |
| S19 | Account security | [auth-settings-security.jpg](screenshots/auth-settings-security.jpg) | Heading only |
| S20 | Account sessions | [auth-settings-sessions.jpg](screenshots/auth-settings-sessions.jpg) | Skeleton |
| S21 | Connected accounts | [auth-settings-accounts.jpg](screenshots/auth-settings-accounts.jpg) | Skeleton |
| S22 | Account notifications | [auth-settings-notifications.jpg](screenshots/auth-settings-notifications.jpg) | Loaded (link out) |
| S23 | Account activity | [auth-settings-timeline.jpg](screenshots/auth-settings-timeline.jpg) | Skeleton |
| S24 | Danger zone | [auth-settings-danger.jpg](screenshots/auth-settings-danger.jpg) | Loaded |
| S25 | Danger zone (delete row) | [auth-settings-delete.jpg](screenshots/auth-settings-delete.jpg) | Spinner |
| S26 | Danger zone (export row) | [auth-settings-export.jpg](screenshots/auth-settings-export.jpg) | Skeleton |
| S27 | Studio overview | [studio.jpg](screenshots/studio.jpg) | Blank |
| S28 | Studio overview (repeat capture) | [studio-overview.jpg](screenshots/studio-overview.jpg) | Blank |
| S29 | My activity | [studio-activity.jpg](screenshots/studio-activity.jpg) | Skeleton |
| S30 | Notifications | [studio-notifications.jpg](screenshots/studio-notifications.jpg) | Empty |
| S31 | New organization sheet | [studio-new.jpg](screenshots/studio-new.jpg) | Form |
| S32 | Organizations directory | [studio-organizations-directory-1.jpg](screenshots/studio-organizations-directory-1.jpg) | Skeleton |
| S33 | Organization overview | [studio-lucsum.jpg](screenshots/studio-lucsum.jpg) | Loaded |
| S34 | Organization activity | [studio-lucsum-activity.jpg](screenshots/studio-lucsum-activity.jpg) | Skeleton |
| S35 | Organization invitations | [studio-lucsum-invitations.jpg](screenshots/studio-lucsum-invitations.jpg) | Skeleton |
| S36 | Organization members | [studio-lucsum-members.jpg](screenshots/studio-lucsum-members.jpg) | Skeleton |
| S37 | Organization projects | [studio-lucsum-projects.jpg](screenshots/studio-lucsum-projects.jpg) | Loaded (card) with skeleton below |
| S38 | New project sheet | [studio-lucsum-projects-new.jpg](screenshots/studio-lucsum-projects-new.jpg) | Form |
| S39 | Roles and access | [studio-lucsum-roles.jpg](screenshots/studio-lucsum-roles.jpg) | Loaded |
| S40 | Organization settings | [studio-lucsum-settings.jpg](screenshots/studio-lucsum-settings.jpg) | Partly loaded |
| S41 | Organization teams | [studio-lucsum-teams.jpg](screenshots/studio-lucsum-teams.jpg) | Skeleton rows |
| S42 | Team overview | [studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI.jpg](screenshots/studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI.jpg) | Skeleton |
| S43 | Team invitations | [studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-invitations.jpg](screenshots/studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-invitations.jpg) | Skeleton |
| S44 | Team members | [studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-members.jpg](screenshots/studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-members.jpg) | Skeleton |
| S45 | Team projects | [studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-projects.jpg](screenshots/studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-projects.jpg) | Skeleton |
| S46 | Team settings | [studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-settings.jpg](screenshots/studio-lucsum-teams-OVb1oXpeigx22f9FV0y6iDJsasnUDcgI-settings.jpg) | Loaded |
| S47 | Project overview | [studio-lucsum-e-commerce.jpg](screenshots/studio-lucsum-e-commerce.jpg) | Loaded; apps skeleton |
| S48 | Project access | [studio-lucsum-e-commerce-access.jpg](screenshots/studio-lucsum-e-commerce-access.jpg) | Skeleton |
| S49 | Project activity | [studio-lucsum-e-commerce-activity.jpg](screenshots/studio-lucsum-e-commerce-activity.jpg) | Skeleton |
| S50 | Project apps | [studio-lucsum-e-commerce-apps.jpg](screenshots/studio-lucsum-e-commerce-apps.jpg) | Skeleton tiles |
| S51 | Environments | [studio-lucsum-e-commerce-env.jpg](screenshots/studio-lucsum-e-commerce-env.jpg) | Blank |
| S52 | Environments settings | [studio-lucsum-e-commerce-env-settings.jpg](screenshots/studio-lucsum-e-commerce-env-settings.jpg) | Not installed |
| S53 | Project invitations | [studio-lucsum-e-commerce-invitations.jpg](screenshots/studio-lucsum-e-commerce-invitations.jpg) | Empty |
| S54 | Project settings | [studio-lucsum-e-commerce-settings.jpg](screenshots/studio-lucsum-e-commerce-settings.jpg) | Loaded |
| S55 | Tasks | [studio-lucsum-e-commerce-tasks.jpg](screenshots/studio-lucsum-e-commerce-tasks.jpg) | Skeleton |
| S56 | Tasks settings | [studio-lucsum-e-commerce-tasks-settings.jpg](screenshots/studio-lucsum-e-commerce-tasks-settings.jpg) | Skeleton |
| S57 | Support tickets | [studio-support.jpg](screenshots/studio-support.jpg) | Empty ("No results.") |
| S58 | Support tickets (repeat capture) | [studio-support-tickets.jpg](screenshots/studio-support-tickets.jpg) | Empty |
| S59 | Help center | [studio-support-help.jpg](screenshots/studio-support-help.jpg) | Empty |
| S60 | New ticket | [studio-support-tickets-new.jpg](screenshots/studio-support-tickets-new.jpg) | Form |

Note: the upload folder also contains `README.md`, which lists the intended capture set. It is the source for the coverage gaps in F-43.
