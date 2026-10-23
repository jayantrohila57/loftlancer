"use client";

import { GithubIcon } from "@loftlancer/ui/github-icon";
import {
  SettingsFrame,
  type SettingsTab,
} from "@loftlancer/ui/patterns/settings-frame";
import { routes } from "@loftlancer/ui/studio-routes";
import { Bell, Monitor, ShieldAlert, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { studioDashboardPath } from "@/lib/studio-url";

const TABS: SettingsTab[] = [
  { href: "/settings/profile", label: "Profile", icon: <User /> },
  { href: "/settings/security", label: "Security", icon: <ShieldCheck /> },
  { href: "/settings/sessions", label: "Sessions", icon: <Monitor /> },
  {
    href: "/settings/accounts",
    label: "Connected accounts",
    icon: <GithubIcon />,
  },
  { href: "/settings/notifications", label: "Notifications", icon: <Bell /> },
  { href: "/settings/danger", label: "Danger zone", icon: <ShieldAlert /> },
];

export function AccountSettingsFrame({
  title = "Account settings",
  description = "Manage your profile and security settings.",
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const tabs = TABS.map((t) => ({
    ...t,
    active: pathname === t.href || pathname.startsWith(`${t.href}/`),
  }));

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={
        pathname === "/settings"
          ? {
              href: studioDashboardPath(routes.home()),
              label: "Dashboard",
            }
          : { href: "/settings", label: "Account settings" }
      }
      title={title}
      description={description}
      tabs={tabs}
    >
      {children}
    </SettingsFrame>
  );
}
