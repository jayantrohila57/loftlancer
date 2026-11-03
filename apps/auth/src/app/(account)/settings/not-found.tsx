import { AppNotFoundPage } from "@features/patterns/core/client/patterns.app-route-states";

export default function SettingsNotFound() {
  return (
    <AppNotFoundPage
      links={{ homeHref: "/settings/profile", homeLabel: "Account settings" }}
    />
  );
}
