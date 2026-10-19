import type { Metadata } from "next";
import Link from "next/link";
import { isActionsAuditEnabledOnServer } from "@/lib/actions-audit-enabled";

export const metadata: Metadata = {
  title: "Account settings",
  description: "Choose which part of your account you want to manage.",
};

const sections = [
  ["Profile", "Update your name and profile image.", "/settings/profile"],
  ["Security", "Manage sign-in and security options.", "/settings/security"],
  [
    "Sessions",
    "Review active sessions and sign out devices.",
    "/settings/sessions",
  ],
  [
    "Connected accounts",
    "Manage linked identity providers.",
    "/settings/accounts",
  ],
  [
    "Notifications",
    "Choose how account notifications reach you.",
    "/settings/notifications",
  ],
  ["Activity", "Review activity on your account.", "/settings/timeline", true],
  ["Danger zone", "Export data or manage account removal.", "/settings/danger"],
] as const;

export default function SettingsIndexPage() {
  const showActivity = isActionsAuditEnabledOnServer();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sections
        .filter(([, , , audit]) => !audit || showActivity)
        .map(([title, description, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h2 className="font-medium text-sm">{title}</h2>
            <p className="mt-1 text-muted-foreground text-sm">{description}</p>
          </Link>
        ))}
    </div>
  );
}
