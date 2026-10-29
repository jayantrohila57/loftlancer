import { Button } from "@loftlancer/ui/button";
import type { Route } from "next";
import Link from "next/link";
import { sessionDeviceLabel } from "@/lib/session-device";
import { SettingsPanel, SettingsRow } from "@/module/settings/settings.layout";

export function SecuritySettingsPanel({
  email,
  userAgent,
  ipAddress,
}: {
  email: string;
  userAgent: string | null;
  ipAddress: string | null;
}) {
  return (
    <SettingsPanel>
      <SettingsRow
        label="Sign-in email"
        description="Used for authentication and account recovery."
      >
        <span className="text-sm">{email}</span>
      </SettingsRow>
      <SettingsRow
        label="This device"
        description="The browser you are using right now."
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm">
            {sessionDeviceLabel(userAgent)}
          </span>
          <span className="text-muted-foreground text-xs tabular-nums">
            {ipAddress ?? "IP unknown"}
          </span>
        </span>
      </SettingsRow>
      <SettingsRow
        label="Active sessions"
        description="Review devices that are signed in."
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          render={<Link href={"/settings/sessions" as Route} />}
        >
          Manage sessions
        </Button>
      </SettingsRow>
      <SettingsRow
        label="Connected accounts"
        description="OAuth providers linked to this profile."
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          render={<Link href={"/settings/accounts" as Route} />}
        >
          Manage connections
        </Button>
      </SettingsRow>
    </SettingsPanel>
  );
}
