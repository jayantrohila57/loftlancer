"use client";

import { accountSettingsNav } from "@loftlancer/actions/nav";
import { BreadcrumbTrail } from "@loftlancer/ui/patterns/breadcrumb-trail";
import { routes } from "@loftlancer/ui/studio-routes";
import { usePathname } from "next/navigation";
import { studioDashboardPath } from "@/lib/studio-url";

const LABELS: Record<string, string> = {
  settings: "Account settings",
  profile: "Profile",
  security: "Security",
  sessions: "Sessions",
  accounts: "Connected accounts",
  notifications: "Notifications",
  export: "Export",
  delete: "Delete account",
  danger: "Danger zone",
  timeline: "My activity",
};

function segmentLabel(segment: string) {
  // Exact match only; the old fallback matched "/settings/profile" for every tab.
  const fromNav = accountSettingsNav.find(
    (item) => item.href === `/settings/${segment}`,
  );
  return LABELS[segment] ?? fromNav?.label ?? segment;
}

/**
 * Same header breadcrumb as studio (#329): the shared BreadcrumbTrail with
 * "/" separators; home goes to the studio org list.
 */
export function SettingsBreadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname() ?? "/settings";
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments[0] === "settings" ? segments.slice(1) : segments;
  const current = crumbs[crumbs.length - 1];

  return (
    <BreadcrumbTrail
      homeHref={studioDashboardPath(routes.home())}
      className={className}
      items={
        current
          ? [
              { href: "/settings", label: "Account settings" },
              { href: `/settings/${current}`, label: segmentLabel(current) },
            ]
          : [{ href: "/settings", label: "Account settings" }]
      }
    />
  );
}
