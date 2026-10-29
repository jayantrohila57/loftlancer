"use client";

import { GithubIcon } from "@loftlancer/ui/github-icon";
import { PageHeaderTabsRow } from "@loftlancer/ui/patterns/page-header";
import { resolveSettingsTabHref } from "@loftlancer/ui/settings-tabs";
import { Bell, Monitor, ShieldAlert, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/settings/profile", label: "Profile", icon: User },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
  { href: "/settings/sessions", label: "Sessions", icon: Monitor },
  { href: "/settings/accounts", label: "Connected accounts", icon: GithubIcon },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/danger", label: "Danger zone", icon: ShieldAlert },
];

export function AccountSettingsTabs() {
  const pathname = usePathname() ?? "";
  return (
    <PageHeaderTabsRow
      LinkComponent={Link as never}
      tabs={TABS.map(({ href, label, icon: Icon }) => ({
        value: href,
        href,
        label: (
          <>
            <Icon />
            {label}
          </>
        ),
      }))}
      activeTab={resolveSettingsTabHref(pathname, TABS)}
    />
  );
}
