import type { ReactNode } from "react";
import { AccountSettingsFrame } from "@/module/settings/settings.frame";

/** Keep account identity and settings navigation mounted across section routes. */
export default function AccountSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AccountSettingsFrame>{children}</AccountSettingsFrame>;
}
