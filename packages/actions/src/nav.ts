import type { ActionName } from "./types";

export type NavItem = {
  href: string;
  label: string;
  action: ActionName | null;
};

/** Studio platform nav entries; each app resolves the href via its route builder (#300). */
export type PlatformNavKey =
  | "overview"
  | "organizations"
  | "projects"
  | "activity"
  | "notifications";

export type PlatformNavItem = {
  key: PlatformNavKey;
  label: string;
  action: ActionName | null;
  /** Needs an org in scope (hidden on user-level pages with no active org). */
  orgScoped: boolean;
};

export const platformNav: PlatformNavItem[] = [
  {
    key: "overview",
    label: "Overview",
    action: null,
    orgScoped: false,
  },
  {
    key: "organizations",
    label: "Organizations",
    action: "organization.list",
    orgScoped: false,
  },
  {
    key: "projects",
    label: "Projects",
    action: "project.read",
    orgScoped: true,
  },
  {
    key: "activity",
    label: "Activity",
    action: "audit.timeline.view.org",
    orgScoped: false,
  },
  {
    key: "notifications",
    label: "Notifications",
    action: "notification.list",
    orgScoped: false,
  },
];

/** Account app settings sidebar (`apps/auth`). */
export const accountSettingsNav: NavItem[] = [
  { href: "/settings/profile", label: "Profile", action: "profile.view" },
  { href: "/settings/security", label: "Security", action: "session.list" },
  { href: "/settings/sessions", label: "Sessions", action: "session.list" },
  {
    href: "/settings/accounts",
    label: "Connected accounts",
    action: "account.list",
  },
  {
    href: "/settings/notifications",
    label: "Notifications",
    action: "notification.list",
  },
  { href: "/settings/danger", label: "Danger zone", action: "account.delete" },
  {
    href: "/settings/timeline",
    label: "Activity",
    action: "audit.timeline.view.self",
  },
];
