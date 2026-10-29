import type { Metadata } from "next";
import { guardPageAction } from "@/lib/page-guards";
import { getConnectedAccounts } from "@/module/settings/settings.accounts.service";
import { AccountsSettingsView } from "@/module/settings/settings.accounts.view";

export const metadata: Metadata = {
  title: "Connected accounts",
  description: "OAuth providers linked to your profile.",
};

export default async function AccountsSettingsViewPage() {
  const session = await guardPageAction("account.list");
  const data = await getConnectedAccounts(session);
  return <AccountsSettingsView accounts={data} />;
}
