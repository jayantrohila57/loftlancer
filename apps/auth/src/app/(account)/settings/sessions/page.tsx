import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";
import { getActiveSessions } from "@/module/settings/settings.sessions.service";
import { SessionsSettingsView } from "@/module/settings/settings.sessions.view";

export const metadata: Metadata = {
  title: "Sessions",
  description: "Active sign-in sessions.",
};

export default async function SessionsSettingsViewPage() {
  const session = await guardPageAction("session.list");
  const data = await getActiveSessions(session.user.id);
  return (
    <SessionsSettingsView
      sessions={data}
      currentToken={session.session.token}
    />
  );
}
