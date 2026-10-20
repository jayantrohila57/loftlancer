"use client";

import { GithubIcon } from "@loftlancer/ui/github-icon";
import {
  SettingsFrame,
  type SettingsTab,
} from "@loftlancer/ui/patterns/settings-frame";
import {
  Activity,
  Bell,
  Monitor,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { isActionsAuditEnabledOnClient } from "@/lib/actions-audit-enabled";

const TABS: (SettingsTab & { audit?: boolean })[] = [
  { href: "/settings/profile", label: "Profile", icon: <User /> },
  { href: "/settings/security", label: "Security", icon: <ShieldCheck /> },
  { href: "/settings/sessions", label: "Sessions", icon: <Monitor /> },
  {
    href: "/settings/accounts",
    label: "Connected accounts",
    icon: <GithubIcon />,
  },
  { href: "/settings/notifications", label: "Notifications", icon: <Bell /> },
  {
    href: "/settings/timeline",
    label: "Activity",
    icon: <Activity />,
    audit: true,
  },
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
  const audit = isActionsAuditEnabledOnClient();
  const tabs = TABS.filter((t) => !t.audit || audit).map(
    ({ audit: _a, ...t }) => ({
      ...t,
      active: pathname === t.href || pathname.startsWith(`${t.href}/`),
    }),
  );

  return (
    <SettingsFrame
      LinkComponent={Link as never}
      back={
        pathname === "/settings"
          ? undefined
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
