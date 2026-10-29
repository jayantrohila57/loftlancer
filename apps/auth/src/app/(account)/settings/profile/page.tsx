import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";
import { ProfileSettingsView } from "@/module/settings/settings.profile.view";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your display name and avatar.",
};

export default async function ProfileSettingsViewPage() {
  const session = await guardPageAction("profile.view");
  return (
    <ProfileSettingsView
      profile={{
        name: session.user.name ?? "",
        email: session.user.email,
        image: session.user.image ?? null,
      }}
    />
  );
}
