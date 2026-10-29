import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";
import { DangerSettingsView } from "@/module/settings/settings.danger.view";

export const metadata: Metadata = {
  title: "Danger zone",
  description: "Export your data or anonymize your profile and end access.",
};

export default async function DangerSettingsViewPage() {
  const session = await guardPageAction("profile.view");
  return <DangerSettingsView email={session.user.email} />;
}
