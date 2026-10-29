import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";
import { SecuritySettingsView } from "@/module/settings/settings.security.view";

export const metadata: Metadata = {
  title: "Security",
  description: "Sign-in and account protection.",
};

export default async function SecuritySettingsViewPage() {
  const session = await guardPageAction("session.list");
  return (
    <SecuritySettingsView
      email={session.user.email}
      userAgent={session.session.userAgent ?? null}
      ipAddress={session.session.ipAddress ?? null}
    />
  );
}
